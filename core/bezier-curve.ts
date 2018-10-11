import { Canvas } from "./canvas.js"
import { WebGLRenderingObject } from "./webgl-extension.js";

declare module "./canvas.js" {
    interface Canvas {
        drawBezierCurve(points: Array<[number, number]>, color: string | number[], mode: "fill" | "stroke"): WebGLRenderingObject;
    }
}

Object.assign(Canvas.prototype, {
    drawBezierCurve(this: Canvas, points: Array<[number, number]>, color: string | number[], mode: "fill" | "stroke") {
        let numVertexes = 50;
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
                data: [].concat(...Array.range(0, numVertexes + 1).map(i => {
                    const t = i / numVertexes;
                    const it = 1 - t;
                    return this.normVec2D(Array.add(
                        Array.mul(points[0], it * it * it),
                        Array.mul(points[1], 3, t, it * it),
                        Array.mul(points[2], 3, t * t, it),
                        Array.mul(points[3], t * t * t)
                    ));
                }))
            }
        };
        let uniforms = {
            u_Color: this.normRgb(color)
        };
        return this.newObject(source, this.fillOrStroke(mode), attributes, uniforms);
    }
});
