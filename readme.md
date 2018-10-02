# CG-18-19-2

## Prerequisites

1. nodejs & npm, 通过 npm 安装 gulp 和 typescript:
   * `npm install -g gulp typescript`
2. vscode, 需要安装的插件有：
   * Debugger for Chrome
3. Chrome浏览器。


## Development

1. clone到本地后，用vscode打开repo文件夹，在终端中运行`npm install`；
2. 通过`Ctrl+Shift+B`或`终端->运行生成任务`运行gulp server(端口为8080)；
3. 在左侧的调试界面中，任选一个任务运行：
   * 此后，按`F5/Ctrl+F5`便可直接运行当前任务；
   * 每一个任务对应一次作业，每个作业单独用一个文件夹存放；
   * 每次添加新作业时，按照launch.json中格式新增一个条目即可。
4. 每次修改ts/js文件，gulp服务器便会自动编译并刷新浏览器，从而实现自动化开发流程_(:зゝ∠)_
