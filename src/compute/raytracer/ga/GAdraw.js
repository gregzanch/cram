//
// All GA drawing
//
// (c) Lauri Savioja, 2016
//

"use strict";

var timer;
var SOURCE = 100;
var RECEIVER = 101;
var SHADOW_RAY_STYLE = 102;

// var BEM_BLACK_BACKGROUND = 200;
// var BEM_TRANSPARENT_BACKGROUND = 201;
var PRIMARY = 202;
var REFLECTION = 203;
var PHASE_REVERSED = 204;
//
// Color initialization
//

// Colormap values from https://github.com/politiken-journalism/scale-color-perceptual/blob/master/hex/
// with MIT License
var viridisMap = ["#440154","#440256","#450457","#450559","#46075a","#46085c","#460a5d","#460b5e","#470d60","#470e61","#471063","#471164","#471365","#481467","#481668","#481769","#48186a","#481a6c","#481b6d","#481c6e","#481d6f","#481f70","#482071","#482173","#482374","#482475","#482576","#482677","#482878","#482979","#472a7a","#472c7a","#472d7b","#472e7c","#472f7d","#46307e","#46327e","#46337f","#463480","#453581","#453781","#453882","#443983","#443a83","#443b84","#433d84","#433e85","#423f85","#424086","#424186","#414287","#414487","#404588","#404688","#3f4788","#3f4889","#3e4989","#3e4a89","#3e4c8a","#3d4d8a","#3d4e8a","#3c4f8a","#3c508b","#3b518b","#3b528b","#3a538b","#3a548c","#39558c","#39568c","#38588c","#38598c","#375a8c","#375b8d","#365c8d","#365d8d","#355e8d","#355f8d","#34608d","#34618d","#33628d","#33638d","#32648e","#32658e","#31668e","#31678e","#31688e","#30698e","#306a8e","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#2e6f8e","#2d708e","#2d718e","#2c718e","#2c728e","#2c738e","#2b748e","#2b758e","#2a768e","#2a778e","#2a788e","#29798e","#297a8e","#297b8e","#287c8e","#287d8e","#277e8e","#277f8e","#27808e","#26818e","#26828e","#26828e","#25838e","#25848e","#25858e","#24868e","#24878e","#23888e","#23898e","#238a8d","#228b8d","#228c8d","#228d8d","#218e8d","#218f8d","#21908d","#21918c","#20928c","#20928c","#20938c","#1f948c","#1f958b","#1f968b","#1f978b","#1f988b","#1f998a","#1f9a8a","#1e9b8a","#1e9c89","#1e9d89","#1f9e89","#1f9f88","#1fa088","#1fa188","#1fa187","#1fa287","#20a386","#20a486","#21a585","#21a685","#22a785","#22a884","#23a983","#24aa83","#25ab82","#25ac82","#26ad81","#27ad81","#28ae80","#29af7f","#2ab07f","#2cb17e","#2db27d","#2eb37c","#2fb47c","#31b57b","#32b67a","#34b679","#35b779","#37b878","#38b977","#3aba76","#3bbb75","#3dbc74","#3fbc73","#40bd72","#42be71","#44bf70","#46c06f","#48c16e","#4ac16d","#4cc26c","#4ec36b","#50c46a","#52c569","#54c568","#56c667","#58c765","#5ac864","#5cc863","#5ec962","#60ca60","#63cb5f","#65cb5e","#67cc5c","#69cd5b","#6ccd5a","#6ece58","#70cf57","#73d056","#75d054","#77d153","#7ad151","#7cd250","#7fd34e","#81d34d","#84d44b","#86d549","#89d548","#8bd646","#8ed645","#90d743","#93d741","#95d840","#98d83e","#9bd93c","#9dd93b","#a0da39","#a2da37","#a5db36","#a8db34","#aadc32","#addc30","#b0dd2f","#b2dd2d","#b5de2b","#b8de29","#bade28","#bddf26","#c0df25","#c2df23","#c5e021","#c8e020","#cae11f","#cde11d","#d0e11c","#d2e21b","#d5e21a","#d8e219","#dae319","#dde318","#dfe318","#e2e418","#e5e419","#e7e419","#eae51a","#ece51b","#efe51c","#f1e51d","#f4e61e","#f6e620","#f8e621","#fbe723","#fde725"];
var magmaMap = ["#000004","#010005","#010106","#010108","#020109","#02020b","#02020d","#03030f","#030312","#040414","#050416","#060518","#06051a","#07061c","#08071e","#090720","#0a0822","#0b0924","#0c0926","#0d0a29","#0e0b2b","#100b2d","#110c2f","#120d31","#130d34","#140e36","#150e38","#160f3b","#180f3d","#19103f","#1a1042","#1c1044","#1d1147","#1e1149","#20114b","#21114e","#221150","#241253","#251255","#271258","#29115a","#2a115c","#2c115f","#2d1161","#2f1163","#311165","#331067","#341069","#36106b","#38106c","#390f6e","#3b0f70","#3d0f71","#3f0f72","#400f74","#420f75","#440f76","#451077","#471078","#491078","#4a1079","#4c117a","#4e117b","#4f127b","#51127c","#52137c","#54137d","#56147d","#57157e","#59157e","#5a167e","#5c167f","#5d177f","#5f187f","#601880","#621980","#641a80","#651a80","#671b80","#681c81","#6a1c81","#6b1d81","#6d1d81","#6e1e81","#701f81","#721f81","#732081","#752181","#762181","#782281","#792282","#7b2382","#7c2382","#7e2482","#802582","#812581","#832681","#842681","#862781","#882781","#892881","#8b2981","#8c2981","#8e2a81","#902a81","#912b81","#932b80","#942c80","#962c80","#982d80","#992d80","#9b2e7f","#9c2e7f","#9e2f7f","#a02f7f","#a1307e","#a3307e","#a5317e","#a6317d","#a8327d","#aa337d","#ab337c","#ad347c","#ae347b","#b0357b","#b2357b","#b3367a","#b5367a","#b73779","#b83779","#ba3878","#bc3978","#bd3977","#bf3a77","#c03a76","#c23b75","#c43c75","#c53c74","#c73d73","#c83e73","#ca3e72","#cc3f71","#cd4071","#cf4070","#d0416f","#d2426f","#d3436e","#d5446d","#d6456c","#d8456c","#d9466b","#db476a","#dc4869","#de4968","#df4a68","#e04c67","#e24d66","#e34e65","#e44f64","#e55064","#e75263","#e85362","#e95462","#ea5661","#eb5760","#ec5860","#ed5a5f","#ee5b5e","#ef5d5e","#f05f5e","#f1605d","#f2625d","#f2645c","#f3655c","#f4675c","#f4695c","#f56b5c","#f66c5c","#f66e5c","#f7705c","#f7725c","#f8745c","#f8765c","#f9785d","#f9795d","#f97b5d","#fa7d5e","#fa7f5e","#fa815f","#fb835f","#fb8560","#fb8761","#fc8961","#fc8a62","#fc8c63","#fc8e64","#fc9065","#fd9266","#fd9467","#fd9668","#fd9869","#fd9a6a","#fd9b6b","#fe9d6c","#fe9f6d","#fea16e","#fea36f","#fea571","#fea772","#fea973","#feaa74","#feac76","#feae77","#feb078","#feb27a","#feb47b","#feb67c","#feb77e","#feb97f","#febb81","#febd82","#febf84","#fec185","#fec287","#fec488","#fec68a","#fec88c","#feca8d","#fecc8f","#fecd90","#fecf92","#fed194","#fed395","#fed597","#fed799","#fed89a","#fdda9c","#fddc9e","#fddea0","#fde0a1","#fde2a3","#fde3a5","#fde5a7","#fde7a9","#fde9aa","#fdebac","#fcecae","#fceeb0","#fcf0b2","#fcf2b4","#fcf4b6","#fcf6b8","#fcf7b9","#fcf9bb","#fcfbbd","#fcfdbf"];
var infernoMap = ["#000004","#010005","#010106","#010108","#02010a","#02020c","#02020e","#030210","#040312","#040314","#050417","#060419","#07051b","#08051d","#09061f","#0a0722","#0b0724","#0c0826","#0d0829","#0e092b","#10092d","#110a30","#120a32","#140b34","#150b37","#160b39","#180c3c","#190c3e","#1b0c41","#1c0c43","#1e0c45","#1f0c48","#210c4a","#230c4c","#240c4f","#260c51","#280b53","#290b55","#2b0b57","#2d0b59","#2f0a5b","#310a5c","#320a5e","#340a5f","#360961","#380962","#390963","#3b0964","#3d0965","#3e0966","#400a67","#420a68","#440a68","#450a69","#470b6a","#490b6a","#4a0c6b","#4c0c6b","#4d0d6c","#4f0d6c","#510e6c","#520e6d","#540f6d","#550f6d","#57106e","#59106e","#5a116e","#5c126e","#5d126e","#5f136e","#61136e","#62146e","#64156e","#65156e","#67166e","#69166e","#6a176e","#6c186e","#6d186e","#6f196e","#71196e","#721a6e","#741a6e","#751b6e","#771c6d","#781c6d","#7a1d6d","#7c1d6d","#7d1e6d","#7f1e6c","#801f6c","#82206c","#84206b","#85216b","#87216b","#88226a","#8a226a","#8c2369","#8d2369","#8f2469","#902568","#922568","#932667","#952667","#972766","#982766","#9a2865","#9b2964","#9d2964","#9f2a63","#a02a63","#a22b62","#a32c61","#a52c60","#a62d60","#a82e5f","#a92e5e","#ab2f5e","#ad305d","#ae305c","#b0315b","#b1325a","#b3325a","#b43359","#b63458","#b73557","#b93556","#ba3655","#bc3754","#bd3853","#bf3952","#c03a51","#c13a50","#c33b4f","#c43c4e","#c63d4d","#c73e4c","#c83f4b","#ca404a","#cb4149","#cc4248","#ce4347","#cf4446","#d04545","#d24644","#d34743","#d44842","#d54a41","#d74b3f","#d84c3e","#d94d3d","#da4e3c","#db503b","#dd513a","#de5238","#df5337","#e05536","#e15635","#e25734","#e35933","#e45a31","#e55c30","#e65d2f","#e75e2e","#e8602d","#e9612b","#ea632a","#eb6429","#eb6628","#ec6726","#ed6925","#ee6a24","#ef6c23","#ef6e21","#f06f20","#f1711f","#f1731d","#f2741c","#f3761b","#f37819","#f47918","#f57b17","#f57d15","#f67e14","#f68013","#f78212","#f78410","#f8850f","#f8870e","#f8890c","#f98b0b","#f98c0a","#f98e09","#fa9008","#fa9207","#fa9407","#fb9606","#fb9706","#fb9906","#fb9b06","#fb9d07","#fc9f07","#fca108","#fca309","#fca50a","#fca60c","#fca80d","#fcaa0f","#fcac11","#fcae12","#fcb014","#fcb216","#fcb418","#fbb61a","#fbb81d","#fbba1f","#fbbc21","#fbbe23","#fac026","#fac228","#fac42a","#fac62d","#f9c72f","#f9c932","#f9cb35","#f8cd37","#f8cf3a","#f7d13d","#f7d340","#f6d543","#f6d746","#f5d949","#f5db4c","#f4dd4f","#f4df53","#f4e156","#f3e35a","#f3e55d","#f2e661","#f2e865","#f2ea69","#f1ec6d","#f1ed71","#f1ef75","#f1f179","#f2f27d","#f2f482","#f3f586","#f3f68a","#f4f88e","#f5f992","#f6fa96","#f8fb9a","#f9fc9d","#fafda1","#fcffa4"];
var plasmaMap = ["#0d0887","#100788","#130789","#16078a","#19068c","#1b068d","#1d068e","#20068f","#220690","#240691","#260591","#280592","#2a0593","#2c0594","#2e0595","#2f0596","#310597","#330597","#350498","#370499","#38049a","#3a049a","#3c049b","#3e049c","#3f049c","#41049d","#43039e","#44039e","#46039f","#48039f","#4903a0","#4b03a1","#4c02a1","#4e02a2","#5002a2","#5102a3","#5302a3","#5502a4","#5601a4","#5801a4","#5901a5","#5b01a5","#5c01a6","#5e01a6","#6001a6","#6100a7","#6300a7","#6400a7","#6600a7","#6700a8","#6900a8","#6a00a8","#6c00a8","#6e00a8","#6f00a8","#7100a8","#7201a8","#7401a8","#7501a8","#7701a8","#7801a8","#7a02a8","#7b02a8","#7d03a8","#7e03a8","#8004a8","#8104a7","#8305a7","#8405a7","#8606a6","#8707a6","#8808a6","#8a09a5","#8b0aa5","#8d0ba5","#8e0ca4","#8f0da4","#910ea3","#920fa3","#9410a2","#9511a1","#9613a1","#9814a0","#99159f","#9a169f","#9c179e","#9d189d","#9e199d","#a01a9c","#a11b9b","#a21d9a","#a31e9a","#a51f99","#a62098","#a72197","#a82296","#aa2395","#ab2494","#ac2694","#ad2793","#ae2892","#b02991","#b12a90","#b22b8f","#b32c8e","#b42e8d","#b52f8c","#b6308b","#b7318a","#b83289","#ba3388","#bb3488","#bc3587","#bd3786","#be3885","#bf3984","#c03a83","#c13b82","#c23c81","#c33d80","#c43e7f","#c5407e","#c6417d","#c7427c","#c8437b","#c9447a","#ca457a","#cb4679","#cc4778","#cc4977","#cd4a76","#ce4b75","#cf4c74","#d04d73","#d14e72","#d24f71","#d35171","#d45270","#d5536f","#d5546e","#d6556d","#d7566c","#d8576b","#d9586a","#da5a6a","#da5b69","#db5c68","#dc5d67","#dd5e66","#de5f65","#de6164","#df6263","#e06363","#e16462","#e26561","#e26660","#e3685f","#e4695e","#e56a5d","#e56b5d","#e66c5c","#e76e5b","#e76f5a","#e87059","#e97158","#e97257","#ea7457","#eb7556","#eb7655","#ec7754","#ed7953","#ed7a52","#ee7b51","#ef7c51","#ef7e50","#f07f4f","#f0804e","#f1814d","#f1834c","#f2844b","#f3854b","#f3874a","#f48849","#f48948","#f58b47","#f58c46","#f68d45","#f68f44","#f79044","#f79143","#f79342","#f89441","#f89540","#f9973f","#f9983e","#f99a3e","#fa9b3d","#fa9c3c","#fa9e3b","#fb9f3a","#fba139","#fba238","#fca338","#fca537","#fca636","#fca835","#fca934","#fdab33","#fdac33","#fdae32","#fdaf31","#fdb130","#fdb22f","#fdb42f","#fdb52e","#feb72d","#feb82c","#feba2c","#febb2b","#febd2a","#febe2a","#fec029","#fdc229","#fdc328","#fdc527","#fdc627","#fdc827","#fdca26","#fdcb26","#fccd25","#fcce25","#fcd025","#fcd225","#fbd324","#fbd524","#fbd724","#fad824","#fada24","#f9dc24","#f9dd25","#f8df25","#f8e125","#f7e225","#f7e425","#f6e626","#f6e826","#f5e926","#f5eb27","#f4ed27","#f3ee27","#f3f027","#f2f227","#f1f426","#f1f525","#f0f724","#f0f921"];


