
async function initShader(path: string, gl: WebGLRenderingContext) {
    // 着色器类型与参数检查    
    let shaderType : number;
    switch (path.split('.').slice(-1)[0]) {
        case "vert": case "glslv":
            shaderType = gl.VERTEX_SHADER; break;
        case "frag": case "glslf":
            shaderType = gl.FRAGMENT_SHADER; break;
        default:
            throw path;
    }

    let code = await (await fetch(path)).text();
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)){               
        return shader; // 编译成功，返回着色器
    } else { 
        console.log(gl.getShaderInfoLog(shader)); 
        return null;   // 编译失败，打印错误消息
    }
}

function initProgram(shaders: WebGLShader[], gl: WebGLRenderingContext) {
    let program = gl.createProgram();
    
    for (let shader of shaders) {
        gl.attachShader(program, shader);
    }

    gl.linkProgram(program);

    // 判断着色器的连接是否成功
    if(gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program); // 成功的话，将程序对象设置为有效
        return program; // 返回程序对象
    } else {
        console.log(gl.getProgramInfoLog(program)); // 弹出错误信息
        return null;
    }
}

function drawFullScreenQuad(program: WebGLProgram, gl: WebGLRenderingContext) {
    // Only created once
    if (!this.screenQuadVBO)
    {
        var verts = [
            // First triangle:
             1.0,  1.0,
            -1.0,  1.0,
            -1.0, -1.0,
            // Second triangle:
            -1.0, -1.0,
             1.0, -1.0,
             1.0,  1.0
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

async function main() {
    let c = document.getElementById("canvas") as HTMLCanvasElement;
    [c.width, c.height] = [500, 500];

    let gl = c.getContext("webgl");
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    let vShader = await initShader("main.glslv", gl);
    let fShader = await initShader("main.glslf", gl);
    let program = initProgram([vShader, fShader], gl);
    if (program) {
        gl.useProgram(program);
    }
    
    drawFullScreenQuad(program, gl);
}
