import { Canvas } from "../../core/canvas.js";
import "../../core/2d-figures.js"
import { WebGLAttributeMap } from "../../core/webgl-extension.js";

async function main() {
    let canvas = new Canvas("canvas");
    canvas.size = [800, 600];
    
    let source = await canvas.sourceByFile("main.glslv", "main.glslf");

    let attributes = {
        a_Position: { 
            numComponents: 2, 
            data: [
                -0.5,  0.0, 
                -0.0, -0.5, 
                 0.0,  0.5, 
                 0.5,  0.0
            ] 
        },
        a_Color: { 
            numComponents: 3, 
            data: [
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0,
                1.0, 0.0, 0.0,
                0.0, 0.0, 0.0
            ] 
        }
    }
    canvas.gl.clearColor(0.0, 0.0, 0.0, 0.6);
    canvas.gl.clear(canvas.gl.COLOR_BUFFER_BIT);
    canvas.gl.lineWidth(10);
    canvas.newObject(source, canvas.gl.TRIANGLE_STRIP, attributes);
    // canvas.drawCircle("#ff8bd2", [400, 300], 100, "fill");
    // canvas.drawBezierCurve("#e9565e", [[326, 413], [593, 296], [660, 470], [463, 552]], "stroke");
    canvas.render();
}

main();
