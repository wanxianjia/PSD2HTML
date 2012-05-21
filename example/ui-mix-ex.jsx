var res ="dialog { \
text:'直接保存并关闭',\
        group: Group{orientation: 'column',alignChildren:'left',\
                top:StaticText{text:'默认为直接覆盖保存 - 请注意选择或做好备份'},\
                timeline:Progressbar{bounds:[0,0,300,10] , minvalue:0,maxvalue:100}\
                corrdination: Panel { orientation: 'row', \
                        text: '需要尺寸', \
                                x: Group { orientation: 'row', \
                                        s: StaticText { text:'宽:' }, \
                                        e: EditText { preferredSize: [50, 20] } ,\
                                        p: StaticText { text:'px' }, \
                                        }, \
                                y: Group { orientation: 'row', \
                                        s: StaticText { text:'高:' }, \
                                        e: EditText { preferredSize: [50, 20] }, \
                                        p: StaticText { text:'px' }, \
                                        } ,\
                                }, \
                a:Group{ orientation: 'row', \
                                c: Checkbox { text:' 保持原图宽高比，新尺寸仅作外框限定',helpTip:'原图比例不变,调整后宽/高均小于等于输入值'} ,\
                                }, \
                b:Group{ orientation: 'row', \
                                c: Checkbox { text:' 不判断原图横竖',helpTip:'不根据原图的横竖自动对应尺寸,宽/高均以输入为准'} ,\
                                }, \
                now:Group{ orientation: 'row', \
                                c: Checkbox { text:' 对文件夹进行操作（否则处理所有目前打开的文档）'} ,\
                                }, \
                folderO:Group{ orientation: 'row', \
                                b: Button {text:'待处理文件夹', properties:{name:'open'} ,helpTip:'选择您需要处理的文件所在的文件夹'},\
                                s: EditText  { text:'', preferredSize: [180, 20] },\
                                },\
                shui:Group{ orientation: 'row', \
                                c: Checkbox { text:' 为图片添加水印'} ,\
                                g: Group {\
                                        one:RadioButton {text:'单一' ,helpTip:'只添加一个水印图,可控制添加位置'},\
                                        fill:RadioButton {text:'平铺' ,helpTip:'多个水印图平铺布满画面,可控制间距'},\
                                    }\
                                }, \
                shuiSet: Panel {orientation: 'row', \
                        text: '水印设置', \
                                    position:Group{ orientation: 'column',alignChildren:'left',\
                                                po1:Group{ orientation: 'row',\
                                                    c1:Checkbox { helpTip:'以左上角为基准', preferredSize: [14, 14]} ,\
                                                    c2:Checkbox { helpTip:'以上中点为基准', preferredSize: [14, 14]} ,\
                                                    c3:Checkbox { helpTip:'以右上角为基准', preferredSize: [14, 14]} ,\
                                                    }, \
                                                po2:Group{ orientation: 'row', \
                                                    c4:Checkbox { helpTip:'以左中点为基准', preferredSize: [14, 14]} ,\
                                                    c5:Checkbox { helpTip:'以正中心为基准', preferredSize: [14, 14]} ,\
                                                    c6:Checkbox { helpTip:'以右中点为基准', preferredSize: [14, 14]} ,\
                                                    }, \
                                                po3:Group{ orientation: 'row', \
                                                    c7:Checkbox { helpTip:'以左下角为基准', preferredSize: [14, 14]} ,\
                                                    c8:Checkbox { helpTip:'以下中点为基准', preferredSize: [14, 14]} ,\
                                                    c9:Checkbox { helpTip:'以右下角为基准', preferredSize: [14, 14]} ,\
                                                    }, \
                                    },\
                                    other:Group{ orientation: 'column',alignChildren:'left',\
                                                dis:Group{ orientation: 'row',\
                                                    s1: StaticText { text:'平距:'}, \
                                                    e1: EditText { preferredSize: [55, 20], helpTip:'距离参照点的水平距离;平铺状态下为间距(单位:像素)' } ,\
                                                    s2: StaticText { text:'垂距:'}, \
                                                    e2: EditText { preferredSize: [55, 20], helpTip:'距离参照点的垂直距离;平铺状态下为间距(单位:像素)' } ,\
                                                },\
                                                hun:Group{ orientation: 'row',\
                                                    s: StaticText { text:'混合:'}, \
                                                    d:DropDownList { alignment:'left', itemSize: [50,16] },\
                                                    s2: StaticText { text:'缩放:'}, \
                                                    e:EditText{ preferredSize: [38, 20], text:'1',helpTip:'水印与原始水印文件的缩放比例'},\
                                                },\
                                                open:Group{ orientation: 'row', \
                                                    b: Button {text:'选择水印文件', properties:{name:'open'} ,helpTip:'请确保文件为常用图片格式,且非gif动画'},\
                                                    e: EditText  { text:'', preferredSize: [86, 20] },\
                                                },\
                                    },\
                                },\
                other:Group{ orientation: 'row', \
                                c: Checkbox {text:' 启用另存'} ,\
                                g: Group {\
                                        jpeg:RadioButton {text:'JPEG'},\
                                        gif:RadioButton {text:'GIF'},\
                                        psd:RadioButton {text:'PSD'},\
                                        tiff:RadioButton {text:'TIFF'},\
                                    }\
                                }, \
                otherSet: Panel {orientation: 'column',alignChildren:'left',\
                        text: '另存设置', \
                        Quality: Group { orientation: 'row',  \
                                    c: Checkbox { text:'转换 ICC 配置',helpTip:'在储存前将 ICC 配置文件转换为 sRGB'} ,\
                                    s: StaticText { text:'压缩质量:' }, \
                                    d: DropDownList { alignment:'left', itemSize: [26,14] },\
                                    c2:Checkbox {text:'透明',helpTip:'包含基于颜色不透明度的透明性'},\
                                    }, \
                        head: Group { orientation: 'row',  \
                                    s: StaticText { text:'在文件名前添加字符:' }, \
                                    e: EditText { preferredSize: [50,20] } ,\
                                    s2: StaticText { text:'勿含非法字符' , enabled:flase }, \
                                    }, \
                        foot: Group { orientation: 'row',  \
                                    s: StaticText { text:'在文件名后添加字符:' }, \
                                    e: EditText { preferredSize: [50, 20] }, \
                                    s2: StaticText { text:'勿含非法字符' , enabled:flase}, \
                                    } ,\
                        otherF:Group{ orientation: 'row', \
                                    c: Checkbox { text:' 另存至其他文件夹'} ,\
                                    }, \
                        folderS:Group{ orientation: 'row', \
                                    b: Button {text:'另存至', properties:{name:'save'} ,helpTip:'选择您处理好的文件要保存至的文件夹'},\
                                    s: EditText  { text:'', preferredSize: [180, 20] },\
                                    },\
                        icc: Checkbox { text:' 储存时包含 ICC 配置文件',helpTip:'存为 GIF 格式时此选项无效'},\
                        },\
                },\
        buttons: Group { orientation: 'row', alignment: 'right',\
                s:StaticText {text:'[ABOUT]'},\
                Btnok: Button { text:'确定', properties:{name:'ok'} }, \
                Btncancel: Button { text:'取消', properties:{name:'cancel'} } \
                }, \
}";
var win = new Window(res);
win.show();