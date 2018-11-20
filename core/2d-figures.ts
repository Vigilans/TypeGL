import { Canvas } from "./canvas.js"
import { WebGLRenderingObject, WebGLAttribute, WebGLUniformType } from "./webgl-extension.js";
import * as MV from "./MV.js";

export function getVertsOnCircle(center: MV.Vector2D, radius: number, mode: "fill" | "stroke", numCircleVerts = 10): Array<MV.Vector2D> {
    return [
        ...mode == "fill" ? [center] : [],
        ...Array.range(0, numCircleVerts + 1).map(i => {
            const rad = 2 * Math.PI * i / numCircleVerts;
            return Array.add(center, Array.mul(radius, [Math.cos(rad), Math.sin(rad)])) as MV.Vector2D;
        })
    ];
}

export function getVertsOnBezierCurve(points: Array<MV.Vector2D>, numVertexes = 50): Array<MV.Vector2D> {
    let verts = [] as Array<MV.Vector2D>;
    for (let segStart = 0; segStart + 3 < points.length; segStart += 3) {
        verts.push(...Array.range(0, numVertexes + 1).map(i => {
            const t = i / numVertexes;
            const it = 1 - t;
            return Array.add(
                Array.mul(points[segStart + 0], it * it * it),
                Array.mul(points[segStart + 1], 3, t, it * it),
                Array.mul(points[segStart + 2], 3, t * t, it),
                Array.mul(points[segStart + 3], t * t * t)
            ) as MV.Vector2D;
        }));
    }
    return verts;
}

declare module "./canvas.js" {
    interface Canvas {
        setLineThickness(thickness: number): void;
        drawFigure(color: string | number[], mode: "fill" | "stroke", attributes?: { [key: string]: WebGLAttribute }, uniforms?: { [key: string]: WebGLUniformType }): WebGLRenderingObject;
        drawTriangle(points: Array<[number, number]>, color: string | number[], mode: "fill" | "stroke"): WebGLRenderingObject;
        drawCircle(center: [number, number], radius: number, color: string | number[], mode: "fill" | "stroke"): WebGLRenderingObject;
        drawBezierCurve(points: Array<[number, number]>, color: string | number[], mode: "fill" | "stroke"): WebGLRenderingObject;
    }
}

Object.assign(Canvas.prototype, {

    drawFigure(
        this: Canvas, 
        color: string | number[],
        mode: "fill" | "stroke",
        attributes?: { [key: string]: WebGLAttribute },  
        uniforms?: { [key: string]: WebGLUniformType }
    ) {
        attributes = attributes || {};
        uniforms = uniforms || {};
        let source = {
            vertSrc: ``,
            fragSrc: `
                precision mediump float;
                uniform vec3 u_Color;
                
                void main() {
                    gl_FragColor = vec4(u_Color, 1.0);
                }            
            `
        };
        if (true) {
            source.vertSrc = `
                attribute vec4 a_Position;

                void main() {
                    gl_Position = a_Position;
                }
            `;
        } else {
            source.vertSrc = `
                attribute vec2 a_Position;
                attribute vec2 a_Normal;
                attribute float a_Miter;
                uniform u_Thickness;
                
                void main() {
                    vec2 p = a_Position.xy + vec2(a_Normal * u_Thickness / 2.0 * a_Miter);
                    gl_Position = vec4(p, 0.0, 1.0);
                }
            `;
            // let path = attributes.a_Position.data.reduce((path, pose, i) => {
            //     return i % attributes.a_Position.numComponents == 0 
            //         ? [...path, [pose]] : [...path.slice(0, -1), [path.slice(-1)[0], pose]]
            // }, []);
            // let [[normals, miters]] = NormalUtil.normals(path);
            // attributes.a_Normal = { numComponents: 2, data: normals };
            // attributes.a_Miter = { numComponents: 1, data: miters };
            // uniforms.u_Thickness;
        }
        Object.assign(uniforms, { u_Color: this.normRgb(color) });
        return this.newObject(source, this.fillOrStroke(mode), attributes, uniforms);
    },

    drawTriangle(this: Canvas, points: Array<MV.Vector2D>, color: string | number[], mode: "fill" | "stroke") {
        let attributes = {
            a_Position: {
                numComponents: 2,
                data: [].concat(...points.map(v => this.normVec2D(v)))
            }
        };
        return this.drawFigure(color, mode, attributes);
    },

    drawCircle(this: Canvas, center: MV.Vector2D, radius: number, color: string | number[], mode: "fill" | "stroke") {
        let verts = getVertsOnCircle(center, radius, mode);
        let attributes = {
            a_Position: {
                numComponents: 2,
                data: [].concat(...verts.map(v => this.normVec2D(v)))
            }
        };
        return this.drawFigure(color, mode, attributes);
    },

    drawBezierCurve(this: Canvas, points: Array<MV.Vector2D>, color: string | number[], mode: "fill" | "stroke") {
        let verts = getVertsOnBezierCurve(points);
        let attributes = {
            a_Position: {
                numComponents: 2,
                data:  [].concat(...verts.map(v => this.normVec2D(v)))
            }
        };
        return this.drawFigure(color, mode, attributes);
    },

    setLineThickness(this: Canvas, thickness: number) {
        this.gl.lineWidth(thickness);
    },
});
