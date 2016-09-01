/**
 * Created by yuechen .
 */
;(function ($) {
    var Cropper = function ($obj) {
        var self = this;
        self.cropper = $obj;        // 控件对象
        self.imgObj = new Image();      // 图片对象
        self.displayImgSize = {width: 0, height: 0};       // 实际显示图片大小
        self.canvasSize = {width: 0, height: 0};       // canvas的大小
        self.clipBoxPosition = {x: 0, y: 0};    // 剪辑区域左上角相对于背景的坐标值x,y
        self.clipBoxPositionCanvas = {x:0,y:0};    // 剪辑区域左上角相对于canvas的属性值x,y
        self.rotateImgPostionCanvas = {x1: 0, y1: 0,x2:0,y2:0,x3:0,y3:0,x4:0,y4:0};    // 图片在canvas左上角顶点的坐标
        self.startMovePositionCanvas = {x: 0, y: 0};       // 开始移动的位置
        self.movePositionCanvas = {x: 0, y: 0};       // 实时移动的位置
        self.dataReturn = {};
        self.startDegree = 0;
        self.imgNaturalScale = 1;      // 图片的缩放比例
        self.currentCanvasPosition = {x: 0, y: 0};       // 实时移动的位置
        self.canMove = false;   // 判断是否可以移动，默认不行
        self.setting = {
            "aspectRatio": 5 / 3,       // 图片宽高比例
            "imgSrc": "images/1.jpg",    // 图片路径
            "margin": 0,        // 设置图片距离两边的边距值
            "containerBgSize": 0,  // 背景容器比图片多出多少像素
            "imgOpacity": 0.4,    // 设置图片的不透明度
            "autoSetClipBoxSize": true,  // 自动设置裁剪框 ,默认为false,裁剪框比例为defaultClipBoxRatio 如果改为true，则需要在调整clipBoxWidth的值，然后通过aspectRatio来计算高度
            "defaultClipBoxRatio": 0.8,  // 设置默认裁剪大小为canvas宽度的80%
            "clipBoxWidth": 300,     // 裁剪框宽度 再根据比例自动计算高度
            "dragImage": true,  // 是否可以拖拽图片
            "defaultDegree":0,  // 默认旋转角度
            "rotateDegree": 0,        // 旋转角度的值用于重置函数
            "rotateDegreeSize": 10,      // 每次点击旋转的角度数
            "imgScale": 1,   // 默认图片缩放值
            "imgScaleSize": 0.1,  // 每次缩放比例
            "isRotated": false   // 判断是否旋转过 默认没有旋转过
        };
        // 扩展默认参数，如果有同样的参数则替换，没有则追加
        $.extend(self.setting, self.getSettingData());
        // 页面初始化
        self.initial();         // 在initial函数中将DOM结构追加到HTML中
        // 绑定事件
        var totalMoveX = 0, totalMoveY = 0;
        self.dragBox.on("touchstart", function (e) {
            self.canMove = true;
            var startPosition = {
                x: e.originalEvent.targetTouches[0].clientX,
                y: e.originalEvent.targetTouches[0].clientY
            };
            self.startMovePositionCanvas = self.windowToCanvas(self.canvasBgCtx, startPosition);
        });
        self.dragBox.on("touchmove", function (e) {
            e.preventDefault();     // 阻止默认事件发生，避免微信中上下移动的时候出现其他信息
            if (self.canMove) {
                // 移动图片还是移动裁剪框
                if (self.setting.dragImage) {
                    // 获得当前的位置信息
                    var touches = {
                        x: e.originalEvent.targetTouches[0].clientX,
                        y: e.originalEvent.targetTouches[0].clientY
                    };
                    self.movePositionCanvas = self.windowToCanvas(self.canvasBgCtx, touches);
                    self.rotateImgPostionCanvas = self.rotatePosition(self.canvasBgCtx, self.setting.rotateDegree);
                    var moveX = self.movePositionCanvas.x - self.startMovePositionCanvas.x;
                    var moveY = self.movePositionCanvas.y - self.startMovePositionCanvas.y;
                    totalMoveX += moveX;        // 总共移动的X轴的距离
                    totalMoveY += moveY;        // 总共移动的Y轴的距离
                    // 移动的时候实时记录图片四个点的坐标值
                    var x1 = self.rotateImgPostionCanvas.x1 += totalMoveX;
                    var x2 = self.rotateImgPostionCanvas.x2 += totalMoveX;
                    var x3 = self.rotateImgPostionCanvas.x3 += totalMoveX;
                    var x4 = self.rotateImgPostionCanvas.x4 += totalMoveX;
                    var y1 = self.rotateImgPostionCanvas.y1 += totalMoveY;
                    var y2 = self.rotateImgPostionCanvas.y2 += totalMoveY;
                    var y3 = self.rotateImgPostionCanvas.y3 += totalMoveY;
                    var y4 = self.rotateImgPostionCanvas.y4 += totalMoveY;
                    self.dataReturn.x -= moveX;
                    self.dataReturn.y -= moveY;
                    self.startMovePositionCanvas = {
                        x: self.movePositionCanvas.x,
                        y: self.movePositionCanvas.y
                    };






                    // 当前图像四个点的坐标值
                    var imgPoint1 = {x:x1,y:y1};
                    var imgPoint2 = {x:x2,y:y2};
                    var imgPoint3 = {x:x3,y:y3};
                    var imgPoint4 = {x:x4,y:y4};
                    var minX = Math.min(imgPoint1.x,imgPoint2.x,imgPoint3.x,imgPoint4.x);
                    var minY = Math.min(imgPoint1.y,imgPoint2.y,imgPoint3.y,imgPoint4.y);
                    var currentMinXPoint ={x:0,y:0};
                    var currentIndexX = 0;
                    var currentIndexY = 0;
                    if(imgPoint1.x == minX){
                        currentMinXPoint = imgPoint1;
                        currentIndexX = 1;
                        self.overflowBorderX(imgPoint1,currentIndexX);
                    }else if(imgPoint2.x ==minX){
                        currentMinXPoint = imgPoint2;
                        currentIndexX = 2;
                        console.log(currentIndexX,imgPoint2);
                    }else if(imgPoint3.x == minX){
                        currentMinXPoint = imgPoint3;
                        currentIndexX = 3;
                        console.log(currentIndexX,imgPoint3);
                    }else if(imgPoint4.x == minX){
                        currentMinXPoint = imgPoint4;
                        currentIndexX = 4;
                        if(imgPoint4.x>self.clipBoxPositionCanvas.x){
                            self.rotateImgPostionCanvas.x1 = self.clipBoxPositionCanvas.x;
                        }
                    }
                    var currentMinYPoint = {x:0,y:0};
                    if(imgPoint1.y == minY){
                        currentMinYPoint = imgPoint1;
                        currentIndexY = 1;;
                        if(imgPoint1.y>self.clipBoxPositionCanvas.y){
                            // 限制X1的x值
                            self.rotateImgPostionCanvas.y1 = self.clipBoxPositionCanvas.y;
                        }
                    }else if(imgPoint2.y ==minY){
                        currentMinYPoint = imgPoint2;
                        currentIndexY = 2;
                        console.log(currentIndexY,imgPoint2);

                    }else if(imgPoint3.y == minY){
                        currentMinYPoint = imgPoint3;
                        currentIndexY = 3;
                        console.log(currentIndexY,imgPoint3);

                    }else if(imgPoint4.y == minY){
                        currentMinYPoint = imgPoint4;
                        currentIndexY = 4;
                        console.log(currentIndexY,imgPoint4);
                    }

                    //if(currentMinYPoint.y>self.clipBoxPositionCanvas.y){

                    //    console.log(imgPoint1,imgPoint2,imgPoint3,imgPoint4);
                    //    self.canMove = false;
                    //    if(currentIndexY == 1){
                    //
                    //    }else if(currentIndexY == 2){
                    //
                    //    }else if(currentIndexY == 3){
                    //
                    //    }else{
                    //
                    //    }
                    //}
                    //if(currentMinXPoint.x > self.clipBoxPositionCanvas.x){
                    //    if(currentIndexX == 1){
                    //
                    //    }else if(currentIndexX == 2){
                    //
                    //    }else if(currentIndexX == 3){
                    //
                    //    }else{
                    //
                    //    }
                    //
                    //}




                    //console.log(self.rotateImgPostionCanvas.x1,self.rotateImgPostionCanvas.y1);
                    // 判断是否超出边界框,超出就canvas就不能移动
                    //self.overflowBorder();
                    //self.setCanvasPosition(0,0);
                    self.cropperDraw(self.canvasBgCtx, self.rotateImgPostionCanvas.x1 + moveX, self.rotateImgPostionCanvas.y1 + moveY, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);
                    self.cropperDraw(self.canvasClipCtx, self.rotateImgPostionCanvas.x1 + moveX, self.rotateImgPostionCanvas.y1 + moveY, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);

                } else {
                    // 移动裁剪框
                }

            }
        });
        self.dragBox.on("touchend", function (e) {
            self.canMove = false;
            // 设置当前canvas的位置信息
            //self.currentCanvasPosition.x = self.canvasBg.position().left;
            //self.currentCanvasPosition.y = self.canvasBg.position().top;
            // 判断是否超出边界框,超出就canvas就不能移动
            //self.overflowBorder();
            //self.setCanvasPosition(0,0);
            //self.drawMyImage(self.canvasClipCtx);
        });
        self.panelBox.on("touchstart",".btn",this,self.panelBoxBtn_touch);

    };
    Cropper.prototype = {
        // 页面初始化
        initial: function () {
            var self = this;
            // 1、加载图片
            self.loadImage();
            // 2、渲染dom结构
            self.renderDom();
            // 3、定义元素
            self.containerBg = self.cropper.find("#container-bg");      // 透明背景容器
            self.canvasBg = self.cropper.find("#canvas-bg");      // 背景图片canvas
            self.canvasBgCtx = self.canvasBg[0].getContext("2d");
            self.canvasClip = self.cropper.find("#canvas-clip");      // 裁剪容器canvas
            self.canvasClipCtx = self.canvasClip[0].getContext("2d");
            self.clipControlBox = self.cropper.find("#clip-control-box");      // 裁剪框元素
            self.controlBoxItem = self.cropper.find(".control-box-item");
            self.dragBox = self.cropper.find("#drag-box");  // 拖拽框
            self.panelBox = self.cropper.find("#control-panel");    // 按钮控制面板
            // 4、设置页面基本结构大小
            self.setPageElementStyle();
        },
        // 控制面板中的所有按钮绑定事件
        panelBoxBtn_touch:function(e){
            var self = e.data;    // 从触发事件中传过来的Cropper对象
            var btnObj = $(this);  // 当前点击的按钮对象
            var elemId = btnObj.attr("id");
            switch(elemId){
                case "btn-rotate-ninety":
                    // 旋转90度处理函数
                    self.rotateNinety();
                    break;
                case "btn-reset":
                    // 重置
                    self.reset();
                    break;
                case "btn-zoom-in":
                    // 放大
                    self.zoomImage("zoomIn");
                    break;
                case "btn-zoom-out":
                    // 缩小
                    self.zoomImage("zoomOut");
                    break;
                case "btn-rotate-left":
                    // 左旋转
                    self.rotateDirectImage("left");
                    break;
                case "btn-rotate-right":
                    // 右旋转
                    self.rotateDirectImage("right");
                    break;
                case "btn-close":
                    // 关闭
                    if(confirm("确认退出？")){
                        window.close();
                    }
                    break;
                case "btn-save":
                    // 保存
                    self.dataReturn.x  = self.dataReturn.x/self.setting.imgScale;
                    self.dataReturn.y  = self.dataReturn.y/self.setting.imgScale;
                    console.log(self.dataReturn);
                    break;
            }
        },
        // 放大，缩小图片
        zoomImage:function(str){
            var self = this;
            var width = self.canvasSize.width,height = self.canvasSize.height,degree = self.setting.rotateDegree,
                x=self.rotateImgPostionCanvas.x1,y =self.rotateImgPostionCanvas.y1 ;
            if(str =="zoomIn"){
                self.setting.imgScale += self.setting.imgScaleSize;
            }else{
                self.setting.imgScale -= self.setting.imgScaleSize;
            }
            self.dataReturn.displayImgWidth = self.displayImgSize.width*self.setting.imgScale;
            self.dataReturn.displayImgHeight = self.displayImgSize.height*self.setting.imgScale;
            self.cropperDraw(self.canvasBgCtx, x, y,width ,height, degree);
            self.cropperDraw(self.canvasClipCtx, x, y,width ,height, degree);
        },
        // 左右旋转
        rotateDirectImage:function(str){
            var self = this;
            var width = self.canvasSize.width,height = self.canvasSize.height;
            if(str=="left"){
                self.setting.rotateDegree -= self.setting.rotateDegreeSize;
                if(self.setting.rotateDegree < -180+2*self.startDegree){
                    self.setting.rotateDegree = self.setting.rotateDegree + 360;
                }
            }else{
                self.setting.rotateDegree += self.setting.rotateDegreeSize;
                if(self.setting.rotateDegree > 360-self.startDegree){
                    self.setting.rotateDegree = self.setting.rotateDegree-360;
                }
            }
            self.rotateImgPostionCanvas = self.rotatePosition(self.canvasBgCtx, self.setting.rotateDegree);
            var x=self.rotateImgPostionCanvas.x1,y =self.rotateImgPostionCanvas.y1 ;
            self.cropperDraw(self.canvasBgCtx, x, y,width ,height, self.setting.rotateDegree);
            self.cropperDraw(self.canvasClipCtx, x, y,width ,height, self.setting.rotateDegree);
        },
        // 旋转90度
        rotateNinety:function(){
            var self = this;
            self.setting.rotateDegree += 90;
            self.setting.rotateDegree = self.setting.rotateDegree>=360?self.setting.rotateDegree -360:self.setting.rotateDegree;        // 旋转360度后再重新旋转
            self.rotateImgPostionCanvas = self.rotatePosition(self.canvasBgCtx, self.setting.rotateDegree);
            self.cropperDraw(self.canvasBgCtx, self.rotateImgPostionCanvas.x1, self.rotateImgPostionCanvas.y1, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);
            self.cropperDraw(self.canvasClipCtx, self.rotateImgPostionCanvas.x1, self.rotateImgPostionCanvas.y1, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);
        },
        // 重置按钮
        reset:function(){
            var self = this;
            self.setting.rotateDegree = self.setting.defaultDegree;
            self.setting.imgScale = 1;
            self.rotateImgPostionCanvas = self.rotatePosition(self.canvasBgCtx, self.setting.rotateDegree);
            self.cropperDraw(self.canvasBgCtx, self.rotateImgPostionCanvas.x1, self.rotateImgPostionCanvas.y1, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);
            self.cropperDraw(self.canvasClipCtx, self.rotateImgPostionCanvas.x1, self.rotateImgPostionCanvas.y1, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);

        },
        // 获得旋转后的坐标值
        rotatePosition: function (ctx, degree) {
            var self = this;
            var w = ctx.canvas.width;
            var h = ctx.canvas.height;
            var r = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(h / 2, 2));
            var startDegree = Math.asin((h / 2) / r);
            self.startDegree = startDegree*180/Math.PI;
            var totalDegree = startDegree + degree * Math.PI / 180;
            var x = 0;
            var y = 0;
            // 总角度值在0-90度之间
            if (totalDegree >= 0 && totalDegree < 90 * Math.PI / 180) {
                y = h / 2 - Math.abs(r * Math.sin(totalDegree)) ;
                x = w / 2 - Math.abs(r * Math.cos(totalDegree));
            }else if(totalDegree >= 90 * Math.PI / 180 && totalDegree < 180 * Math.PI / 180){
                y = h / 2 - Math.abs(r * Math.sin(totalDegree));
                x = w / 2 + Math.abs(r * Math.cos(totalDegree));
            }else if(totalDegree>=180*Math.PI/180 && totalDegree<270*Math.PI/180) {
                y = h / 2 + Math.abs(r * Math.sin(totalDegree)) ;
                x = w / 2 + Math.abs(r * Math.cos(totalDegree));
            }else{
                y = h / 2 + Math.abs(r * Math.sin(totalDegree)) ;
                x = w / 2 - Math.abs(r * Math.cos(totalDegree));
            }
            var x1 = parseFloat(x.toFixed(2)),
                y1= parseFloat(y.toFixed(2)),
                x2 = parseFloat((w*Math.cos(self.setting.rotateDegree*Math.PI/180) + x).toFixed(2)),
                y2 = parseFloat((w*Math.sin(self.setting.rotateDegree*Math.PI/180) +y).toFixed(2)),
                x3=parseFloat((r*Math.cos(Math.asin(h/(2*r)) + self.setting.rotateDegree*Math.PI/180)+w/2).toFixed(2)),
                y3 = parseFloat((r*Math.sin(Math.asin(h/(2*r)) + self.setting.rotateDegree*Math.PI/180)+h/2).toFixed(2)),
                x4 =  parseFloat((w/2 - r*Math.cos(self.setting.rotateDegree*Math.PI/180 -Math.asin(h/(2*r)))).toFixed(2)),
                y4 = parseFloat((h/2 - r*Math.sin(self.setting.rotateDegree*Math.PI/180 -Math.asin(h/(2*r)))).toFixed(2));
            return {
                x1: x1, y1:y1 ,
                x2: x2, y2:y2 ,
                x3: x3, y3:y3,
                x4: x4, y4:y4
            };
        },
        // 绘制函数
        cropperDraw: function (ctx, rx, ry, width, height, degree) {
            var self = this;
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.scale(self.setting.imgScale,self.setting.imgScale);
            if($(ctx.canvas).attr("id") == "canvas-clip"){
                // 绘制剪辑区域图片
                ctx.rect(self.clipBoxPositionCanvas.x/self.setting.imgScale,self.clipBoxPositionCanvas.y/self.setting.imgScale,(self.clipControlBox.width()+2)/self.setting.imgScale,(self.clipControlBox.height()+2)/self.setting.imgScale);
                ctx.clip();
            }else{
                ctx.globalAlpha=self.setting.imgOpacity;
            }
            self.dataReturn.degree = degree;
            ctx.translate(rx, ry);
            ctx.rotate(degree * Math.PI / 180);
            ctx.drawImage(self.imgObj, 0, 0, width, height);
            ctx.restore();
        },
        // 加载图片
        loadImage: function () {
            var self = this;
            self.imgObj.src = self.setting.imgSrc;
            self.imgObj.onload = function () {
                // 1、得到图片左上角顶点在canvas上的坐标
                self.rotateImgPostionCanvas = self.rotatePosition(self.canvasBgCtx, self.setting.rotateDegree);
                // 2、获取图片原始大小并保存
                self.dataReturn.natrualWidth = self.imgObj.naturalWidth;
                self.dataReturn.natrualHeight = self.imgObj.naturalHeight;
                self.imgNaturalScale = self.dataReturn.natrualWidth /self.dataReturn.natrualHeight;
                // 设置dataReturn参数
                self.dataReturn.width = self.clipControlBox.width();
                self.dataReturn.height = self.clipControlBox.height();
                // 3、绘制图片
                self.cropperDraw(self.canvasBgCtx, self.rotateImgPostionCanvas.x1, self.rotateImgPostionCanvas.y1, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);
                self.cropperDraw(self.canvasClipCtx, self.rotateImgPostionCanvas.x1, self.rotateImgPostionCanvas.y1, self.canvasSize.width, self.canvasSize.height, self.setting.rotateDegree);
            };
        },
        // 设置页面元素样式
        setPageElementStyle: function () {
            var self = this;
            // 1、设置实际显示图片的大小
            self.setDisplayImageSize();
            // 2、设置各个容器的样式
            self.setContainerStyle();
            // 3、设置自定义裁剪框的坐标值
            self.clipBoxPosition = {
                x: self.clipControlBox.position().left,
                y: self.clipControlBox.position().top
            };
            self.clipBoxPositionCanvas = self.windowToCanvas(self.canvasClipCtx,self.clipBoxPosition);
            self.dataReturn.x = self.clipBoxPositionCanvas.x;
            self.dataReturn.y = self.clipBoxPositionCanvas.y;
        },
        // 设置各个容器的样式
        setContainerStyle: function () {
            var self = this;
            // 设置容器的背景大小
            self.containerBg.css({
                "height": self.setting.containerBgSize + self.displayImgSize.height
            });
            self.canvasBg.css({
                "left": self.setting.margin,
                "top": self.setting.containerBgSize / 2
            });
            self.canvasBg.attr("width", self.displayImgSize.width);
            self.canvasBg.attr("height", self.displayImgSize.height);

            self.canvasClip.css({
                "left": self.setting.margin,
                "top": self.setting.containerBgSize / 2
            });
            self.canvasClip.attr("width", self.displayImgSize.width);
            self.canvasClip.attr("height", self.displayImgSize.height);
            // 设置裁剪框的大小
            // 判断是自动设置还是手动设置
            if (self.setting.autoSetClipBoxSize) {
                // 自动设置裁剪框的大小 注意要计算边框的大小
                self.clipControlBox.css({
                    width: self.displayImgSize.width * self.setting.defaultClipBoxRatio,
                    height: self.displayImgSize.height * self.setting.defaultClipBoxRatio,
                    left: (self.containerBg.width() - self.displayImgSize.width * self.setting.defaultClipBoxRatio - 2) / 2,
                    top: (self.containerBg.height() - self.displayImgSize.height * self.setting.defaultClipBoxRatio - 2) / 2
                });
            } else {
                // 手动设置
                self.clipControlBox.css({
                    width: self.setting.clipBoxWidth,
                    height: self.setting.clipBoxWidth * self.setting.aspectRatio,
                    left: (self.containerBg.width() - self.setting.clipBoxWidth - 2) / 2,
                    top: (self.containerBg.height() - self.setting.clipBoxWidth * self.setting.aspectRatio - 2) / 2
                });
            }
            // 设置虚线框的大小
            self.controlBoxItem.css({
                width: (self.clipControlBox.width() - 2) / 3,
                height: (self.clipControlBox.height() - 2) / 3
            });
        },
        // 设置实际图片显示的大小
        setDisplayImageSize: function () {
            var self = this;
            var wrapperWidth = self.cropper.width();    // 容器的宽度
            self.dataReturn.displayImgWidth = self.canvasSize.width = self.displayImgSize.width = (wrapperWidth - self.setting.margin * 2)*self.setting.imgScale;   // 实际显示图片的宽度
            self.dataReturn.displayImgHeight = self.canvasSize.height = self.displayImgSize.height = (self.displayImgSize.width / self.setting.aspectRatio)*self.setting.imgScale;    // 实际显示图片的高度
        },
        // 渲染dom结构
        renderDom: function () {
            var self = this;
            var strHtml = '<div class="container-bg" id="container-bg"> ' +
                '<canvas class="cropper-canvas canvas-bg" id="canvas-bg">浏览器不支持canvas</canvas> ' +
                '<canvas class="cropper-canvas canvas-clip" id="canvas-clip">浏览器不支持canvas</canvas> ' +
                '<div class="clip-control-box" id="clip-control-box"> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ' +
                '<div class="control-box-item"></div> ';
            if (!self.setting.dragImage) {
                strHtml += '<div class="control-box-dotted dotted-left-top"></div> ' +
                    '<div class="control-box-dotted dotted-left-middle"></div> ' +
                    '<div class="control-box-dotted dotted-left-bottom"></div> ' +
                    '<div class="control-box-dotted dotted-top-middle"></div> ' +
                    '<div class="control-box-dotted dotted-right-top"></div> ' +
                    '<div class="control-box-dotted dotted-right-middle"></div> ' +
                    '<div class="control-box-dotted dotted-right-bottom"></div> ' +
                    '<div class="control-box-dotted dotted-bottom-middle"></div> ';
            }
            strHtml += '</div> ' +
                '<div class="drag-box" id="drag-box"></div> ' +
                '</div> ' +
                '<div class="control-panel" id="control-panel"> ' +
                '<div class="panel-box control-panel-top"> ' +
                '<span class="btn btn-rotate-ninety" id="btn-rotate-ninety">旋转90°</span> ' +
                '<span class="btn btn-reset" id="btn-reset">重置</span> ' +
                '</div> ' +
                '<div class="panel-box control-panel-middle"> ' +
                '<span class="btn btn-zoom-in" id="btn-zoom-in">放大</span> ' +
                '<span class="btn btn-zoom-out" id="btn-zoom-out">缩小</span> ' +
                '<span class="btn btn-rotate-left" id="btn-rotate-left">左旋转</span> ' +
                '<span class="btn btn-rotate-right" id="btn-rotate-right">右旋转</span> ' +
                '</div> ' +
                '<div class="panel-box control-bottom"> ' +
                '<span class="btn btn-close" id="btn-close">关闭</span> ' +
                '<span class="btn btn-save" id="btn-save">保存</span> ' +
                '</div> ' +
                '</div>';
            self.cropper.append(strHtml);
        },
        // 获取配置参数
        getSettingData: function () {
            var self = this;
            if (self.cropper.attr("data-setting")) {
                return JSON.parse(self.cropper.attr("data-setting"));
            } else {
                return {};
            }
        },
        // 将window的坐标转换成为Canvas坐标
        windowToCanvas: function (context, position) {
            var self = this;
            var canvasBoxAttr = context.canvas.getBoundingClientRect();
            var x = position.x - canvasBoxAttr.left;
            var y = position.y - canvasBoxAttr.top;
            return {x: x, y: y};
        },
        // 判断是否超出边框
        overflowBorderX:function(pointX,index){
            var self = this;
            if(pointX.x>self.clipBoxPositionCanvas.x){
                switch(index){
                    case 1:
                        // 限制第一个点和第四个点的坐标
                        pointX = self.clipBoxPositionCanvas.x;
                        break;
                    case 2:
                        break;
                }
            }
        },
        // 判断是否超出边框
        overflowBorderY:function(pointY,index){
            var self = this;
            var minX = 0;
            var minY = 0;
        },
        // 知道图片的角度值与某一个点的坐标反推出其他任意三个点的坐标
        getImageFourPointPosition:function(x,y,index,degree){

            // 返回四个点的坐标值
            return {
                x1:0,y1:0,
                x2:0,y2:0,
                x3:0,y3:0,
                x4:0,y4:0
            }
        }
    };
    Cropper.init = function ($objList) {
        var self = this;
        $objList.each(function () {
            new self($(this));
        });
    };
    window["Cropper"] = Cropper;
})(jQuery);