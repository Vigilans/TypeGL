import { WebGLRenderingObject, WebGLAttributeMap, WebGLUniformMap } from "./webgl-extension.js";
import { MatrixStack } from "./matrix-stack.js";
import * as MV from "./MV.js";

export class Canvas {

    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    public matrixStack: MatrixStack = new MatrixStack();

    public objectsToDraw: Array<WebGLRenderingObject> = [];

    public updatePipeline: Array<(c: Canvas, time?: number, deltaTime?: number) => void> = [];

    public get size() { return [this.canvas.width, this.canvas.height]; }
    public set size(size : [number, number]) { [this.canvas.width, this.canvas.height] = size; }

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
    }

    public newObject<T extends WebGLRenderingObject>(
        source: { vertSrc: string, fragSrc: string }, 
        mode?: number,
        attributes?: WebGLAttributeMap,
        uniforms?: WebGLUniformMap,
        destObj?: T
    ) {
        let object  = destObj || new WebGLRenderingObject(this.gl);
        let vShader = this.gl.initShader(source.vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(source.fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);
        object.programInfo = this.gl.createProgramInfo(program, mode);
        object.bufferInfo = this.gl.createBufferInfo(attributes);
        Object.assign(object.uniforms, uniforms, {});
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

    public render(anime?: boolean) {
        this.gl.viewport(0, 0, ...this.size);

        let lastUsedProgramInfo = null;
        let lastUsedBufferInfo = null;
        let then = 0.0;

        let mainLoop = (now: number) => {
            now *= 0.001; // convert time from ms to s
            for (let update of this.updatePipeline) {
                update(this, now, then - now);
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
        Input: Vec2 in [width, height] origining at top-left
        Output: Vec2 in [-1, 1] of clip space origining at bottom-left
    */
    public normVec2D(vec: [number, number]): [number, number] {
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

// 带朝向与法线的 WebGL 渲染对象，朝向与法线均保持初始状态。
export class WebGLOrientedObject extends WebGLRenderingObject {
    
    public constructor(
        gl: WebGLRenderingContext,
        public initDir: MV.Vector3D,
        public initNorm: MV.Vector3D
    ) { 
        super(gl);
        this.direction = initDir;
        this.normal = initNorm;
        this.initSideAxis = MV.normalize(MV.cross(initNorm, initDir));
    }

    // 朝向 × 法线形成的第三条轴
    public initSideAxis: MV.Vector3D;

    public direction: MV.Vector3D;

    public normal: MV.Vector3D;

    public get sideAxis() {  // 朝向 × 法线形成的第三条轴
        return MV.normalize(MV.cross(this.normal, this.direction));
    }

    public get coordSystem(): [MV.Vector3D, MV.Vector3D, MV.Vector3D] {
        return [this.normal, this.direction, this.sideAxis];
    }
}

declare module "./canvas.js" {
    interface Canvas {
        newOrientedObject(
            source: { vertSrc: string, fragSrc: string },
            direction: MV.Vector3D,
            normal: MV.Vector3D, 
            mode?: number,
            attributes?: WebGLAttributeMap,
            uniforms?: WebGLUniformMap,
        ): WebGLOrientedObject;
    }
}

Object.assign(Canvas.prototype, {
    newOrientedObject(this: Canvas,
        source: { vertSrc: string, fragSrc: string },
        direction: MV.Vector3D,
        normal: MV.Vector3D, 
        mode?: number,
        attributes?: WebGLAttributeMap,
        uniforms?: WebGLUniformMap,
    ) {
        return <WebGLOrientedObject>this.newObject(source, mode, attributes, uniforms, 
            new WebGLOrientedObject(this.gl, direction, normal));
    }
});
