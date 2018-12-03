import { Canvas } from "./canvas.js";
import { WebGLAttribute, WebGLUniformType } from "./webgl-extension.js";
import { WebGLRenderingObject } from "./webgl-object.js";
import * as MV from "./MV.js";

export function createCircleVertices(center: MV.Vector2D, radius: number, mode: "fill" | "stroke") {
    const numCircleVerts = 100;
    return [
        ...mode == "fill" ? [center] : [],
        ...Array.range(0, numCircleVerts + 1).map(i => {
            const rad = 2 * Math.PI * i / numCircleVerts;
            return Array.add(center, Array.mul(radius, [Math.cos(rad), Math.sin(rad)])) as MV.Vector2D;
        })
    ] as Array<MV.Vector2D>;
}

export function createBezierCurveVertices(points: Array<MV.Vector2D>, mode: "fill" | "stroke" = "stroke") {
    const numVertexes = 50;
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

// 组合函数
export function bindDrawing2D<T extends any[]>(createVertices: (..._Args: T) => MV.Vector2D[]) {
    return function (this: Canvas, color: string | number[], ...args: T) {
        const vertices = createVertices(...args);
        const mode: "fill" | "stroke" = args.slice(-1)[0]; // 传入的函数需要保证最后一个参数是mode
        const attributes = {
            a_Position: {
                numComponents: 2,
                data: [].concat(...vertices.map(v => this.normVec2D(v)))
            }
        };
        return this.drawFigure2D(color, mode, attributes);
    }
}

const drawFigureBindings = {
    drawTriangle: bindDrawing2D((points: Array<MV.Vector2D>, mode: "fill" | "stroke" = "fill") => points),
    drawCircle: bindDrawing2D(createCircleVertices),
    drawBezierCurve: bindDrawing2D(createBezierCurveVertices)
};

declare module "./canvas.js" {
    interface Canvas {
        setLineThickness(thickness: number): void;
        drawFigure2D(color: string | number[], mode: "fill" | "stroke", attributes?: { [key: string]: WebGLAttribute }, uniforms?: { [key: string]: WebGLUniformType }): WebGLRenderingObject;
        drawTriangle: typeof drawFigureBindings.drawTriangle;
        drawCircle: typeof drawFigureBindings.drawCircle;
        drawBezierCurve: typeof drawFigureBindings.drawBezierCurve;
    }
}

Object.assign(Canvas.prototype, {

    drawFigure2D(
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

    setLineThickness(this: Canvas, thickness: number) {
        this.gl.lineWidth(thickness);
    },

}, drawFigureBindings);
