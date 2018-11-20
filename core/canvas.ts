import { WebGLRenderingObject, WebGLAttribute, WebGLUniformType } from "./webgl-extension.js";

export class Canvas {

    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    public objectsToDraw: Array<WebGLRenderingObject> = [];

    public get size() { return [this.canvas.width, this.canvas.height]; }
    public set size(size : [number, number]) { [this.canvas.width, this.canvas.height] = size; }

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
    }

    public newObject(
        source: { vertSrc: string, fragSrc: string }, 
        mode?: number,
        attributes?: { [key: string]: WebGLAttribute },
        uniforms?: { [key: string]: WebGLUniformType },
    ) {
        let object = new WebGLRenderingObject(this.gl);
        let vShader = this.gl.initShader(source.vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(source.fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);
        object.programInfo = this.gl.createProgramInfo(program, mode);
        object.bufferInfo = this.gl.createBufferInfo(attributes);
        object.uniforms = uniforms || {};
        this.objectsToDraw.push(object);
        return object;
    }

    public sourceByDom(vNode: string, fNode: string) {
        let [vertSrc, fragSrc] = [vNode, fNode].map(document.getElementById).map((e: HTMLScriptElement) => e.text);
        return { vertSrc, fragSrc };
    }

    public async sourceByFile(vPath: string, fPath: string) {
        let [vertSrc, fragSrc] = await Promise.all([vPath, fPath].map(async p => await (await fetch(p)).text()));
        return { vertSrc, fragSrc };
    }

    public render(callback?: (c: Canvas, deltaTime?:number) => void, anime?: boolean) {
        this.gl.viewport(0, 0, ...this.size);

        let lastUsedProgramInfo = null;
        let lastUsedBufferInfo = null;
        let then = 0.0;

        let mainLoop = (now: number) => {
            now *= 0.001; // convert time from ms to s
            if (callback) {
                callback(this, now - then);
            }
            then = now;

            for (let obj of this.objectsToDraw) {
                let bindBuffers = false;
                
                if (obj.programInfo !== lastUsedProgramInfo) {
                    lastUsedProgramInfo = obj.programInfo;
                    this.gl.useProgram(obj.programInfo.program);
                    bindBuffers = true;
                }
                
                if (bindBuffers || obj.bufferInfo !== lastUsedBufferInfo) {
                    lastUsedBufferInfo = obj.bufferInfo;
                    // Setup all the needed attributes.
                    for (let [name, attr] of Object.entries(obj.bufferInfo.attributes)) {
                        let setter = obj.programInfo.attributeSetters[name];
                        if (setter) {
                            setter(attr);
                        }
                    }
                }
    
                // Set the uniforms.
                for (let [name, uniform] of Object.entries(obj.uniforms)) {
                    let setter = obj.programInfo.uniformSetters[name];
                    if (setter) {
                        setter(uniform);
                    }
                }
    
                // Draw
                obj.draw();
            }

            if (anime) {
                requestAnimationFrame(mainLoop);
            }
        }

        requestAnimationFrame(mainLoop);
    }

    /*
        Input: Vec2 in [width, height] origins at top-left
        Output: Vec2 in [-1, 1] origins at bottom-left
    */
    public normVec2D(vec: number[]): number[] {
        return [
            2 * vec[0] / this.size[0] - 1,
            2 * (this.size[1] - vec[1]) / this.size[1] - 1
        ];
    }

    /*
        Input: "rgb(r,g,b)" or "#rrggbb" or [r, g, b] in [0, 255]
        Output: [r, g, b] in [0, 1] 
    */
    public normRgb(rgb: number[] | string): number[] {
        if (typeof rgb == "object") {
            return (rgb as number[]).map(v => v / 255);
        } else if (typeof rgb == "string") {
            let strRgb = rgb as string;
            let hashReg = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
            let rgbReg = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
            switch (true) {
                case hashReg.test(strRgb):
                    return this.normRgb(hashReg.exec(strRgb).slice(1).map(v => Number(`0x${v}`)));
                case rgbReg.test(strRgb):
                    return this.normRgb(rgbReg.exec(strRgb).slice(1).map(Number));
                default:
                    throw ("invalid rgb format");
            }
        }
    }

    public fillOrStroke(mode: "fill" | "stroke"): number {
        return ({
            "fill": this.gl.TRIANGLE_FAN,
            "stroke": this.gl.LINE_STRIP
        })[mode];
    }
}
