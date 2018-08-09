import "./webgl-extension";

type GlslType = Array<number>;

export interface CanvasObject {
    uuid: string;

    gl: WebGLRenderingContext;

    programInfo: ProgramInfo;

    bufferInfo: {
        attributes: Map<string, GlslType>
    };

    uniforms: Map<string, GlslType>;
    
    isValid?: boolean;   
}

export class Canvas {

    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    public objectsToDraw: Array<CanvasObject>;

    public get size() { return [this.canvas.width, this.canvas.height]; }
    public set size(size : [number, number]) { [this.canvas.width, this.canvas.height] = size; }

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
    }

    newObject(vertSrc: string, fragSrc: string) {
        let vShader = this.gl.initShader(vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);
        
    }

    public newObjectByDom(vNode: string, fNode: string) {
        let [vertSrc, fragSrc] = [vNode, fNode].map(document.getElementById).map((e: HTMLScriptElement) => e.text);
        return this.newObject(vertSrc, fragSrc);
    }

    public async newObjectByFile(vPath: string, fPath: string) {
        let [vertSrc, fragSrc] = await Promise.all([vPath, fPath].map(async p => await (await fetch(p)).text()));
        return this.newObject(vertSrc, fragSrc);
    }

    public render() {
        let lastUsedBufferInfo = null;
        let lastUsedProgramInfo = null;

        for (let obj of this.objectsToDraw) {
            let { programInfo, bufferInfo, uniforms } = obj;
            let bindBuffers = false;
           
            if (programInfo !== lastUsedProgramInfo) {
                lastUsedProgramInfo = programInfo;
                this.gl.useProgram(programInfo.program);
                bindBuffers = true;
            }
           
            // Setup all the needed attributes.
            if (bindBuffers || bufferInfo != lastUsedBufferInfo) {
                lastUsedBufferInfo = bufferInfo;
                webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
            }
           
            // Set the uniforms.
            webglUtils.setUniforms(programInfo, uniforms);
           
            // Draw
            this.gl.drawArrays(this.gl.TRIANGLES, 0, bufferInfo.numElements);
        }
    }
}
