import { WebGLRenderingObject, WebGLAttribute, WebGLUniformType } from "./webgl-extension";

export class Canvas {

    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    public objectsToDraw: Array<WebGLRenderingObject>;

    public get size() { return [this.canvas.width, this.canvas.height]; }
    public set size(size : [number, number]) { [this.canvas.width, this.canvas.height] = size; }

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
    }

    public newObject(
        source: { vertSrc: string, fragSrc: string }, 
        attributes: { [key: string]: WebGLAttribute },
        uniforms: { [key: string]: WebGLUniformType },
        mode: number
    ) {
        let object = new WebGLRenderingObject(this.gl);
        let vShader = this.gl.initShader(source.vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(source.fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);
        object.programInfo = this.gl.createProgramInfo(program, mode);
        object.attributes = attributes;
        object.uniforms = uniforms;
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

    public render() {
        let lastUsedProgramInfo = null;

        for (let obj of this.objectsToDraw) {
            if (obj.programInfo !== lastUsedProgramInfo) {
                lastUsedProgramInfo = obj.programInfo;
                this.gl.useProgram(obj.programInfo.program);
            }
            obj.render();
        }
    }
}