var surfaceColor = "#000000";
var highlightSurfaceColor = "#00ff00";
var normalColor = "#ff0000";

var rayStrokeStyles = [];

var raySectionLengthInTime = 15;

rayStrokeStyles[OK] = { color: "#000000", style: [] };
rayStrokeStyles[OUT_OF_SURFACE] = { color: "hsl(0, 0%, 65%)", style: [1, 1] };
rayStrokeStyles[OBSTRUCTED] = { color: "hsl(0, 0%, 0%)", style: [5, 5] };
rayStrokeStyles[WRONG_SIDE] = { color: "hsl(330, 80%, 40%)", style: [10, 7] };
rayStrokeStyles[AUDIBLE] = { color: "#ff0000", style: [] };
rayStrokeStyles[SHADOW_RAY_STYLE] = { color: "#505050", style: [2,1] };

GA.prototype.initiateColors = function(maxOrder) {
    var i, h, s, l, col;
//    this.colors = [];
//    this.colors[0] = "#000000";
//    this.colors[BEM_TRANSPARENT_BACKGROUND] = "#ffff00";
//    this.colors[BEM_BLACK_BACKGROUND] = "#000000";
//    this.colors[BEM_TRANSPARENT_BACKGROUND] = "#ffffff";
//    this.colors[BEM_TRANSPARENT_BACKGROUND] = "rgba(255,255,255,0)";

    this.orderColors = [];
    for (i=0;i<5;i++) {
        this.orderColors[i] = [];
        this.orderColors[i][0] = "#000000";
        this.orderColors[i][SOURCE] = "#ff0000";
        this.orderColors[i][RECEIVER] = "#0000ff";
        this.orderColors[i][PRIMARY] = "#ff0000";
        this.orderColors[i][REFLECTION] = "0xff0000";
        this.orderColors[i][PHASE_REVERSED] = "0x00ffff";
    }
    for (i=1; i<=maxOrder; i++) {
        h = 10 + (300 * (i-1) / maxOrder);  // Maps the hue from red to blue to green
        s = (maxOrder-((i-1)/(1.3))) / (maxOrder) * 100;
        if (i == 1)
            h = 0;   // bright red
        if ((h>40) && (h<80)) {
            s = 100; // boost yellow!
        }
        if (h>200)  // lighter blue!
            l = 80;
        else
            l = 50;
        col = "hsl(" + h.toString() + ", " + s.toString() + "%, " + l.toString() + "%)";
        this.orderColors[0][i] = col;  // Rainbow colormap, not to be used ... :-)
        this.orderColors[1][i] = viridisMap[Math.max(0,200-i*20)];
        this.orderColors[2][i] = magmaMap[Math.max(0,200-i*20)];
        this.orderColors[3][i] = infernoMap[Math.max(0,200-i*20)];
        this.orderColors[4][i] = plasmaMap[Math.max(0,200-i*20)];
    }
    this.currentOrderColormap = 3;
};

