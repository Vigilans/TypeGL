import { Canvas } from "../core/canvas.js";
import { WebGLAttribute, WebGLAttributeMap } from "../core/webgl-extension.js";
import * as MV from "../core/MV.js"
import * as gl2d from "../core/2d-figures.js"
import * as gl3d from "../core/3d-geometry.js"
import "../core/camera.js"
import "../core/controller.js"
import "../core/lighting.js"

let c = new Canvas("canvas");

async function main() {
    let source = await c.sourceByFile("fish.glslv", "fish.glslf");

    let fish_aqua_raw = JSON.parse(await (await fetch("fish-aqua.json")).text());
    let fish_aqua = fish_aqua_raw.models[0].fields as WebGLAttributeMap;
    delete fish_aqua.indices;
    let fish_aqua_obj = c.newOrientedObject(
        source, [0, 0, 1], [0, 1, 0], c.gl.LINES,
        fish_aqua, { u_Color: [...c.normRgb([156, 43, 51]), 1] }
    );

    c.bindShadow(fish_aqua_obj, [2, 5, 0], source);

    let fish_kun = JSON.parse(await (await fetch("fish-kun.json")).text());
    delete fish_kun.indices;
    let fish_kun_obj = c.newOrientedObject(
        source, [0, 0, -1], [0, 1, 0], c.gl.LINES, 
        fish_kun, { u_Color: [1, 0.5, 0, 1] }
    );

    c.bindShadow(fish_kun_obj, [2, 5, 0], source);
    
    // 初始，鱼头指向x轴负方向，令其顺时针旋转90度
    
    let baseMVMatrix = MV.rotateZ(-Math.PI / 2);
    let direction = [0, 1, 0] as MV.Vector3D;
    let normal = [1, 0, 0] as MV.Vector3D;

    // 画心形线
    c.updatePipeline.push((cv, time, deltaTime) => {
        const theta = time * Math.PI;
        const rho = 2 * (1 + Math.sin(theta)); // a = 10
        const x = rho * Math.cos(theta);
        const y = rho * Math.sin(theta);
        const d = Math.sqrt(x * x + y * y);
        const dx = (x - 2*x*d);
        const dy = (2*y*d - d - y);
        const newDir = MV.normalize([dx, dy, 0]);
        const deltaTheta = MV.includedAngle(newDir, fish_aqua_obj.direction);
        const tMatrix = MV.translate(...fish_kun_obj.center);
        const cstMatrix = MV.coordSysTransform(fish_kun_obj.center, fish_kun_obj.coordSystem);
        fish_aqua_obj.setModelView(MV.mult(
            // MV.inverse4(tMatrix),
            MV.inverse4(cstMatrix),
            MV.translate(x, y, 0),
            MV.rotateZ(deltaTheta),
            cstMatrix,
            tMatrix,
            MV.scalem(0.2, 0.2, 0.2),
            MV.rotateX(-Math.PI / 2),
        ));
    });

    c.bindController(fish_kun_obj, { scale: 0.2 }); 
    c.bindController(fish_aqua_obj, { scale: 0.1, offset: [0, -1, 0] });

    c.bindCamera(50, undefined, [0, 0, 3]);
 
    c.render(true);
}

main();

// 获取一个保龄球瓶模型
function getBowlingPin() {
    let verts = gl2d.createBezierCurveVertices([
        [44, 371], [62, 338], [63, 305], [59, 260], [55, 215], [22, 156], [20, 128],
        [18, 100], [31, 77] , [36, 47],  [41, 17] , [39, -16], [0, -16]
    ]);
    return gl3d.lathePoints(verts, [0.002, 0.002, 0.002]);
}

