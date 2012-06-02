
# Server 端功能说明
PSD2HTML NODE Server 端主要用于处理由PSD2HTML.jsx生成的 *.txt(包含图片Slice和文字及其对应的位置、字体、颜色等信息的json对象) 和*.png文件(所处理的PSD文件的可见图层截图)，并根据此json配置信息和截图生成网页预览，或者生成最终的html和图片素材，然后将所有的资源打包、压缩并提供下载。 

# 部署说明：
**首先假定您的系统已经安装好node.js 推荐：V0.6.17 或以上版本。**<br/>
系统运行所依赖的node模块：express/jade/jsdom/canvas. <br/>
工程clone下来后，理论上说直接在server目录里执行：npm install -d 
就可以了，不过由于其中cavas(node-canvas)是基于cairo移植过来的，
所以需要cairo支持。同时如果要处理png和jpg，gif等图像，还需要安装
这几个库的相关支持。<br/>

一言以蔽之，按如下三个步骤即可实现系统部署：

## Mac 下部署说明：
### Canvas 相关依赖准备
由于cavas 依赖 cairo，而mac本身已经安装过cairo的，而且png和jpg相关库也已经安装过，而gif库暂时可以不用安装，如果你需要用node-canvas处理gif文件的话可以通过：

	brew install giflib

来安装gif依赖，不了解brew是什么的可以访问：http://mxcl.github.com/homebrew/

### 通过npm自动安装其他依赖模块
更新工程代码至最新，进入server目录，执行：

	npm install -d

该命令会自动将系统所依赖的node模块安装到server 目录下的node_modules目录里，头一次执行该命令可能需要花费的时间比较长，好在安装一次即可。如果添加了新的模块依赖还需要重新执行该命令。
### 启动应用
	node app.js

通过该命令即可启动应用，应用启动后在浏览器里访问：http://localhost:7777 即可。

## Ubuntu下部署说明
### Canvas 相关依赖准备(Ubuntu 12.04)
1. 安装cairo

	sudo apt-get install libcairo2-dev

2. 安装png、jpg、gif支持库

	sudo apt-get install libpng12-dev<br/>
	sudo apt-get install libjpeg-dev<br/>
	sudo apt-get install libgif-dev

**注意：**虽然跳过第二步，后面的node-canvas也可以安装成功，但是canvas.createJPEGStream方法或报系统错误，遇到这种情况，安装完第二步之后，要重新安装node-canvas，以便获得最新的jpeg等库的支持。

### 通过npm自动安装其他依赖模块
	同mac下第二步安装说明

### 启动应用
	同mac下第三步启动应用说明

## Windows下部署说明
暂时不予支持，感兴趣的可以自己尝试下，然后补充该说明。谢谢。

## 进阶说明：
1. 如果你需要进行node开发，推荐使用nodemon，会自动监视js代码是否有改动，如果有改动则自动重启应用，免除了手工停止、重启的麻烦，而且应用代码本身无须改动，无任何侵入性。安装方法：

	**npm install -g nodemon**
	
	安装完成后通过：<br/>
	**nodemop app.js**<br/>
	启动应用即可<br/>

2. node应用遇到意料之外的，未经处理的异常后会崩溃，终止服务。所以可以用forever来解决这个问题：可以在系统崩溃后自动重启应用从而保证应用的持续可用性。同样forever对应用代码无任何侵	入性。安装方法：<br/>
	**npm install -g forever**

	安装完毕后可以通过：

	***forever start app.js -m 1000***

	命令启动应用，该命令表示自动重启应用1000次，如果崩溃了1000次的话。forever的用处远不止这些，感兴趣的可以去研究下。

**NOTICE:** npm install -g 安装模块的时候加上"-g"参数表示该模块安装在系统级别而不是应用级别的，任何应用都可以使用该模块。