//
// Basic drawing primitives
//

GA.prototype.scaleX = function(x) { return (x)*this.scaler+this.center.x; };
GA.prototype.scaleY = function(y) { return (y)*this.scaler+this.center.y; };
GA.prototype.scaleXinv = function(x) { return (x-this.center.x)/this.scaler; };
GA.prototype.scaleYinv = function(y) { return (y-this.center.y)/this.scaler; };

GA.prototype.moveTo = function(ctx, v) {
    ctx.moveTo(this.scaleX(v.x), this.scaleY(v.y));
};
GA.prototype.lineTo = function(ctx, v) {
    ctx.lineTo(this.scaleX(v.x), this.scaleY(v.y));
};
GA.prototype.arc = function(ctx, v, rad, startAngle, endAngle) {
    ctx.arc(this.scaleX(v.x), this.scaleY(v.y), rad * this.scaler, startAngle, endAngle, true);
};
GA.prototype.sector = function(ctx, v, rad, startAngle, endAngle) {
    this.moveTo(ctx, v);
//    console.log("Start:" + 180 * startAngle/M_PI, ". End: " + endAngle * 180 / M_PI)
    ctx.arc(this.scaleX(v.x), this.scaleY(v.y), rad * this.scaler, startAngle, endAngle, false);
    this.moveTo(ctx, v);
};
GA.prototype.circle = function(ctx, v, rad, startAngle, endAngle) {
    this.arc(ctx, v, rad, endAngle, startAngle);
};

