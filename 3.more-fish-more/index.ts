import { Canvas, WebGLOrientedObject } from "../core/canvas.js";
import { WebGLAttribute } from "../core/webgl-extension.js";
import * as MV from "../core/MV.js"
import * as gl2d from "../core/2d-figures.js"
import * as gl3d from "../core/3d-geometry.js"
import "../core/camera.js"
import "../core/controller.js"
import "../core/shadow.js"

let c = new Canvas("canvas");

async function main() {
    let source = await c.sourceByFile("fish.glslv", "fish.glslf");

    let fish_aqua_raw = JSON.parse(await (await fetch("fish-aqua.json")).text());
    let fish_aqua = fish_aqua_raw.models[0].fields as { [key: string]: WebGLAttribute };
    let fish_aqua_obj = c.newOrientedObject(
        source, [0, 0, 1], [0, 1, 0], c.gl.LINES,
        fish_aqua, { u_Color: [...c.normRgb([156, 43, 51]), 1] }
    );

    c.bindShadow(fish_aqua_obj, [2, 5, 0], source);

    let fish_kun = JSON.parse(await (await fetch("fish-kun.json")).text());
    let fish_kun_obj = c.newOrientedObject(
        source, [0, 0, -1], [0, 1, 0], c.gl.LINES, 
        fish_kun, { u_Color: [1, 0.5, 0, 1] }
    );

    c.bindShadow(fish_kun_obj, [2, 5, 0], source);

    c.bindController(fish_kun_obj, { scale: 0.2 }); 
    c.bindController(fish_aqua_obj, { scale: 0.1, offset: [0, -1, 0] });

    //let fish_trop_obj = await createFishWithCardioid(undefined, source);

    c.bindCamera(50, fish_kun_obj, [1, 0, 3]);
 
    c.render(true);
}

main();

// 获取一个保龄球瓶模型
function getBowlingPin() {
    let verts = gl2d.getVertsOnBezierCurve([
        [44, 371], [62, 338], [63, 305], [59, 260], [55, 215], [22, 156], [20, 128],
        [18, 100], [31, 77] , [36, 47],  [41, 17] , [39, -16], [0, -16]
    ]);
    return gl3d.lathePoints(verts, [0.002, 0.002, 0.002]);
}

