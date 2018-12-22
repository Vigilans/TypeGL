export type WebGLArray = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array

export type WebGLArrayConstructor = new (data: number[]) => WebGLArray;

export type WebGLUniformType = number | Array<number> | WebGLArray;

export interface WebGLAttribute {
    numComponents: number;
    data: Array<number> | WebGLArray;
    type?: WebGLArrayConstructor | string;
    buffer?: WebGLBuffer;
    drawType?: number;
    normalize?: boolean;
    stride?: number;
    offset?: number;
}

export type WebGLAttributeMap = { [key: string]: WebGLAttribute };

export type WebGLUniformMap = { [key: string]: WebGLUniformType };

export interface WebGLBufferInfo {
    numElements: number,
    indices?: WebGLBuffer,
    attributes: WebGLAttributeMap;
}

export interface WebGLProgramInfo {
    program: WebGLProgram;
    mode?: number,
    attributeSetters: { [key: string]: (info: WebGLAttribute) => void };
    uniformSetters: { [key: string]: (info: WebGLUniformType) => void };
}

export interface WebGLFrameBufferInfo {
    frameBuffer?: WebGLFramebuffer;
    renderBuffer?: WebGLRenderbuffer;
    texture: WebGLTexture;
}

export type ShaderSource = { vertSrc: string, fragSrc: string };

declare global {
    // 为 WebGL Context 补充方法
    interface WebGLRenderingContext {
        getArrayType(this: WebGLRenderingContext, type: number): typeof Int8Array | typeof Float32Array;
        initShader(this: WebGLRenderingContext, code: string, type: number): WebGLShader | null;
        initProgram(this: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader): WebGLProgram | null;
        initTexture(this: WebGLRenderingContext, image: TexImageSource, unit?: number): WebGLTexture;
        createBufferInfo(this: WebGLRenderingContext, attributes: WebGLAttributeMap) : WebGLBufferInfo;
        createProgramInfo(this: WebGLRenderingContext, program: WebGLProgram, mode: number): WebGLProgramInfo;
        createFrameBufferInfo(this: WebGLRenderingContext, size: [number, number], level?: number): WebGLFrameBufferInfo;
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
            console.log(`SHADER ${this.getShaderInfoLog(shader)}, code: ${code}`);
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

    createBufferInfo(this: WebGLRenderingContext, attributes: WebGLAttributeMap) {
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

        for (let [name, attr] of Object.entries(bufferInfo.attributes)) {
            if (!attr.type) { // default to Float32
                attr.type = Float32Array;
            } else if (typeof attr.type == "string") { // deserializing
                attr.type = eval(attr.type) as WebGLArrayConstructor; 
            }
            if (attr.data instanceof Array) { // standardlize
                attr.data = new attr.type(attr.data);
            }
            attr.buffer = this.createBuffer();
            this.bindBuffer(this.ARRAY_BUFFER, attr.buffer);
            this.bufferData(this.ARRAY_BUFFER, attr.data, attr.drawType || this.STATIC_DRAW);
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
                let type: number;
                switch (true) {
                    case attr.data instanceof Int8Array:   type = this.BYTE; break;
                    case attr.data instanceof Uint8Array:  type = this.UNSIGNED_BYTE; break;
                    case attr.data instanceof Int16Array:  type = this.SHORT; break;
                    case attr.data instanceof Uint16Array: type = this.UNSIGNED_SHORT; break;
                    case attr.data instanceof Int32Array:  type = this.INT; break;
                    case attr.data instanceof Uint32Array: type = this.UNSIGNED_INT; break;
                    case attr.data instanceof Float32Array:type = this.FLOAT; break;
                    default: throw `unsupported array type: ${attr.data.constructor.name}`
                }
                this.bindBuffer(this.ARRAY_BUFFER, attr.buffer);
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
                    case this.SAMPLER_2D:
                    case this.SAMPLER_CUBE:
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

    initTexture(this: WebGLRenderingContext, image: TexImageSource, level = 0) {
        const texture = this.createTexture();
        this.activeTexture(this.TEXTURE0 + level);
        this.bindTexture(this.TEXTURE_2D, texture);
        this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, image);
        // 检查每个维度是否是 2 的幂
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) { // 是 2 的幂，一般用贴图
            this.generateMipmap(this.TEXTURE_2D);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.NEAREST_MIPMAP_LINEAR); 
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.NEAREST); 
        } else { // 不是 2 的幂，关闭贴图并设置包裹模式为到边缘
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR);
        }
        //this.bindTexture(this.TEXTURE_2D, null);
        return texture;
    },

    createFrameBufferInfo(this: WebGLRenderingContext, size: [number, number], level = 0) {
        let info = {
            frameBuffer: this.createFramebuffer(),
            renderBuffer: this.createRenderbuffer(),
            texture: this.createTexture()
        } as WebGLFrameBufferInfo;
        
        // 绑定帧缓冲与渲染缓冲
        this.bindFramebuffer(this.FRAMEBUFFER, info.frameBuffer);
        this.bindRenderbuffer(this.RENDERBUFFER, info.renderBuffer);
        this.renderbufferStorage( // 设置渲染缓冲区的存储尺寸
            this.RENDERBUFFER, this.DEPTH_COMPONENT16, ...size
        );
        this.framebufferRenderbuffer( // 把渲染缓冲绑定到当前工作的帧缓冲上
            this.FRAMEBUFFER, this.DEPTH_ATTACHMENT, this.RENDERBUFFER, info.renderBuffer
        );

        // 设置当前贴图对象
        this.activeTexture(this[`TEXTURE${level}`]);
        this.bindTexture(this.TEXTURE_2D, info.texture);
        this.framebufferTexture2D( // 把贴图对象也绑定到帧缓冲中
            this.FRAMEBUFFER, this.COLOR_ATTACHMENT0,
            this.TEXTURE_2D, info.texture, level
        );
        const pixels = new Uint8Array(Array(size[0]*size[1]*4).fill(0.0));
        this.texImage2D( // 传入一个仅有1像素的贴图
            this.TEXTURE_2D, level, this.RGBA, size[0], size[1], 0,
            this.RGBA, this.UNSIGNED_BYTE, pixels
        );
        this.texParameteri( // 设置贴图对象的属性
            this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR
        );

        // 取消绑定
        this.bindFramebuffer(this.FRAMEBUFFER, null);
        this.bindRenderbuffer(this.RENDERBUFFER, null);
        this.bindTexture(this.TEXTURE_2D, null);
        // //绘制到帧缓冲
        // this.uniform1i(tp, false);
        // this.bindFramebuffer(this.FRAMEBUFFER, frameBuffer);
        // this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        // this.drawElements(this.TRIANGLES, 36, this.UNSIGNED_SHORT, 0);

        // //绘制到屏幕
        // this.uniform1i(tp, true);
        // this.bindFramebuffer(this.FRAMEBUFFER, null);
        // this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        // this.drawElements(this.TRIANGLES, 36, this.UNSIGNED_SHORT, 0);
        return info;
    }
})

function isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
}

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