function drawPath(ctx, color, width, lineStyle) {
    if (typeof lineStyle != 'undefined')
        ctx.setLineDash(lineStyle);

    ctx.strokeStyle = color;
    ctx.lineWidth = ctx.lineWidth * width;
    ctx.stroke();
    ctx.lineWidth = ctx.lineWidth / width;
    ctx.setLineDash([]);
}

//
// Resizing
//

window.addEventListener('resize', resizeAll, true);

function resizeAll() {
    var room, ctx, i;
    for (i in g_listOfRoomsForRedraw) {
        room = g_listOfRoomsForRedraw[i];
        ctx = document.getElementById(room.id).getContext('2d');
        room.resize(ctx.canvas);
        room.drawAll();
    }
}

GA.prototype.resize = function(canvas) {
    var origWidth = canvas.width;
    var origHeight = canvas.height;

    canvas.width = window.innerWidth * 0.84 - 36;
    canvas.height = Math.min(canvas.height, canvas.width / this.aspectRatio);

    var newHeight = origHeight;
    if ((canvas.width < origWidth) || (canvas.height < origHeight)) {  // Canvas size has reduced
        newHeight = origWidth / this.aspectRatio;
        if (newHeight < canvas.height) { // width is the limiting factor
            this.scaler = this.scaler * canvas.width / origWidth;
        }
        else { // Height is the dimension that got changed more
            this.scaler = canvas.height / this.origHeight;
        }
    }
    this.center = new Vec2(canvas.width / 2, canvas.height / 2);
};

//
// Draw geometry and handle clipping
//

GA.prototype.drawSurface = function(ctx, idx, color, width) {
    ctx.beginPath();
    this.moveTo(ctx, this.startVertices[idx]);
    this.lineTo(ctx, this.endVertices[idx]);
    if ((this.showOutside == 0) && (this.closer.length>0))
        drawPath(ctx, color, 2.95);
    else
        drawPath(ctx, color, width);

    if (this.showLabels) {
        var labelLoc = new Vec2(this.normals[idx]);
        labelLoc.scale(-10);
        labelLoc.add(this.centers[idx]);
        ctx.fillText(this.labels[idx], this.scaleX(labelLoc.x)-5, this.scaleY(labelLoc.y)+5);
    }
};

GA.prototype.clipOutside = function() {
    var ctx = this.ctx;
    ctx.beginPath();
    this.moveTo(ctx, this.startVertices[0]);
    var i;
    for (i=0;i<this.endVertices.length;i++)
        this.lineTo(ctx, this.endVertices[i]);
    for (i=0;i<this.closer.length;i++)
        this.lineTo(ctx, this.closer[i]);
    if (this.closer.length>0)
        ctx.strokeStyle = "rgba(0,0,0,0.0)";
    else
        ctx.strokeStyle = surfaceColor;
    ctx.stroke();
    ctx.clip();
};

