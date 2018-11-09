export type WebGLArray = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray

export type WebGLUniformType = number | Array<number> | WebGLArray;

export interface WebGLAttribute {
    numComponents: number;
    type?: string | WebGLArray;
    data?: Array<number>;
    buffer?: WebGLBuffer;
    drawType?: number;
    normalize?: boolean;
    stride?: number;
    offset?: number;
}

export interface WebGLBufferInfo {
    numElements: number,
    indices?: WebGLBuffer,
    attributes: { [key: string]: WebGLAttribute };
}

export interface WebGLProgramInfo {
    program: WebGLProgram;
    mode?: number,
    attributeSetters: { [key: string]: (info: WebGLAttribute) => void };
    uniformSetters: { [key: string]: (info: WebGLUniformType) => void };
}

export class WebGLRenderingObject {

    programInfo: WebGLProgramInfo;

    bufferInfo: WebGLBufferInfo;

    uniforms: { [key: string]: WebGLUniformType };
    
    constructor(readonly gl: WebGLRenderingContext) { } // property 'gl' is set through constructor parameter

    draw() {
        let mode = this.programInfo.mode || this.gl.TRIANGLES;
        let numElements = this.bufferInfo.numElements;
        if (this.bufferInfo.indices) {
            this.gl.drawElements(mode, numElements, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(mode, 0, numElements);
        }
    }
}

declare global {
    // 为 WebGL Context 补充方法
    interface WebGLRenderingContext {
        getArrayType(type: number): typeof Int8Array | typeof Float32Array;
        initShader(code: string, type: number): WebGLShader | null;
        initProgram(vShader: WebGLShader, fShader: WebGLShader): WebGLProgram | null;
        createBufferInfo(this: WebGLRenderingContext, attributes: { [key: string]: WebGLAttribute }) : WebGLBufferInfo;
        createProgramInfo(this: WebGLRenderingContext, program: WebGLProgram, mode: number): WebGLProgramInfo;
    }

    // 为 Array 补充方法
    interface ArrayConstructor {
        range(start: number, end: number): Array<number>;
        add(...elements: Array<number>[]): Array<number>;
        mul(...elements: (Array<number> | number)[]): Array<number>;
    }
}

Object.assign(WebGLRenderingContext.prototype, {

    getArrayType(this: WebGLRenderingContext, type: number) {
        return ({
            [this.BYTE]: Int8Array,
            [this.UNSIGNED_BYTE]: Uint8Array
        })[type];
    },

    initShader(this: WebGLRenderingContext, code: string, type: number) {
        let shader = this.createShader(type);
        this.shaderSource(shader, code);
        this.compileShader(shader);

        if (this.getShaderParameter(shader, this.COMPILE_STATUS)){               
            return shader; // 编译成功，返回着色器
        } else { 
            console.log("SHADER " + this.getShaderInfoLog(shader));
            console.log("code: " + code);
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

    createBufferInfo(this: WebGLRenderingContext, attributes: { [key: string]: WebGLAttribute }) {
        let bufferInfo = { attributes: attributes } as WebGLBufferInfo;
        
        // Set indices and numElements
        if (bufferInfo.attributes.indices) {
            let indicesData = bufferInfo.attributes.indices.data;
            bufferInfo.indices = this.createBuffer();
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
            this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesData), this.STATIC_DRAW);
            bufferInfo.numElements = indicesData.length;
            delete bufferInfo.attributes.indices;
        } else {
            let testAttr = Object.values(attributes)[0];
            bufferInfo.numElements = testAttr.data.length / testAttr.numComponents;
        }

        // The data feeding of attribute buffer is delayed in attr's setters
        for (let [name, attr] of Object.entries(bufferInfo.attributes)) {
            attr.buffer = this.createBuffer();
            if (!name.startsWith("a_")) {
                name = `a_${name[0].toUpperCase()}${name.slice(1)}`;
            }
            bufferInfo.attributes[name] = attr;
        }
        
        return bufferInfo;
    },

    createProgramInfo(this: WebGLRenderingContext, program: WebGLProgram, mode: number) {
        let programInfo = {
            program, mode, attributeSetters: {}, uniformSetters: {}
        } as WebGLProgramInfo;
        
        // Set Attribute setters
        Array.range(0, this.getProgramParameter(program, this.ACTIVE_ATTRIBUTES))
        .map(i => this.getActiveAttrib(program, i))
        .forEach(info => {
            programInfo.attributeSetters[info.name] = (attr: WebGLAttribute) => {
                let index = this.getAttribLocation(program, info.name);
                let {type, ctor} = ((infoType: number) => {
                    switch (infoType) {
                        case this.UNSIGNED_BYTE:  return { type: infoType, ctor: Uint8Array };
                        case this.UNSIGNED_SHORT: return { type: infoType, ctor: Uint16Array };
                        case this.UNSIGNED_INT:   return { type: infoType, ctor: Uint32Array };
                        case this.BYTE:  return { type: infoType, ctor: Int8Array };
                        case this.SHORT: return { type: infoType, ctor: Int16Array };
                        case this.INT:   case this.INT_VEC2:   case this.INT_VEC3:   case this.INT_VEC4:
                            return { type: this.INT, ctor: Int32Array };
                        case this.FLOAT: case this.FLOAT_VEC2: case this.FLOAT_VEC3: case this.FLOAT_VEC4: default:
                            return { type: this.FLOAT, ctor: Float32Array };
                    }
                })(info.type);
                if (attr.type) {
                    ctor = typeof attr.type === "string" ? eval(attr.type) : attr.type;
                }
                let array = new ctor(attr.data);
                this.bindBuffer(this.ARRAY_BUFFER, attr.buffer);
                this.bufferData(this.ARRAY_BUFFER, array, attr.drawType || this.STATIC_DRAW);
                this.enableVertexAttribArray(index);
                this.vertexAttribPointer(
                    index, attr.numComponents, type, attr.normalize || false, attr.stride || 0, attr.offset || 0
                );
            }
        });
        
        // Set uniform setters
        Array.range(0, this.getProgramParameter(program, this.ACTIVE_UNIFORMS))
        .map(i => this.getActiveUniform(program, i))
        .forEach(info => {
            let loc = this.getUniformLocation(program, info.name);
            let isArray = (info.size > 1 && info.name.substr(-3) === "[0]");
            let name = isArray ? info.name.slice(0, -3) : info.name;
            programInfo.uniformSetters[name] = (uniform: WebGLUniformType) => {
                let v = uniform as any;
                switch (info.type) {
                    case this.FLOAT: return isArray ? this.uniform1fv(loc, v) : this.uniform1f(loc, v);
                    case this.FLOAT_VEC2: return this.uniform2fv(loc, v);
                    case this.FLOAT_VEC3: return this.uniform3fv(loc, v);
                    case this.FLOAT_VEC4: return this.uniform4fv(loc, v);
                    case this.INT: return isArray ? this.uniform1iv(loc, v) : this.uniform1i(loc, v);
                    case this.INT_VEC2: return this.uniform2iv(loc, v);
                    case this.INT_VEC3: return this.uniform3iv(loc, v);
                    case this.INT_VEC4: return this.uniform4iv(loc, v);
                    case this.FLOAT_MAT2: return this.uniformMatrix2fv(loc, false, v);
                    case this.FLOAT_MAT3: return this.uniformMatrix3fv(loc, false, v);
                    case this.FLOAT_MAT4: return this.uniformMatrix4fv(loc, false, v);
                    default: throw (`type not registered: ${info.type.toString(16)}`);
                }
            };
        });
        
        return programInfo;
    },
})

Array.range = function(start, end) {
    return new Array(end - start).fill(start).map((_, i) => start + i);
}

Array.add = function(...elements) {
    return elements.reduce((sum, array) => sum.map((v, i) => v + array[i]));
}

Array.mul = function(...elements) {
    return elements.map(v => typeof v == "number" ? Array(elements.length).fill(v): v)
        .reduce((product, array) => product.map((v, i) => v * array[i]));
}