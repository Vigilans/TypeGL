import { Canvas } from "../core/canvas.js";
import * as MV from "../core/MV.js"
import "../core/3d-geometry.js"
import "../core/camera.js"
import "../core/controller.js"
import "../core/lighting.js"

let c = new Canvas("canvas");

async function main() {
    let source = await c.sourceByFile("shader.glslv", "shader.glslf");

    c.drawPlane([0, 0, 0], "stroke", source, 128, 128, 32, 32);

    c.bindCamera(50, undefined, [1, 0, 3]);
 
    c.render(true);
}

main();