function clearCanvas(ctx, color) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (typeof color != 'undefined') {
        ctx.beginPath();
        ctx.rect(0,0,ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

GA.prototype.drawGeometry = function(drawNormals) {
    var ctx = this.ctx;
    if ((this.showOutside == 0) && (this.clipChanged == true)) {
        ctx.restore();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.saved = 0;
        this.clipChanged = false;
    }
    if ((this.showOutside == 0) && (this.saved == 0)) {
        ctx.save();
        this.saved = 1;
        this.clipOutside();
    } else if ((this.showOutside == 1) && (this.saved == 1)) {
        ctx.restore();
        this.saved = 0;
    }
    var i;
    for (i = 0; i < this.startVertices.length; i++)
        if ((this.visualize[BRDF_SLOTS] == 1) && (activeSurface == i))
            this.drawSurface(ctx, i, highlightSurfaceColor, 2);
        else
            this.drawSurface(ctx, i, surfaceColor, 1);
    if (drawNormals) {
        ctx.beginPath();
        for (i = 0; i < this.normals.length; i++) {
            this.moveTo(ctx, this.centers[i]);
            var tmp = new Vec2(this.normals[i]);
            tmp.scale(5);
            tmp.add(this.centers[i]);
            this.lineTo(ctx, tmp);
            drawPath(ctx, normalColor, 1);
        }
    }
};

//
// Draw rays (both full rays and sections
//

GA.prototype.drawRayPath = function(r, startTime, endTime, style, width, scaleToEnergy) {
    var ctx = this.ctx;

    var i;
    var numberOfRaySegments = Math.min(r.points.length, eval(this.rayVisualizationOrder)+1);
    for (i=0;i<numberOfRaySegments;i++) {
        var st = Math.max(startTime, r.startTimes[i]);
        var et = Math.min(r.startTimes[i]+ r.durations[i], endTime);
        if (et > st) {
            ctx.beginPath();

            var p = new Vec2(r.directions[i]);
            p.scaleToTime(st - r.startTimes[i]);
            p.add(r.points[i]);
            this.moveTo(ctx, p);

            p.set(r.directions[i].x, r.directions[i].y);
            if ((i == (r.points.length-1)) && (this.visualize[RAY_EMISSION] == 1) && (endTime == FULL_PATH_VISUALIZATION_TIME))
                p.scaleToTime(emittedRayDuration * r.energies[i] / ENERGY_PER_RAY); // Show energy as length in the last reflection
            else
                p.scaleToTime(et - r.startTimes[i]); // Normal duration scaling
            p.add(r.points[i]);
            this.lineTo(ctx, p);

            if (scaleToEnergy == true) {
                var gb = Math.round(256 * (1 - (r.energies[i] / ENERGY_PER_RAY)));
                var gbStr = gb.toString(16);
                if (gbStr.length == 1)
                    gbStr = "0"+gbStr;
                var newColor = "#ff" + gbStr + gbStr;
                drawPath(ctx, newColor, width, style.style)
            } else
                drawPath(ctx, style.color, width, style.style)
        }
    }
};

GA.prototype.drawRayExtension = function(intersection, srcloc) {
    var ctx = this.ctx;
    ctx.beginPath();
    this.moveTo(ctx, intersection);
    this.lineTo(ctx, srcloc);
    drawPath(ctx, "#000000", 1, [1, 3]);
};

//
// Wave fronts
//

// Adapted from stackoverflow
function hex2rgbAddAlpha(hex, alpha) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + alpha.toString() + ")";
}

GA.prototype.drawWaveFront = function(src, beam, rad) {
    var ctx = this.ctx;
    ctx.beginPath();
    this.circle(ctx, src.loc, rad, beam.leftAngle, beam.rightAngle, true);

    var color, width;
    color = this.orderColors[this.currentOrderColormap][src.order];
    if (rad<2)
        width = 2;
    else
        width = 1;
    if (this.simulationModes[BEM] == 1) {
        width = 5;
        var x0, y0, y1;
        x0 = src.loc.x - rad;
        y0 = src.loc.y;
        if (src.order == REFLECTION)
            y1 = src.loc.y-rad;
        else
            y1 = src.loc.y+rad;
        console.log("order = " + src.order);
        if (src.order == PHASE_REVERSED)
            this.ctx.globalCompositeOperation = 'screen';
        if ((src.order == PHASE_REVERSED) || (src.order == REFLECTION)) {
            this.ctx.globalCompositeOperation = 'screen';
            var grd = ctx.createLinearGradient(this.scaleX(x0), this.scaleY(y0), this.scaleX(x0), this.scaleY(y1));
            var aCol = hex2rgbAddAlpha(color, 0);
            grd.addColorStop(0.1, aCol);
            var bCol = hex2rgbAddAlpha(color, 1);
            grd.addColorStop(1, bCol);
            color = grd;
        }
    }
    drawPath(ctx, color, width);
    this.ctx.globalCompositeOperation = 'source-over';
};

//
// Cross
//

var cross_size = 4;

GA.prototype.drawCross = function(loc, order) {
    var ctx = this.ctx;
    ctx.beginPath();
    var tmp = new Vec2(loc);
    tmp.add({x: cross_size, y:0});
    this.moveTo(ctx, tmp);
    tmp.add({x: -2 * cross_size, y:0});
    this.lineTo(ctx, tmp);
    tmp.add({x: cross_size, y:-cross_size});
    this.moveTo(ctx, tmp);
    tmp.add({x: 0, y:2*cross_size});
    this.lineTo(ctx, tmp);
    drawPath(ctx, this.orderColors[this.currentOrderColormap][order], 2);
};

GA.prototype.markSourceLocation = function(loc, order) {
    this.drawCross(loc, order);
};

//
// Beam visualization
//

GA.prototype.drawBeam = function(beam, order, width) {
    if (beam.angle>=M_PI)  // Let us not draw the big angles
        return;

    var ctx = this.ctx;
    var tmp;
    ctx.beginPath();
    this.moveTo(ctx, beam.center);
    tmp = new Vec2(beam.leftDirection);
    var directionScaler = 50;
    tmp.scale(directionScaler);
    tmp.add(beam.leftLimit);
    this.lineTo(ctx, tmp);
    this.moveTo(ctx, beam.center);
    tmp = new Vec2(beam.rightDirection);
    tmp.scale(directionScaler);
    tmp.add(beam.rightLimit);
    this.lineTo(ctx, tmp);
    drawPath(ctx, this.orderColors[this.currentOrderColormap][order], width);

};

GA.prototype.highlightChildren = function(src) {
    var ctx = this.ctx;
    var i;
    for (i=0;i<src.children.length;i++) {
        this.drawSurface(ctx,src.children[i].reflector, highlightSurfaceColor, 2);
    }
};

//
// BRDFs and directional responses
//

GA.prototype.drawDirectionalResponse = function(ctx, response, scaler, center, lineDir) {
    var i;
    var nofSlots = response.length;
    var angleIncrement = M_PI / nofSlots;
    var angle = Math.atan2(lineDir.y, lineDir.x);
    for (i=0; i<nofSlots; i++) {
        ctx.beginPath();
        this.moveTo(ctx, center);
        this.sector(ctx, center, scaler*Math.sqrt(nofSlots*response[i]), angle - angleIncrement, angle);
        ctx.fill();
        ctx.beginPath();
        this.moveTo(ctx, center);
        this.sector(ctx, center, scaler*Math.sqrt(nofSlots*response[i]), angle - angleIncrement, angle);
        drawPath(ctx, "#ffffff", 1);
        angle -= angleIncrement;
    }
};

GA.prototype.drawBRDF = function(ctx, brdf, center, lineDir, src) {
    var BRDFsize = emittedRayDuration*60;
    var incidentAngleIndex = brdf.getAngleIndex(center, lineDir, src);
    if ((incidentAngleIndex >= 0) && (incidentAngleIndex<brdf.nofSlots))
        this.drawDirectionalResponse(ctx, brdf.coeffs[incidentAngleIndex], this.BRDFvisualizationScaler*Math.sqrt(BRDFsize), center, lineDir);
};

GA.prototype.drawBRDFs = function(src) {
    var ctx = this.ctx;
    var i;
    for (i=0; i<this.BRDFs.length; i++)
        this.drawBRDF(ctx, this.BRDFs[i], this.centers[i], this.lineDirs[i], src);
};

GA.prototype.drawARTresponses = function() {
    var ctx = this.ctx;
    var i, j, k;
    var scaler = 3;
    var gatherFromResponse;
    var startTime, endTime;
    var responseToBeDrawn = [];

    if (this.time == 0)
        this.ARTtemporalVisualization = TOTAL_ENERGY;
    else
        this.ARTtemporalVisualization = INSTANTANEOUS_ENERGY;

    for (i=0; i<this.lineDirs.length; i++) {
        if (this.ARTtemporalVisualization == TOTAL_ENERGY) {
            startTime = 0;
            endTime = 0;
            if (this.ARTenergyVisualization == ALL_ENERGY)
                gatherFromResponse = this.totalARTenergy[i];
            else
                gatherFromResponse = this.totalUnshotARTenergy[i];
        } else {  // INSTANTANEOUS_ENERGY
            startTime = Math.round(this.time);
            endTime = startTime+10;
            scaler = 10;
            if (this.ARTenergyVisualization == ALL_ENERGY)
                gatherFromResponse = this.ARTenergy[i];
            else
                gatherFromResponse = this.unshotARTenergy[i];
        }
        for (j=0;j<gatherFromResponse.responseToDirection.length; j++) {
            responseToBeDrawn[j] = 0;
            for (k = startTime; k <= endTime; k++)
                responseToBeDrawn[j] += gatherFromResponse.responseToDirection[j].values[k];
        }
        this.drawDirectionalResponse(ctx, responseToBeDrawn, scaler, this.centers[i], this.lineDirs[i]);
    }
};

var CIRCLE = new Sector({x: 0, y: 0});

//
// Update informational fields
//

function updateInformationFields(fields) {
    var i;
    var val, txt;
    for (i=0;i<fields.length;i++) {
//        val = eval(eval("fields[i]"));
        val = Math.round(eval(fields[i]));
        if ((val+1) >= MAX_IMAGE_SOURCES)
            txt = "TOO MANY";
        else
            txt = val.toString();
        document.getElementById(fields[i]).innerHTML = txt;
    }
}

//
// Find the maximum order to be visualized
//

GA.prototype.maxShowOrder = function() {
    var i;
    for (i=this.showOrders.length;i>0;i--) {
        if (this.showOrders[i] == 1)
            return i;
    }
    return this.maxOrder;
};

//
// Warn the user of the heavy load!
//
GA.prototype.drawWarning = function() {
    var ctx = this.ctx;
    var font = ctx.font;
    ctx.font = "50px Arial";
    ctx.fillStyle = "#e00000";
    ctx.textAlign = "center";
    ctx.fillText("Warning: Too many image sources", this.scaleX(0), this.scaleY(-300));
    ctx.fillText("Please, reduce the reflection order!", this.scaleX(0), this.scaleY(300));
    ctx.font = font;
};

//
//
//

 function drawLine(ctx, p0, p1, color, width, lineStyle) {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    drawPath(ctx, color, width, lineStyle);
}

GA.prototype.getMinMaxX = function() {
    var i;
    var xmin=1E+9;
    var xmax = -xmin;
    for (i=0;i<this.startVertices.length; i++) {
        if (this.startVertices[i].x > xmax)
            xmax = this.startVertices[i].x;
        if (this.endVertices[i].x > xmax)
            xmax = this.endVertices[i].x;
        if (this.startVertices[i].x < xmin)
            xmin = this.startVertices[i].x;
        if (this.endVertices[i].x < xmin)
            xmin = this.endVertices[i].x;
    }
    return {max: xmax, min: xmin};
};

GA.prototype.showGeometryScaler = function() {
    var ctx = this.ctx;
    var h = 3;
    var y = ctx.canvas.height-h-1;
    var xRange = this.getMinMaxX();
    var internalDistance = xRange.max - xRange.min;
    var realDistance = this.rlParams.internalDistToRealDist(internalDistance);
    realDistance = roundToNdigits(realDistance, 2);

    var txt;
    txt = realDistance.toString()+"m";

    var x0 = this.scaleX(xRange.min);
    var x1 = this.scaleX(xRange.max);
    var col="#401010";
    var w = 1;
    drawLine(ctx, new Vec2(x0, y), new Vec2(x1,y), col, w);
    drawLine(ctx, new Vec2(x0, y-h), new Vec2(x0, y+h), col, w);
    drawLine(ctx, new Vec2(x1, y-h), new Vec2(x1, y+h), col, w);

    ctx.fillStyle = col;
    ctx.textAlign = "center";
    ctx.fillText(txt, ((x0+x1)/2), y-(2*h));
};

//
// Draw extra canvases (IR, ETC)
//
GA.prototype.drawExtras = function() {
    var canvas;
    if (this.simulationModes[MAKE_IS] == 1) 
        this.constructIRResponse();
    if (this.simulationModes[CREATE_RAYS] == 1)
        this.constructETCResponseFromRays();
    if (this.simulationModes[ART] == 1)
        this.constructETCResponseFromART();
    if ((this.responseVisualization == IMPULSE_RESPONSE) && (this.updateCounter == 0)) {
        if (this.simulationModes[MAKE_IS] == 1) {
            canvas = this.IR_canvas;
        } else {
            canvas = this.ETC_canvas;
            this.constructIRfromETC();
        }
        this.receivers[0].IR.drawResponse(canvas, this.rlParams.internalDistToRealTime(this.time), this.responseVisualization);
        this.maxDuration = this.rlParams.realTimeToInternalTime(this.receivers[0].IR.maxDuration);
    } else
    if (this.ETC_canvas) {  // Energy-time curve
        if (this.responseVisualization == ETC_CURVE)
            this.receivers[0].ETC.drawResponse(this.ETC_canvas, this.rlParams.internalDistToRealTime(this.time), this.responseVisualization);
        else {
            var sch = this.receivers[0].ETC.SchroederBackwardIntegration();
            sch.drawResponse(this.ETC_canvas, this.rlParams.internalDistToRealTime(this.time), this.responseVisualization);
        }
        this.maxDuration = this.rlParams.realTimeToInternalTime(this.receivers[0].ETC.maxDuration);
    }
};

//
// The one call to rule them all!
//
GA.prototype.drawAll = function(drawExtraCanvases) {
    var style, level;

    if (typeof drawExtraCanvases == 'undefined')
        drawExtraCanvases = true;

    if (!this.inAnimation)
        this.time = this.timeSlider * this.maxDuration;

    this.ctx = document.getElementById(this.id).getContext('2d');

    var maxO = this.maxShowOrder();
    if (this.maxOrder != maxO) {
        this.maxOrder = maxO;
        this.computeAll();
    }
    if (this.sources.length >= MAX_IMAGE_SOURCES) {
        this.drawWarning();
        return;
    }

    clearTimeout(timer);
    var i, j;
    var drawRay = false;
    var tmpSrc;
    if (this.simulationModes[BEM] == 1)
        clearCanvas(this.ctx, this.orderColors[this.backgroundColor]);
    else
        clearCanvas(this.ctx);
    this.drawGeometry(1);

    if (typeof this.showOrders == 'undefined') {
        this.showOrders = [];
        for (i=0;i<10;i++)
            this.showOrders[i] = 1;
    }
    this.nofDrawnSources = 0;
    for (i=0;i<this.sources.length;i++)
        if (this.showOrders[this.sources[i].order] == 1) {
            this.nofDrawnSources++;
            this.markSourceLocation(this.sources[i].loc, this.sources[i].order);
            if ((this.visualize[BEAMS] == 1) && (this.beamVisualization != SHOW_NO_BEAMS))
                if ((this.beamVisualization == ALL_BEAMS) || (i == this.beamToBeVisualized)) {
                    var beamToBeDrawn = this.sources[i];
                    var lineWidth = 1;
                    if (this.beamVisualization == BEAM_BRANCH)
                        lineWidth = 3;
                    while ((beamToBeDrawn!=-1) && (beamToBeDrawn.parent != -1)) {
                        this.drawBeam(beamToBeDrawn.beam, beamToBeDrawn.order, lineWidth);
                        if (this.beamVisualization == BEAM_BRANCH) {
                            beamToBeDrawn = beamToBeDrawn.parent;
                            lineWidth = 1;
                        } else
                            beamToBeDrawn = -1;
                    }
                    if (this.beamVisualization == SINGLE_BEAM)
                        this.highlightChildren(this.sources[i]);
                }
            if (this.visualize[WAVE_FRONTS] == 1) {
                var sourceRadius = this.time - this.sources[i].startTime;
                if (sourceRadius>0)
                    this.drawWaveFront(this.sources[i], this.sources[i].beam, sourceRadius);
            }
        }
    this.nofDrawnRays = 0;
    for (i=0;i<this.rayPaths.length;i++) {
        drawRay = false;
        if (this.rayPaths[i].type == IMAGE_SOURCE_RAY) {
            if (this.beamVisualization == BEAM_BRANCH) {
                drawRay = (i == this.beamToBeVisualized);
            } else if ((this.showOrders[this.rayPaths[i].order] == 1) && (this.isVisualize[this.rayPaths[i].status] == 1))
                drawRay = true;
        } else
            if (this.rayVisualizationOrder > -1) {
                if ((this.rayVisualization == ALL_RAYS) || (this.rayDiffusionModel[SHADOW_RAYS] == 1))
                    drawRay = true;
                else if ((this.rayVisualization == AUDIBLE_RAYS) && (this.rayPaths[i].status == AUDIBLE))
                    drawRay = true;
            }
        if (drawRay == true) {
            this.nofDrawnRays++;
            var r = this.rayPaths[i];
            if (this.visualize[FULL_RAYS] == 1) {
                this.drawRayPath(r, -1, FULL_PATH_VISUALIZATION_TIME, rayStrokeStyles[r.status], 1, false);
                for(j=0; j< r.shadowRays.length; j++)
                    if (r.shadowRays[j])
                        this.drawRayPath(r.shadowRays[j], -1, FULL_PATH_VISUALIZATION_TIME, rayStrokeStyles[SHADOW_RAY_STYLE], 1, false);
            }
            if (this.visualize[RAY_SEGMENTS] == 1) {
                var startTime = Math.max(0, this.time - raySectionLengthInTime);
                style = { color: this.orderColors[this.currentOrderColormap][r.startTimes.length - 1], style: [] };
                this.drawRayPath(r, startTime, this.time, style, 2.5, false);
                for(j=0; j< r.shadowRays.length; j++)
                    if (r.shadowRays[j])
                        this.drawRayPath(r.shadowRays[j], startTime, this.time, rayStrokeStyles[SHADOW_RAY_STYLE], 2, false);
            }
            if (this.visualize[RAY_EXTENSIONS] == 1) {
                tmpSrc = r.source;
                for (j = r.directions.length - 1; j > 0; j--) {
                    this.drawRayExtension(r.points[j], tmpSrc.loc);
                    tmpSrc = tmpSrc.parent;
                }
            }
        }
        if (this.visualize[RAY_EMISSION] == 1) {
            var tmp = this.rayVisualizationOrder;
            this.rayVisualizationOrder = 0;
            this.drawRayPath(this.rayPaths[i], -1, emittedRayDuration, "#000000", 1, true);
            this.rayVisualizationOrder = tmp;
        }
    }

    if (this.visualize[SHOW_RECEIVER] == 1) {
        var rec = this.receivers[0];
        if (this.receiverRadius > 0)
            this.drawWaveFront({loc: rec.loc, order: RECEIVER}, CIRCLE, this.receiverRadius); // A dirty hack to get a circle
        else
            this.drawCross(rec.loc, RECEIVER);

        if (this.visualize[RAY_SEGMENTS] == 1) {
            var nofSlots = 36;
            if (this.scaler > 1.0)
                nofSlots += Math.floor((this.scaler - 1) * 20);
            var rayletDistribution = new PolarDensity(nofSlots, -M_PI, M_PI);
            var order;
            for (order = 0; order <= this.maxOrder; order++) {
                for (i = 0; i < rec.registeredPaths.length; i++) {
                    var rayEvent = rec.registeredPaths[i];
                    var eTime = rayEvent.time;
                    if ((eTime < this.time) && (rayEvent.order == order) && (rayEvent.type == AUDIBLE)) {
                    // if ((eTime < this.time) && (rayEvent.order == order)) {
                        var rayID = rayEvent.rayID;
                        var incidentAngle = getLineOrientation(this.rayPaths[rayID].points[rayEvent.order], rec.loc);
                        level = rayletDistribution.addNew(incidentAngle);
                        eTime = eTime - (level * raySectionLengthInTime * 0.8);
                        style = {color: this.orderColors[this.currentOrderColormap][rayEvent.order], style: []};
                        this.drawRayPath(this.rayPaths[rayID], eTime - raySectionLengthInTime, eTime, style, 2.5, false);
                    }
                }
            }
        }
    }

    if (this.visualize[SHOW_PRIMARY_SOURCE] == 1) {
        this.drawWaveFront({loc: this.sources[0].loc, order: 0}, CIRCLE, cross_size);
        this.drawCross(this.sources[0].loc, SOURCE);
    }

    if (this.visualize[BRDF_SLOTS] == 1)
        this.drawBRDFs(this.sources[0].loc);

    if (this.visualize[RADIANCE] == 1)
        this.drawARTresponses();

    updateInformationFields(this.informationFields);

    if (this.isTreeWin)
        this.resizeAndDrawTree(this.isTreeWin);

    if (this.showScale == 1) {
        this.rlParams.tuneSpatialScaler(this.geometryScaler);
        this.showGeometryScaler();
    }
    if (drawExtraCanvases)
        this.drawExtras();
};


//
// Playing with timers to make the animations work
//

var rayNumber = 0;
var room;

function drawGeometryAndRay() {
    clearCanvas(room.ctx);
    room.drawGeometry(1);
    room.drawRayPath(room.rayPaths[rayNumber], -1, FULL_PATH_VISUALIZATION_TIME, rayStrokeStyles[room.rayPaths[rayNumber].status], 1, false);
    room.drawWaveFront({loc: room.receivers[0].loc, order: RECEIVER}, CIRCLE, room.receiverRadius); // A dirty hack to get a circle
    rayNumber++;
    if (rayNumber<room.rayPaths.length)
        setTimeout(drawGeometryAndRay, 5000/room.rayPaths.length);
    else
        room.drawAll();
}

GA.prototype.rayByRayAnimation = function() {
    rayNumber = 0;
    room = this;
    timer = setTimeout(drawGeometryAndRay, 0);
};

//
// Temporal animation
//

var NOF_ANIMATION_STEPS = 200;
var RELATIVE_TEMPORAL_ANIMATION_INCREMENT = 1/NOF_ANIMATION_STEPS;

function drawAllForTemporalAnimation() {
    room.drawAll();
    room.timeSlider += RELATIVE_TEMPORAL_ANIMATION_INCREMENT;
    if (room.timeSlider < 1)
        setTimeout(drawAllForTemporalAnimation, room.animationTime/NOF_ANIMATION_STEPS);
}

GA.prototype.temporalAnimation = function() {
    room = this;
    this.timeSlider = 0;
    timer = setTimeout(drawAllForTemporalAnimation, 0);
};

