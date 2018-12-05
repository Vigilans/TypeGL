import { Canvas } from "../core/canvas.js";
import { WebGLOrientedObject } from "../core/webgl-object.js";
import * as MV from "../core/MV.js"
import * as gl2d from "../core/2d-figures.js"
import * as gl3d from "../core/3d-geometry.js"
import "../core/3d-geometry.js"
import "../core/camera.js"
import "../core/controller.js"
import "../core/lighting.js"


let c = new Canvas("canvas");

async function main() {
    let source = await c.sourceByFile("shader.glslv", "shader.glslf");

    c.drawSphere("#ffff00", "stroke", source, 0.5, 16, 16);

    c.drawPlane([0, 0, 0], "stroke", source, 128, 128, 32, 32);

    c.bindCamera(50, undefined, [1, 0, 3]);
 
    c.render(true);
}


function createFishWithCardioid(focusObj: WebGLOrientedObject, source) {
    let fishVerts = gl2d.createBezierCurveVertices([
        [313, 0],    [298, 4],   [259, -20], [230, -46], [333, -152],
        [691, -157], [870, -11], [910, 0],   [969, -23], [997, -64] 
    ]);

    let curve = { position: { numComponents: 2, data: MV.flatten(fishVerts) } };
    let fish = gl3d.lathePoints(fishVerts, [0.0002, 0.0002, 0.0002], [1, 0, 0], undefined, undefined, undefined, false, false);

    let fishObj = c.newObject(
        source, c.gl.LINE_STRIP, fish, { u_Color: [1, 0.5, 0, 1] }
    );

    // 初始，鱼头指向x轴负方向，令其顺时针旋转90度
    let baseMVMatrix = MV.rotateZ(-Math.PI / 2);
    let direction = [0, 1, 0] as MV.Vector3D;
    let normal = [1, 0, 0] as MV.Vector3D;

    // 画心形线
    c.updatePipeline.push((cv, time, deltaTime) => {
        const theta = time * Math.PI;
        const rou = 0.5 * (1 + Math.sin(theta)); // a = 10
        const x = rou * Math.cos(theta);
        const y = rou * Math.sin(theta);
        const d = Math.sqrt(x * x + y * y);
        const dx = (x - 2*x*d);
        const dy = (2*y*d - d - y);
        const newDir = MV.normalize([dx, dy, 0]);
        const deltaTheta = MV.includedAngle(newDir, direction);
        fishObj.setModelView(MV.mult(
            // MV.inverse4(MV.translate(...focusObj.center)),
            // MV.inverse4(MV.coordSysTransform(focusObj.center, focusObj.coordSystem)),
            MV.translate(x, y, 0),
            MV.rotateZ(deltaTheta),
            // MV.coordSysTransform(focusObj.center, focusObj.coordSystem),
            // MV.translate(...focusObj.center),
            baseMVMatrix
        ));
    });

    return fishObj;
}

main();


