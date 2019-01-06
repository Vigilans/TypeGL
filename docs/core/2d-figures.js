import { Canvas } from "./canvas.js";
import { normRgb } from "./webgl-object.js";
export function createCircleVertices(center, radius, mode) {
    const numCircleVerts = 100;
    return [
        ...mode == "fill" ? [center] : [],
        ...Array.range(0, numCircleVerts + 1).map(i => {
            const rad = 2 * Math.PI * i / numCircleVerts;
            return Array.add(center, Array.mul(radius, [Math.cos(rad), Math.sin(rad)]));
        })
    ];
}
export function createBezierCurveVertices(points, mode = "stroke") {
    const numVertexes = 50;
    let verts = [];
    for (let segStart = 0; segStart + 3 < points.length; segStart += 3) {
        verts.push(...Array.range(0, numVertexes + 1).map(i => {
            const t = i / numVertexes;
            const it = 1 - t;
            return Array.add(Array.mul(points[segStart + 0], it * it * it), Array.mul(points[segStart + 1], 3, t, it * it), Array.mul(points[segStart + 2], 3, t * t, it), Array.mul(points[segStart + 3], t * t * t));
        }));
    }
    return verts;
}
// 组合函数
export function bindDrawing2D(createVertices) {
    return function (color, ...args) {
        const vertices = createVertices(...args);
        const mode = args.slice(-1)[0]; // 传入的函数需要保证最后一个参数是mode
        const attributes = {
            a_Position: {
                numComponents: 2,
                data: [].concat(...vertices.map(v => this.normVec2D(v)))
            }
        };
        return this.drawFigure2D(color, mode, attributes);
    };
}
const drawFigureBindings = {
    drawTriangle: bindDrawing2D((points, mode = "fill") => points),
    drawCircle: bindDrawing2D(createCircleVertices),
    drawBezierCurve: bindDrawing2D(createBezierCurveVertices)
};
Object.assign(Canvas.prototype, {
    drawFigure2D(color, mode, attributes, uniforms) {
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
        }
        else {
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
        Object.assign(uniforms, { u_Color: normRgb(color) });
        let drawMode;
        switch (mode) {
            case "fill":
                drawMode = this.gl.TRIANGLE_FAN;
                break;
            case "stroke":
                drawMode = this.gl.LINE_STRIP;
                break;
            default: throw Error(`Invalid mode: ${mode}`);
        }
        return this.newObject(source, drawMode, attributes, uniforms);
    },
    setLineThickness(thickness) {
        this.gl.lineWidth(thickness);
    },
}, drawFigureBindings);
//# sourceMappingURL=2d-figures.js.map