# CG-18-19-2

## Prerequisites

1. Node.js & npm, 通过 npm 安装 gulp 和 typescript: `npm install -g gulp typescript`
2. VSCode, 推荐安装的插件有：
  * Debugger for Chrome
  * Shader languages support for VS Code
  * glsl-canvas
  * 3D Viewer for VSCode
3. Chrome 浏览器。（当然用 FireFox 也可以，需要自己改对应插件和 `launch.json` 相关设置。


## Development

1. `git clone`到本地后，用 VSCode 打开文件夹，在终端中运行 `npm install`；
2. 通过 `Ctrl+Shift+B` 或`终端->运行生成任务`运行 Gulp Server (端口为8080)；
3. 在左侧的调试界面中，任选一个任务运行：
  * 此后，按 `F5/Ctrl+F5` 便可直接运行当前任务；
  * 每个任务对应一次作业，单独用一个文件夹存放；
  * 调试新作业时，在`launch.json`中新增一个条目即可。
4. 每次修改代码，Gulp 服务器便会自动 Build 并刷新浏览器。


## Project Structure

关于环境开发与项目架构的详细文档，请移步 #1。

* /core:
  `webgl-extension.ts` -- 对 WebGL 的浅浅 API 以扩展的形式添加一层高级封装。 
  `canvas.ts` -- 对 WebGL 与 Canvas 上下文环境的完整封装。
  `2d-figures.ts` -- 对 `Canvas` 类进行 2D 绘图的扩展。 
* /defense: 最终的研讨 PPT 文件夹。
* /0.quickstart: 只用原生 API 简单地跑通 WebGL 环境。
* /0.quickstart_ts: 利用 /core 里封装的 API，简单画了几种 2D 图形。
* /1.peppa-pig: 第一次研讨，画了小猪佩奇，详见 #2。
* /2.i-is-fish: 第二次研讨，画了两种3D鱼(TODO: 画第三个)，详见 #3。

