## 基于Ubuntu22.04部署openstack

### 整体规划
![截屏2025-09-23 22.42.05_副本.png](https://pic.myla.eu.org/file/nSZwLa2t.png)
*   **操作系统**: Ubuntu 22.04 LTS
*   **OpenStack 版本**: Zed
*   **部署工具**: OpenStack-Ansible
*   **节点1 (Controller)**: `controller`, IP `192.168.10.11` (也作为部署机)
*   **节点2 (Compute)**: `compute`, IP `192.168.10.12`

---

### 第一步：基础环境准备 (在两个节点上执行)

1.  **硬件要求 & VMware 设置**:
    *   Controller: 建议 4核 CPU, 8GB 内存, 60GB 硬盘。
    *   Compute: 建议 4核 CPU, 8GB 内存, 100GB 硬盘。
    *   **关键**: 在 VMware 虚拟机的 "处理器" 设置中，必须勾选 **"虚拟化Intel VT-x/EPT 或 AMD-V/RVI"**。

2.  **安装并配置全新的 Ubuntu 22.04 Server**:
    *   在安装过程中，选择 "OpenSSH server" 以便远程连接。
    *   建议使用 LVM (逻辑卷管理) 进行磁盘分区，方便后续扩展。

3.  **网络配置**:
    Ubuntu Server 使用 `netplan` 来管理网络。
    *   编辑配置文件：`sudo vi /etc/netplan/00-installer-config.yaml`
    *   为每个节点配置静态IP。

    **Controller (`192.168.10.11`) 的配置示例**:
    ```yaml
    network:
      ethernets:
        ens160: # 替换成你的实际网卡名
          dhcp4: no
          addresses:
            - 192.168.10.11/24
          gateway4: 192.168.10.1 # 替换成你的网关
          nameservers:
            addresses: [223.5.5.5, 119.29.29.29] # 国内推荐的DNS
      version: 2
    ```
    **Compute (`192.168.10.12`) 的配置示例**:
    ```yaml
    network:
      ethernets:
        ens160: # 替换成你的实际网卡名
          dhcp4: no
          addresses:
            - 192.168.10.12/24
          gateway4: 192.168.10.1 # 替换成你的网关
          nameservers:
            addresses: [223.5.5.5, 119.29.29.29]
      version: 2
    ```
    *   应用配置：`sudo netplan apply`

4.  **设置主机名和 hosts 文件**:
    *   在 Controller 上: `sudo hostnamectl set-hostname controller`
    *   在 Compute 上: `sudo hostnamectl set-hostname compute`
    *   **在两个节点上** 编辑 `/etc/hosts` 文件，添加IP和主机名映射：
        ```
        192.168.10.11  controller
        192.168.10.12  compute
        ```

5.  **系统更新**:
    ```bash
    sudo apt update
    sudo apt upgrade -y
    sudo reboot
    ```

6.  **时间同步**:
    Ubuntu 默认使用 `systemd-timesyncd`，通常无需额外配置。确认其状态：
    ```bash
    timedatectl status
    # 确保 "System clock synchronized: yes"
    ```

---

### 第二步：在 Controller 节点上准备部署环境

**接下来的操作只在 `controller` 节点上执行。** Controller 节点将作为 "Deployment Host"，从中运行 Ansible 来配置所有节点（包括它自己）。

1.  **安装 Git 和依赖**:
    ```bash
    sudo apt update
    sudo apt install -y git python3-venv
    ```

2.  **克隆 OpenStack-Ansible 仓库**:
    我们将克隆 `Zed` 版本的仓库。

    ```bash
    git clone https://opendev.org/openstack/openstack-ansible.git -b stable/zed
    cd openstack-ansible
    ```

3.  **运行引导脚本**:
    这个脚本会创建一个Python虚拟环境，并安装 Ansible 和其他所有必需的依赖项。
    ```bash
    scripts/bootstrap-ansible.sh
    ```
    *   这个过程会下载很多包，需要一些时间。

4.  **激活虚拟环境**:
    引导脚本完成后，会提示你 `source` 一个激活脚本。
    ```bash
    source /usr/local/bin/openstack-ansible.rc
    ```
    *   **重要**: 每次你新开一个终端准备运行 `openstack-playbook` 命令时，都需要先执行这个 `source` 命令。

---

### 第三步：配置 OpenStack-Ansible

配置文件位于 `/etc/openstack_deploy`。

1.  **复制示例配置文件**:
    ```bash
    sudo cp -r etc/openstack_deploy /etc/
    ```

2.  **定义你的 OpenStack 环境 (`openstack_user_config.yml`)**:
    这是最重要的配置文件，它定义了你的节点角色和网络。
    ```bash
    sudo vi /etc/openstack_deploy/openstack_user_config.yml
    ```
    你需要修改 `hosts` 部分，告诉 Ansible 哪个 IP 对应哪个角色。

    **修改后的 `openstack_user_config.yml` 示例**:
    ```yaml
    # ... (文件顶部的注释保持不变) ...

    # 定义所有参与部署的主机，分为不同的组
    shared-infra_hosts:
      controller:
        ip: 192.168.10.11
    
    os-infra_hosts:
      controller:
        ip: 192.168.10.11

    network_hosts:
      controller:
        ip: 192.168.10.11

    compute_hosts:
      compute:
        ip: 192.168.10.12

    storage_hosts:
      # 我们先不部署Cinder/Swift，所以这里为空或注释掉
      # controller:
      #   ip: 192.168.10.11

    log_hosts:
      controller:
        ip: 192.168.10.11

    # ... (文件后面的内容可以保持默认) ...
    ```
    *   **解释**: 我们将`controller`节点分配给了所有基础设施、网络和日志角色，而`compute`节点只分配给了计算角色。

3.  **设置密码 (`user_secrets.yml`)**:
    为了安全，所有密码都保存在一个受 Ansible Vault 加密的文件中。为了简化，我们先明文设置，再加密。

    *   复制模板：`sudo cp /etc/openstack_deploy/user_secrets.yml.example /etc/openstack_deploy/user_secrets.yml`
    *   编辑文件：`sudo vi /etc/openstack_deploy/user_secrets.yml`
    *   **务必**找到并设置一个自己的密码，例如 `keystone_auth_admin_password`。

4.  **配置网络接口 (`user_variables.yml`)**:
    我们需要告诉 Ansible 使用哪个网络接口作为管理网络和外部网络桥接。

    *   编辑文件：`sudo vi /etc/openstack_deploy/user_variables.yml`
    *   在文件末尾添加以下内容 (假设你的网卡是 `ens160`):
    ```yaml
    ---
    # 全局覆盖变量
    openstack_host_management_network_interface: ens160
    neutron_provider_networks:
      - network_name: flat-provider
        network_type: flat
        network_flat_physical_network: physnet1

    # 对于计算节点，需要指定桥接的物理网卡
    neutron_linuxbridge_agent_bridge_interfaces:
      - physnet1:ens160
    ```
    *   **解释**: 这段配置定义了一个名为 `flat-provider` 的外部网络，它将通过 `linuxbridge` 直接桥接到每个节点上的 `ens160` 网卡。

---

### 第四步：执行 Ansible Playbooks 进行部署

**所有命令都在 `controller` 节点的 `openstack-ansible` 目录下执行，并确保已激活虚拟环境 (`source ...`)**

部署分为几个阶段：

1.  **设置主机 (Setup Hosts)**:
    这个 playbook 会在所有节点上进行基础配置，如安装NTP、配置仓库等。
    ```bash
    cd /opt/openstack-ansible # openstack-ansible 克隆后的默认安装位置
    openstack-playbook setup-hosts.yml
    ```

2.  **部署基础设施 (Setup Infrastructure)**:
    安装核心服务，如MariaDB, RabbitMQ, Memcached。
    ```bash
    openstack-playbook setup-infrastructure.yml
    ```

3.  **部署 OpenStack 服务 (Setup OpenStack)**:
    安装Keystone, Glance, Nova, Neutron等所有OpenStack核心服务。
    ```bash
    openstack-playbook setup-openstack.yml
    ```
    *   **注意**: 这一步是整个过程中最耗时的，可能会持续1-2小时，取决于你的硬件和网络。屏幕会滚动大量 Ansible 任务的输出。

---

### 第五步：验证部署

1.  **访问 Horizon Dashboard**:
    *   在浏览器中访问 `http://192.168.10.11` (默认没有`/dashboard`后缀)。
    *   用户名: `admin`
    *   密码: 你在 `user_secrets.yml` 中为 `keystone_auth_admin_password` 设置的密码。

2.  **使用命令行 (CLI)**:
    *   在 `controller` 节点上，Ansible 会自动创建一个 admin 的 OpenRC 文件。
    *   加载环境变量：
        ```bash
        source /etc/openstack_deploy/openrc
        ```
    *   检查服务状态：`openstack service list`
    *   检查计算节点状态：`openstack compute service list`
    *   检查网络代理状态：`openstack network agent list`