var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function initShader(path, gl) {
    return __awaiter(this, void 0, void 0, function* () {
        // 着色器类型与参数检查    
        let shaderType;
        switch (path.split('.').slice(-1)[0]) {
            case "vert":
            case "glslv":
                shaderType = gl.VERTEX_SHADER;
                break;
            case "frag":
            case "glslf":
                shaderType = gl.FRAGMENT_SHADER;
                break;
            default:
                throw path;
        }
        let code = yield (yield fetch(path)).text();
        let shader = gl.createShader(shaderType);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader; // 编译成功，返回着色器
        }
        else {
            console.log(gl.getShaderInfoLog(shader));
            return null; // 编译失败，打印错误消息
        }
    });
}
function initProgram(shaders, gl) {
    let program = gl.createProgram();
    for (let shader of shaders) {
        gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    // 判断着色器的连接是否成功
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program); // 成功的话，将程序对象设置为有效
        return program; // 返回程序对象
    }
    else {
        console.log(gl.getProgramInfoLog(program)); // 弹出错误信息
        return null;
    }
}
function drawFullScreenQuad(program, gl) {
    // Only created once
    if (!this.screenQuadVBO) {
        var verts = [
            // First triangle:
            1.0, 1.0,
            -1.0, 1.0,
            -1.0, -1.0,
            // Second triangle:
            -1.0, -1.0,
            1.0, -1.0,
            1.0, 1.0
        ];
        this.screenQuadVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.screenQuadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    }
    let attLocation = gl.getAttribLocation(program, 'vertexPositionNDC');
    // Bind:
    gl.bindBuffer(gl.ARRAY_BUFFER, this.screenQuadVBO);
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, 2, gl.FLOAT, false, 0, 0);
    // Draw 6 vertexes => 2 triangles:
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // Cleanup:
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let c = document.getElementById("canvas");
        [c.width, c.height] = [500, 500];
        let gl = c.getContext("webgl");
        // gl.clearColor(0.0, 0.0, 0.0, 1.0);
        let vShader = yield initShader("main.glslv", gl);
        let fShader = yield initShader("main.glslf", gl);
        let program = initProgram([vShader, fShader], gl);
        if (program) {
            gl.useProgram(program);
        }
        drawFullScreenQuad(program, gl);
    });
}
//# sourceMappingURL=script.js.map