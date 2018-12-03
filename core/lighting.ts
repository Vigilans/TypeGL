import * as MV from "./MV.js";
import { Canvas } from "./canvas.js";
import { WebGLUniformMap, ShaderSource } from "./webgl-extension.js";
import { WebGLRenderingObject } from "./webgl-object.js";


declare module "./canvas.js" {
    interface Canvas {
        bindShadow(
            srcObj: WebGLRenderingObject,
            light: MV.Vector3D,
            source: ShaderSource
        );
    }
}

Object.assign(Canvas.prototype, {
    bindShadow(this: Canvas, 
        srcObj: WebGLRenderingObject,        
        light:MV.Vector3D,
        source: ShaderSource
    ) {
        let shadowObj = new WebGLRenderingObject(this.gl);
        let vShader = this.gl.initShader(source.vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(source.fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);

        shadowObj.bufferInfo = srcObj.bufferInfo; // 复用Buffer
        shadowObj.programInfo = this.gl.createProgramInfo(program, this.gl.TRIANGLES);
        shadowObj.uniforms = {
            u_Color: [0, 0, 0, 1]
        }
        this.objectsToDraw.push(shadowObj);
        this.updatePipeline.push(c => {
            const T1 = MV.translate(light[0], light[1], light[2]);
            const M = MV.mat4();
            M[3][3] = 0;
            M[3][1] = -1 / light[1];
            const T2 = MV.translate(-light[0], -light[1], -light[2]);
            shadowObj.setModelView(MV.mult(T1, M, T2, srcObj.mvMatrix));
        });
    }
})
