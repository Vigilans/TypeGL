
export class Canvas {

    public canvas: HTMLCanvasElement;

    public gl: WebGLRenderingContext;

    public get size() { return [this.canvas.width, this.canvas.height]; }
    public set size(size : [number, number]) { [this.canvas.width, this.canvas.height] = size; }

    static async initByFile(canvasId: string, glslvPath: string, glslfPath: string) {
        let [vertSrc, fragSrc] = await Promise.all([glslvPath, glslfPath].map(async p => await (await fetch(p)).text()));
        return new Canvas(canvasId);
    }

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
    }

    public createShader(code: string, type: number) {
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, code);
        this.gl.compileShader(shader);
        
        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){               
            return shader; // 编译成功，返回着色器
        } else { 
            console.log(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;   // 编译失败，打印错误消息
        }
    }

    private createProgram(vShader: WebGLShader, fShader: WebGLShader) {
        let program = this.gl.createProgram();
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);

        // 判断着色器的连接是否成功
        if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.useProgram(program); // 成功的话，将程序对象设置为有效
            return program; // 返回程序对象
        } else {
            console.log(this.gl.getProgramInfoLog(program)); // 弹出错误信息
            this.gl.deleteProgram(program);
            return null;
        }
    }

}

// export class WebGLObject {

//     public gl: WebGLRenderingContext;

//     public programInfo: {
//         vShader: WebGLShader;
//         fShader: WebGLShader;
//         program: WebGLProgram;
//     };

//     public bufferInfo: {

//     }

//     public uniforms: {

//     }

//     get isValid() { return (this.vShader && this.fShader && this.program) !== null; }

// }
