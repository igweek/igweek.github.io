## 一、Git是什么？

Git是一种分布式版本控制系统，用于跟踪文件的更改，特别是计算机代码文件的更改。它旨在更好地协调程序员之间的工作，帮助他们管理项目中的代码修改。Git最初由Linus Torvalds于2005年开发，现在已成为最流行的版本控制系统。

## 二、Git能做什么？

### **版本控制**：

- Git能记录文件的历史变化，允许开发者回溯到任何一个历史版本，查看代码的变化历史。
- 通过对比不同版本，开发者可以了解每次修改的具体内容。

### **分支管理**：

- Git允许开发者创建独立的分支来开发新功能或修复bug，而不会影响主分支。
- 分支可以随时合并，将不同分支的更改合并到一个统一的版本。

### **协作开发**：

- 多个开发者可以同时在不同的分支上工作，彼此之间的工作互不干扰。
- 通过GitHub、GitLab等平台，开发者可以方便地进行代码审查、讨论和协作。

### **备份和恢复**：

- Git的分布式特性使得每个开发者的本地仓库都是一个完整的备份，可以在任何时候恢复数据。
- 遇到数据丢失或错误时，可以很容易地恢复到之前的状态。

### **代码审查和质量保证**：

- 通过pull request或merge request，团队成员可以审查代码，确保代码质量。
- 通过Git的钩子机制，可以在提交或合并代码时执行自动化测试。

## 三、怎么做？

- **初始化仓库**：
  - `git init`：在当前目录初始化一个新的Git仓库。
  - `git clone <repository>`：克隆一个现有的远程仓库到本地。
- **基本操作**：
  - `git add <file>`：将文件添加到暂存区，准备提交。
  - `git commit -m "message"`：提交暂存区的文件到本地仓库。
  - `git status`：查看工作目录和暂存区的状态，显示哪些文件被修改、哪些文件被暂存。
- **分支管理**：
  - `git branch`：查看所有分支。
  - `git branch <branch-name>`：创建一个新的分支。
  - `git checkout <branch-name>`：切换到指定分支。
  - `git merge <branch-name>`：将指定分支合并到当前分支。
- **远程操作**：
  - `git remote add <name> <url>`：添加一个新的远程仓库。
  - `git fetch`：从远程仓库获取更新但不合并。
  - `git pull`：从远程仓库获取更新并合并到当前分支。
  - `git push`：将本地提交推送到远程仓库。
- **查看历史和比较**：
  - `git log`：查看提交历史。
  - `git diff`：查看未暂存的改动。
  - `git diff <branch1> <branch2>`：比较两个分支的差异。
- **恢复操作**：
  - `git reset`：撤销提交或将HEAD指针移到某个提交。
  - `git revert`：生成一个新的提交来撤销某个历史提交的更改。

## 四、常用命令总结

