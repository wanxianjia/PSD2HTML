# Class PSD
## properise:
#### doc
>
@description 当前PSD文档  
@type Document  

#### docs
>
@description PS中所有打开的文档  
@type Documents

#### linkReg
>
@description 链接规则正则  

#### output  
>
@description 输出文件夹  
@type Folder

#### dir
>
@description output中PSD对应的输出文件夹  
@type Foolder

#### option
>
@description 配置
{  
	exportImages: true //是否导出每个图层对应的图片  
}  
@type Object

## methods：
#### parseLayers
>
@description 解析所有图层，其他需要用的图层信息的方法都依赖该方法（即必须先调用该方法后才会产生图层信息）  
@param Layers 默认值：this.activeDocument.layers  
@param Object 默认值：this.tree  
@param Function 默认值：function(layer){}，设置跳过对当前图层的解析条件，return true即跳过。  

#### getEffects
@description 获取activeLayer的样式  

#### getWidth
>
@return Number PSD文档宽度

#### getHeight
>
@return Number PSD文档高度

#### getPSDName
>
@return String PSD文档名

#### exportPng
>
@description 导出PSD对应的png-24图片

#### exportImage
>
@description 导出图层对应的图片  
@param Layer 图层  
@param Number 图层序号

#### exportJSON
>
@description 导出PSD文档的图层数信息  
@param String 文件编码，default:'UTF-8'

#### getJSON
>
@description 获取PSD文档的图层数信息  
@return Object

#### visibleTextLayers
>
@description 显示所有解析时被隐藏的文本图层

#### autoSliceAndExport
>
@description 自动对PSD文件切片并导出切片  
@param Object 导出配置，默认值：SaveDocumentType.JPEG   
@param Number 切片高度，默认值：根据算法自动计算高度  

#### getTextLayers
>
@description 获取所有文本图层信息  
@return Array

#### getTextLayersAndSlices
>
@description 获取所有文本图层信息和切片信息  
@param Object 导出配置，默认值：SaveDocumentType.JPEG   
@param Number 切片高度，默认值：根据算法自动计算高度  
@return Object  

#### getTextRange
>
@description 获取activeLayer的text range信息  
