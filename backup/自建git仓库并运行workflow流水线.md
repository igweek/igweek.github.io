使用gitea搭建仓库，配置act_runner。并通过仓库的workflow实现CI/CD（持续集成和持续交付/部署），其实官方文档写的已经很详细了，这里做下操作记录。

## gitea

官方简介

> Gitea 是一个轻量级的 DevOps 平台软件。从开发计划到产品成型的整个软件生命周期，他都能够高效而轻松的帮助团队和开发者。包括 Git 托管、代码审查、团队协作、软件包注册和 CI/CD。它与 GitHub、Bitbucket 和 GitLab 等比较类似。  
> ......  
> Gitea的首要目标是创建一个极易安装，运行非常快速，安装和使用体验良好 的自建 Git 服务。

## 搭建

使用docker进行安装

安装目录，其实是数据存放目录

```bash
mkdir /opt/gitea
```

创建docker-compose.yml文件

```bash
vi /opt/gitea/docker-compose.yml
```

路径/opt/gitea/data用来存储持久化数据

```yaml
networks:
  gitea:
    external: false

services:
  server:
    image: docker.gitea.com/gitea:1.24.2
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    networks:
      - gitea
    volumes:
      - /opt/gitea/data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
```

一键启动

```bash
docker compose -f /opt/gitea/docker-compose.yml up -d
```

然后访问服务器IP的3000端口即可进入安装页面

