import { Canvas } from "./canvas.js"
import { WebGLRenderingObject } from "./webgl-extension.js";

declare module "./canvas.js" {
    interface Canvas {
        drawCircle(center: [number, number], radius: number, color: string | number[], mode: "fill" | "stroke"): WebGLRenderingObject;
    }
}

Object.assign(Canvas.prototype, {
    drawCircle(this: Canvas, center: [number, number], radius: number, color: string | number[], mode: "fill" | "stroke") {
        let numCircleVerts = 50;
        let source = {
            vertSrc: `
                attribute vec4 a_Position;

                void main() {
                    gl_Position = a_Position;
                }
            `,
            fragSrc: `
                precision mediump float;
                uniform vec3 u_Color;
                
                void main() {
                    gl_FragColor = vec4(u_Color, 1.0);
                }            
            `
        };
        let attributes = {
            a_Position: {
                numComponents: 2,
                data: [
                    ...mode == "fill" ? this.normVec2D(center) : [],
                    ...[].concat(...Array.range(0, numCircleVerts + 1).map(i => {
                        const rad = 2 * Math.PI * i / numCircleVerts;
                        return this.normVec2D(Array.add(center, Array.mul(radius, [Math.cos(rad), Math.sin(rad)])));
                    }))
                ]
            }
        };
        let uniforms = {
            u_Color: this.normRgb(color)
        };
        return this.newObject(source, this.fillOrStroke(mode), attributes, uniforms);
    }
});
