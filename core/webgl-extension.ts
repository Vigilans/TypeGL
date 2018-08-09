
export interface WebGLProgramInfo {
    vShader: WebGLShader;
    fShader: WebGLShader;
    program: WebGLProgram;
    attributeSetters: Map<string, Function>;
    uniformSetters: Map<string, Function>;
}

// 为 WebGL Context 补充方法
declare global {
    interface WebGLRenderingContext {
        initShader(code: string, type: number): WebGLShader | null;
        initProgram(vShader: WebGLShader, fShader: WebGLShader): WebGLProgram | null;
        createProgramInfo(this: WebGLRenderingContext, program: WebGLProgram): WebGLProgram;
    }
}

Object.assign(WebGLRenderingContext.prototype, {

    initShader(this: WebGLRenderingContext, code: string, type: number) {
        let shader = this.createShader(type);
        this.shaderSource(shader, code);
        this.compileShader(shader);
        
        if (this.getShaderParameter(shader, this.COMPILE_STATUS)){               
            return shader; // 编译成功，返回着色器
        } else { 
            console.log(this.getShaderInfoLog(shader));
            this.deleteShader(shader);
            return null;   // 编译失败，打印错误消息
        }
    },

    initProgram(this: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader) {
        let program = this.createProgram();
        this.attachShader(program, vShader);
        this.attachShader(program, fShader);
        this.linkProgram(program);
    
        // 判断着色器的连接是否成功
        if (this.getProgramParameter(program, this.LINK_STATUS)) {
            this.useProgram(program); // 成功的话，将程序对象设置为有效
            return program; // 返回程序对象
        } else {
            console.log(this.getProgramInfoLog(program)); // 弹出错误信息
            this.deleteProgram(program);
            return null;
        }
    },

    createProgramInfo(this: WebGLRenderingContext, program: WebGLProgram) {

    }
})
