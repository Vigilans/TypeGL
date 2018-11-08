import { Canvas } from "../core/canvas.js";
import "../core/figures.js"

async function main() {
    let canvas = new Canvas("canvas");
    canvas.setLineThickness(12);
    
    // 尾巴
    canvas.drawBezierCurve([[88, 878], [88, 901], [116, 903], [131, 893]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[131, 893], [143, 885], [148, 853], [127, 854]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[127, 854], [105, 854], [106, 903], [153, 893]], "#f3b9d5", "stroke");
    
    // 右手
    canvas.drawBezierCurve([[80, 810], [108, 784], [168, 762], [202, 756]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[78, 776], [93, 775], [110, 786], [113, 790]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[113, 790], [115, 794], [108, 811], [106, 815]], "#f3b9d5", "stroke");

    // 左手
    canvas.drawBezierCurve([[501, 760], [524, 762], [597, 790], [614, 811]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[586, 818], [581, 810], [581, 793], [582, 790]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[582, 790], [583, 788], [591, 776], [614, 780]], "#f3b9d5", "stroke");

    // 右腿 & 右脚
    canvas.setLineThickness(16);
    canvas.drawBezierCurve([[240, 967], [235, 970], [235, 980], [240, 1028]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[235, 1036], [347, 996], [392, 1068], [237, 1049]], "#000000", "fill");

    // 左腿 & 左脚
    canvas.setLineThickness(16);
    canvas.drawBezierCurve([[405, 967], [400, 970], [400, 980], [405, 1028]], "#f3b9d5", "stroke");
    canvas.drawBezierCurve([[399, 1037], [522, 996], [546, 1066], [400, 1048]], "#000000", "fill");

    // 身体
    canvas.drawTriangle([[159, 954], [356, 649], [533, 958]], "#e9565e", "fill");
    canvas.drawBezierCurve([[159, 954], [162, 733], [260, 648], [356, 649]], "#e9565e", "fill");
    canvas.drawBezierCurve([[356, 649], [443, 650], [527, 750], [533, 958]], "#e9565e", "fill");
    // canvas.drawBezierCurve([[159, 954], [162, 733], [260, 648], [356, 649]], "rgb(220,20,60)", "stroke");
    // canvas.drawBezierCurve([[356, 649], [443, 650], [527, 750], [533, 958]], "rgb(220,20,60)", "stroke");

    // 头
    canvas.drawTriangle([[326, 413], [463, 552], [266, 736]], "#feb0e0", "fill");
    canvas.drawBezierCurve([[326, 413], [593, 296], [660, 470], [463, 552]], "#feb0e0", "fill");
    canvas.drawBezierCurve([[463, 552], [576, 687], [362, 787], [266, 736]], "#feb0e0", "fill");
    canvas.drawBezierCurve([[266, 736], [171, 691], [115, 501], [326, 413]], "#feb0e0", "fill");
    canvas.drawBezierCurve([[326, 413], [593, 296], [660, 470], [463, 552]], "#e39bd2", "stroke");
    canvas.drawBezierCurve([[463, 552], [576, 687], [362, 787], [266, 736]], "#e39bd2", "stroke");
    canvas.drawBezierCurve([[266, 736], [171, 691], [115, 501], [326, 413]], "#e39bd2", "stroke");

    // 腮红
    canvas.drawCircle([254,596], 47, "#ff8bd2", "fill");

    // 右眼
    canvas.drawCircle([323,476], 28, "#ffffff", "fill");
    canvas.drawCircle([323,476], 28, "#e39bd2", "stroke");
    canvas.drawCircle([331,473], 11, "#000000", "fill");

    // 左眼
    canvas.drawCircle([398,437], 26, "#ffffff", "fill");
    canvas.drawCircle([398,437], 26, "#e39bd2", "stroke");
    canvas.drawCircle([404,433], 11, "#000000", "fill");

    // 鼻子
    canvas.drawBezierCurve([[480, 380], [439, 423], [513, 521], [564, 474]], "#e39bd2", "stroke");
    canvas.drawCircle([507,429], 11, "#d272a8", "fill");
    canvas.drawCircle([539,423], 11, "#d272a8", "fill");

    // 右耳
    canvas.drawBezierCurve([[222, 475], [122, 413], [218, 336], [258, 443]], "#feb0e0", "fill");
    canvas.drawBezierCurve([[222, 475], [122, 413], [218, 336], [258, 443]], "#e39bd2", "stroke");

    // 左耳
    canvas.drawBezierCurve([[298, 423], [210, 341], [330, 290], [327, 407]], "#feb0e0", "fill");
    canvas.drawBezierCurve([[298, 423], [210, 341], [330, 290], [327, 407]], "#e39bd2", "stroke");

    // 嘴
    canvas.drawBezierCurve([[326, 628], [356, 689], [460, 654], [449, 594]], "#d55f9b", "stroke");

    canvas.render();
}

main();