![image.png](https://img.myla.eu.org/file/052ac12be8a121ae92c58.png)

```bash
git init                                    # 初始化本地git仓库（创建新仓库）
git config --global [user.name](http://user.name/) "xxx"           # 配置用户名
git config --global user.email "[xxx@xxx.com](mailto:xxx@xxx.com)"     # 配置邮件
git config --global color.ui true             # git status等命令自动着色
git config --global color.status auto
git config --global color.diff auto
git config --global color.branch auto
git config --global color.interactive auto
git config --global --unset http.proxy  # remove proxy configuration on git
git clone git+ssh://git@192.168.53.168/VT.git             # clone远程仓库
git status                         # 查看当前版本状态（是否修改）
git add xyz                        # 添加xyz文件至index
git add .                          # 增加当前子目录下所有更改过的文件至index
git commit -m 'xxx'                # 提交
git commit --amend -m 'xxx'        # 合并上一次提交（用于反复修改）
git commit -am 'xxx'               # 将add和commit合为一步
git rm xxx                         # 删除index中的文件
git rm -r *                        # 递归删除
git log                            # 显示提交日志
git log -1                         # 显示1行日志 -n为n行
git log -5
git log --stat                     # 显示提交日志及相关变动文件
git log -p -m
git show dfb02e6e4f2f7b573337763e5c0013802e392818  # 显示某个提交的详细内容
git show dfb02                          # 可只用commitid的前几位
git show HEAD                           # 显示HEAD提交日志
git show HEAD^           # 显示HEAD的父的提交日志 ^^为上两个版本 ^5为上5个版本
git tag                                 # 显示已存在的tag
git tag -a v2.0 -m 'xxx'                # 增加v2.0的tag
git show v2.0                           # 显示v2.0的日志及详细内容
git log v2.0                            # 显示v2.0的日志
git diff                                # 显示所有未添加至index的变更
git diff --cached                    # 显示所有已添加index但还未commit的变更
git diff HEAD^                          # 比较与上一个版本的差异
git diff HEAD -- ./lib               # 比较与HEAD版本lib目录的差异
git diff origin/master..master # 比较远程分支master上有本地分支master上没有的
git diff origin/master..master --stat      # 只显示差异的文件，不显示具体内容
git remote add origin git+ssh://git@192.168.53.168/VT.git # 增加远程定义（用于push/pull/fetch）
git branch                                                # 显示本地分支
git branch --contains 50089                               # 显示包含提交50089的分支
git branch -a                                             # 显示所有分支
git branch -r                               # 显示所有原创分支
git branch --merged                         # 显示所有已合并到当前分支的分支
git branch --no-merged                      # 显示所有未合并到当前分支的分支
git branch -m master master_copy            # 本地分支改名
git checkout -b master_copy         # 从当前分支创建新分支master_copy并检出
git checkout -b master master_copy          # 上面的完整版
git checkout features/performance           # 检出已存在的features/performance分支
git checkout --track hotfixes/BJVEP933      # 检出远程分支hotfixes/BJVEP933并创建本地跟踪分支
git checkout v2.0                           # 检出版本v2.0
git checkout -b devel origin/develop        # 从远程分支develop创建新本地分支devel并检出
git checkout -- README                      # 检出head版本的README文件（可用于修改错误回退）
git merge origin/master                     # 合并远程master分支至当前分支
git cherry-pick ff44785404a8e               # 合并提交ff44785404a8e的修改
git push origin master                      # 将当前分支push到远程master分支
git push origin :hotfixes/BJVEP933          # 删除远程仓库的hotfixes/BJVEP933分支
git push --tags                             # 把所有tag推送到远程仓库
git fetch                                   # 获取所有远程分支（不更新本地分支，另需merge）
git fetch --prune                           # 获取所有原创分支并清除服务器上已删掉的分支
git pull origin master                      # 获取远程分支master并merge到当前分支
git mv README README2                       # 重命名文件README为README2
git reset --hard HEAD         # 将当前版本重置为HEAD（通常用于merge失败回退）
git rebase
git branch -d hotfixes/BJVEP933         # 删除分支hotfixes/BJVEP933（本分支修改已合并到其他分支）
git branch -D hotfixes/BJVEP933          # 强制删除分支hotfixes/BJVEP933
git ls-files                             # 列出git index包含的文件
git show-branch                          # 图示当前分支历史
git show-branch --all                    # 图示所有分支历史
git whatchanged                          # 显示提交历史对应的文件修改
git revert dfb02e6e4f2f7b573337763e5c0013802e392818       # 撤销提交dfb02e6e4f2f7b573337763e5c0013802e392818
git ls-tree HEAD                         # 内部命令：显示某个git对象
git rev-parse v2.0            # 内部命令：显示某个ref对于的SHA1 HASH
git reflog                               # 显示所有提交，包括孤立节点
git show HEAD@{5}
git show master@{yesterday}              # 显示master分支昨天的状态
git log --pretty=format:'%h %s' --graph        # 图示提交日志
git show HEAD~3
git show -s --pretty=raw 2be7fcb476
git stash                          # 暂存当前修改，将所有至为HEAD状态
git stash list                         # 查看所有暂存
git stash show -p stash@{0}            # 参考第一次暂存
git stash apply stash@{0}              # 应用第一次暂存
git grep "delete from"              # 文件中搜索文本“delete from”
```

create a new repository on the command line
```shell
echo "# wrlsj" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/twaak/cssj.git
git push -u origin main
```
push an existing repository from the command line
```shell
git remote add origin https://github.com/twaak/cssj.git
git branch -M main
git push -u origin main
```