如果没什么要求，直接滑到下面直接点击安装即可，gitea有汉化翻译，下面选中即可  
![image.png](https://pic.myla.eu.org/file/V0J8RJfJ.png)

### 调整配置

安装完成后，如果没在安装的时候设置admin账号，那么注册的第一个用户就是admin账户

安装好之后的配置文件安装位置在`/opt/gitea/data/gitea/conf/app.ini`

一般改下面两项，一个是禁止注册，一个是必须登录才能看仓库

```
[service]
DISABLE_REGISTRATION = false
REQUIRE_SIGNIN_VIEW  = false
```

## 配置runner

我理解的runner就是gitea产生流水线任务的时候，会交给runner，runner会自己执行或者创建docker容器来执行

官方介绍地址[https://docs.gitea.com/zh-cn/usage/actions/act-runner](https://docs.gitea.com/zh-cn/usage/actions/act-runner)

先获取注册token

![image.png](https://pic.myla.eu.org/file/QZKVSvhN.png)

我这里是使用docker来执行，所以后续操作都要在已安装docker的机器上进行

创建安装目录

```bash
mkdir /opt/act_runner/
```

生成一个默认配置文件

```bash
docker run --entrypoint="" --rm -it docker.io/gitea/act_runner:0.2.12 act_runner generate-config > /opt/act_runner/config.yaml
```

## 启动

```bash
docker run --name act_runner -v /opt/act_runner/config.yaml:/config.yaml -v /opt/act_runner/data:/data -v /var/run/docker.sock:/var/run/docker.sock -e CONFIG_FILE=/config.yaml -e GITEA_INSTANCE_URL=http://服务器IP:3000/ -e GITEA_RUNNER_REGISTRATION_TOKEN=ra7uppoCcCq5O4NME0cCLOajZs0OnRVKP8nkWodv -e GITEA_RUNNER_NAME=act_runner -e GITEA_RUNNER_LABELS=local -d --restart unless-stopped gitea/act_runner:0.2.12
```

/var/run/docker.sock这个映射就是用来和系统上已经安装的docker进行通信的。

如果正常，在Runners Management里面应该可以看到一个runner了,他的标签是ubuntu-latest ubuntu-22.04 ubuntu-20.04这三个

## 使用action执行任务

## 自动删除合并的开发分支

平常git开发中，会创建master分支，然后创建develop分支。然后开发新功能的时候会迁出一个feature/xxx分支，开发完成合后提交pull_request进行合并到develop的分支上，合并通过后删除feature/xxx分支。

此处就写一个脚本，当以feature开头的分支合并到develop分支之后删除feature开头的分支。

先获取操作仓库的token用来给脚本执行删除分支使用。在用户的 设置-> 应用 -> 管理 Access Token 这里新建一个token就可以了，权限主要是把repository的读写勾选上，生之后只会展示一次，所以要记得及时保存。

在仓库的 设置 -> action -> 密钥 中新增一个secret，值就是生成的token，名字我这里写的是RELEASE_TOKEN，同时因为要执行curl请求，所以我也设置了一个RELEASE_URL 值是当前gitea服务器:端口

从develop新建一个分支feature/clean-merged-branch-action

```bash
git checkout -b feature/clean-merged-branch-action
```

编辑文件.gitea/workflows/clean_merged_branch.yaml并写入以下内容

```yaml
# 名称
name: Clean Merged Feature Branches (Gitea)

# 触发任务的时机
on:
  pull_request:
    # 目标分支是develop
    branches: ["develop"]
    # 状态关闭，合并完成的话就是关闭
    types: ["closed"]

# 定义任务
jobs:
  cleanup-feature-branch:
    # 判断确实是合并完成并且触发任务的分支名称是feature/开头
    if: ${{ github.event.pull_request.merged && startsWith(github.event.pull_request.head.ref, 'feature/') }}
    runs-on: ubuntu-latest
    # 操作步骤
    steps:
      # 就一步，执行curl用API请求一下就删除了
      - name: Delete feature branch
        env:
          GITEA_URL: ${{ secrets.RELEASE_URL }}
          GITEA_TOKEN: ${{ secrets.RELEASE_TOKEN }}
          BRANCH: ${{ github.event.pull_request.head.ref }}
          REPO_OWNER: ${{ github.repository_owner }}
          REPO_NAME: ${{ github.event.repository.name }}
        run: |
          curl -X DELETE \
            -H "Authorization: token $GITEA_TOKEN" \
            -H "Content-Type: application/json" \
            "$GITEA_URL/api/v1/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH"
```

github的版本如下`.github/workflows/rm-merged-feature.yml`，直接使用actions/github-script@v7利用api操作即可

```yaml
name: Clean Merged Feature Branches

on:
  pull_request:
    branches: ["develop"]
    types: ["closed"]

jobs:
  cleanup-feature-branch:
    if: github.event.pull_request.merged == true && startsWith(github.head_ref, 'feature/')
    runs-on: ubuntu-latest
    steps:
      - name: Delete feature branch
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.RELEASE_TOKEN }}
          script: |
            await github.rest.git.deleteRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: `heads/${context.payload.pull_request.head.ref}`
            })
```

## 自动发布打包

以前学rust的时候写的github上用的，当打tag比如v1，v1.2之类的标签推到远程时，会自动发布release。打三个平台版本的包

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: taiki-e/create-gh-release-action@v1
        with:
          token: ${{ secrets.RELEASE_TOKEN }}

  upload-assets:
    needs: create-release
    strategy:
      matrix:
        include:
          - target: x86_64-unknown-linux-gnu
            os: ubuntu-latest
          - target: x86_64-apple-darwin
            os: macos-latest
          - target: x86_64-pc-windows-msvc
            os: windows-latest
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: taiki-e/upload-rust-binary-action@v1
        with:
          bin: http_echo_ip
          target: ${{ matrix.target }}
          tar: unix
          zip: windows
          token: ${{ secrets.RELEASE_TOKEN }}
```

## 自动发布docker镜像

和上面一样在github上写的，要先设置docker的secret

```yaml
name: Publish Version
on:
  push:
    tags:
      - "v*"

env:
  DOCKERHUB_REPO: evlan/http_echo_ip
  APP_VERSION: ${{ github.ref_name }}

jobs:
  pulish-docker-images:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          platforms: linux/amd64,linux/arm64
          tags: ${{ env.DOCKERHUB_REPO }}:latest,${{ env.DOCKERHUB_REPO }}:${{ env.APP_VERSION }}
```
