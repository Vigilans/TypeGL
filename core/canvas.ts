import { WebGLAttributeMap, WebGLUniformMap, ShaderSource } from "./webgl-extension.js";
import { WebGLRenderingObject, WebGLOrientedObject } from "./webgl-object.js";
import { MatrixStack } from "./matrix-stack.js";
import * as MV from "./MV.js";
import "./webgl-extension.js";

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
        source: ShaderSource, 
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
        const [vertSrc, fragSrc] = [vNode, fNode].map(e => document.getElementById(e)).map((e: HTMLScriptElement) => e.text);
        return { vertSrc, fragSrc };
    }

    public async sourceByFile(vPath: string, fPath: string) {
        const [vertSrc, fragSrc] = await Promise.all([vPath, fPath].map(async p => await (await fetch(p)).text()));
        return { vertSrc, fragSrc };
    }

    public render(anime?: boolean) {
        this.gl.viewport(0, 0, ...this.size);
        this.gl.enable(this.gl.DEPTH_TEST);

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
                
                if (!obj.programInfo) {
                    continue; // do not draw this object
                } if (obj.programInfo !== lastUsedProgramInfo) {
                    lastUsedProgramInfo = obj.programInfo;
                    this.gl.useProgram(obj.programInfo.program);
                    bindBuffers = true;
                }
                
                if (bindBuffers || obj.bufferInfo !== lastUsedBufferInfo) {
                    lastUsedBufferInfo = obj.bufferInfo;
                    // Setup all the needed buffers and attributes.
                    if (obj.bufferInfo.indices) {
                        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, obj.bufferInfo.indices);
                    }
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
}

declare module "./canvas.js" {
    interface Canvas {
        newOrientedObject(
            source: ShaderSource,
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
        source: ShaderSource,
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
