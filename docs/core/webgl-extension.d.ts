export declare type WebGLArray = Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array;
export declare type WebGLArrayConstructor = new (data: number[]) => WebGLArray;
export declare type WebGLUniformType = number | Array<number> | WebGLArray;
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
export declare type WebGLAttributeMap = {
    [key: string]: WebGLAttribute;
};
export declare type WebGLUniformMap = {
    [key: string]: WebGLUniformType;
};
export interface WebGLBufferInfo {
    numElements: number;
    indices?: WebGLBuffer;
    attributes: WebGLAttributeMap;
}
export interface WebGLProgramInfo {
    program: WebGLProgram;
    mode?: number;
    attributeSetters: {
        [key: string]: (info: WebGLAttribute) => void;
    };
    uniformSetters: {
        [key: string]: (info: WebGLUniformType) => void;
    };
}
export interface WebGLTextureInfo {
    frameBuffer?: WebGLFramebuffer;
    renderBuffer?: WebGLRenderbuffer;
    texture: WebGLTexture;
    level: number;
}
export declare type ShaderSource = {
    vertSrc: string;
    fragSrc: string;
};
declare global {
    interface WebGLRenderingContext {
        getArrayType(this: WebGLRenderingContext, type: number): typeof Int8Array | typeof Float32Array;
        initShader(this: WebGLRenderingContext, code: string, type: number): WebGLShader | null;
        initProgram(this: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader): WebGLProgram | null;
        initTexture(this: WebGLRenderingContext, image: TexImageSource, unit?: number, texture?: WebGLTexture): WebGLTexture;
        createBufferInfo(this: WebGLRenderingContext, attributes: WebGLAttributeMap): WebGLBufferInfo;
        createProgramInfo(this: WebGLRenderingContext, program: WebGLProgram, mode: number): WebGLProgramInfo;
        createFrameBufferInfo(this: WebGLRenderingContext, size: [number, number], level?: number): WebGLTextureInfo;
    }
    interface ArrayConstructor {
        range(start: number, end: number): Array<number>;
        add(...elements: Array<number>[]): Array<number>;
        mul(...elements: (Array<number> | number)[]): Array<number>;
    }
}
