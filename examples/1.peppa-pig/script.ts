import { Canvas } from "../../core/canvas.js";
import "../../core/2d-figures.js"

async function main() {
    let canvas = new Canvas("canvas");
    canvas.setLineThickness(12);
    
    // 尾巴
    canvas.drawBezierCurve("#f3b9d5", [[88, 878],  [88, 901],  [116, 903], [131, 893]], "stroke");
    canvas.drawBezierCurve("#f3b9d5", [[131, 893], [143, 885], [148, 853], [127, 854]], "stroke");
    canvas.drawBezierCurve("#f3b9d5", [[127, 854], [105, 854], [106, 903], [153, 893]], "stroke");
    
    // 右手
    canvas.drawBezierCurve("#f3b9d5", [[80, 810],  [108, 784], [168, 762], [202, 756]], "stroke");
    canvas.drawBezierCurve("#f3b9d5", [[78, 776],  [93, 775],  [110, 786], [113, 790]], "stroke");
    canvas.drawBezierCurve("#f3b9d5", [[113, 790], [115, 794], [108, 811], [106, 815]], "stroke");

    // 左手
    canvas.drawBezierCurve("#f3b9d5", [[501, 760], [524, 762], [597, 790], [614, 811]], "stroke");
    canvas.drawBezierCurve("#f3b9d5", [[586, 818], [581, 810], [581, 793], [582, 790]], "stroke");
    canvas.drawBezierCurve("#f3b9d5", [[582, 790], [583, 788], [591, 776], [614, 780]], "stroke");

    // 右腿 & 右脚
    canvas.setLineThickness(16);
    canvas.drawBezierCurve("#f3b9d5", [[240, 967],  [235, 970], [235, 980],  [240, 1028]], "stroke");
    canvas.drawBezierCurve("#000000", [[235, 1036], [347, 996], [392, 1068], [237, 1049]], "fill");

    // 左腿 & 左脚
    canvas.setLineThickness(16);
    canvas.drawBezierCurve("#f3b9d5", [[405, 967],  [400, 970], [400, 980],  [405, 1028]], "stroke");
    canvas.drawBezierCurve("#000000", [[399, 1037], [522, 996], [546, 1066], [400, 1048]], "fill");

    // 身体
    canvas.drawTriangle("#e9565e", [[159, 954], [356, 649], [533, 958]], "fill");
    canvas.drawBezierCurve("#e9565e", [[159, 954], [162, 733], [260, 648], [356, 649]], "fill");
    canvas.drawBezierCurve("#e9565e", [[356, 649], [443, 650], [527, 750], [533, 958]], "fill");
    canvas.drawBezierCurve("rgb(220,20,60)", [[159, 954], [162, 733], [260, 648], [356, 649]], "stroke");
    canvas.drawBezierCurve("rgb(220,20,60)", [[356, 649], [443, 650], [527, 750], [533, 958]], "stroke");

    // 头
    canvas.drawTriangle("#feb0e0", [[326, 413], [463, 552], [266, 736]], "fill");
    canvas.drawBezierCurve("#feb0e0", [[326, 413], [593, 296], [660, 470], [463, 552]], "fill");
    canvas.drawBezierCurve("#feb0e0", [[463, 552], [576, 687], [362, 787], [266, 736]], "fill");
    canvas.drawBezierCurve("#feb0e0", [[266, 736], [171, 691], [115, 501], [326, 413]], "fill");
    canvas.drawBezierCurve("#e39bd2", [[326, 413], [593, 296], [660, 470], [463, 552]], "stroke");
    canvas.drawBezierCurve("#e39bd2", [[463, 552], [576, 687], [362, 787], [266, 736]], "stroke");
    canvas.drawBezierCurve("#e39bd2", [[266, 736], [171, 691], [115, 501], [326, 413]], "stroke");

    // 腮红
    canvas.drawCircle("#ff8bd2", [254,596], 47, "fill");

    // 右眼
    canvas.drawCircle("#ffffff", [323,476], 28, "fill");
    canvas.drawCircle("#e39bd2", [323,476], 28, "stroke");
    canvas.drawCircle("#000000", [331,473], 11, "fill");

    // 左眼
    canvas.drawCircle("#ffffff", [398,437], 26, "fill");
    canvas.drawCircle("#e39bd2", [398,437], 26, "stroke");
    canvas.drawCircle("#000000", [404,433], 11, "fill");

    // 鼻子
    canvas.drawBezierCurve("#e39bd2", [[480, 380], [439, 423], [513, 521], [564, 474]], "stroke");
    canvas.drawCircle("#d272a8", [507,429], 11, "fill");
    canvas.drawCircle("#d272a8", [539,423], 11, "fill");

    // 右耳
    canvas.drawBezierCurve("#feb0e0", [[222, 475], [122, 413], [218, 336], [258, 443]], "fill");
    canvas.drawBezierCurve("#e39bd2", [[222, 475], [122, 413], [218, 336], [258, 443]], "stroke");

    // 左耳
    canvas.drawBezierCurve("#feb0e0", [[298, 423], [210, 341], [330, 290], [327, 407]], "fill");
    canvas.drawBezierCurve("#e39bd2", [[298, 423], [210, 341], [330, 290], [327, 407]], "stroke");

    // 嘴
    canvas.drawBezierCurve("#d55f9b", [[326, 628], [356, 689], [460, 654], [449, 594]], "stroke");

    canvas.render();
    canvas.gl.disable(canvas.gl.DEPTH_TEST);
}

main();
