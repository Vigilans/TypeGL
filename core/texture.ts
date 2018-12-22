import * as MV from "./MV.js";
import { Canvas } from "./canvas.js";
import { WebGLUniformMap, ShaderSource, WebGLFrameBufferInfo } from "./webgl-extension.js";
import { WebGLRenderingObject, normRgb } from "./webgl-object.js";
import { createSphereVertices } from "./3d-geometry.js";

export function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', _ => resolve(img));
        img.addEventListener('error', () => {
            reject(new Error(`Failed to load image's URL: ${url}`));
        });
        img.src = url;
    });
}

declare module "./webgl-object.js" {
    interface WebGLRenderingObject {
        textureInfo?: WebGLFrameBufferInfo;
        bindColor(rgba: MV.Vector4D, shininess?: number) : void;
        bindMaterial(
            ambient: MV.Vector4D,
            diffuse?: MV.Vector4D,
            specular?: MV.Vector4D,
            shininess?: number
        ) : void;
        bindTexture(image?: TexImageSource, normalMap?: TexImageSource) : void;
        bindFrameBuffer(this: WebGLRenderingObject, size: [number, number]) : void;
    }
}

let curTexture = 0;

Object.assign(WebGLRenderingObject.prototype, {
    
    bindColor(this: WebGLRenderingObject, 
        rgba: MV.Vector4D,
        shininess?: number
    ) {
        Object.assign(this.uniforms, {
            u_Color: rgba,
            u_ColorSource: 0
        });
        if (shininess) {
            this.uniforms.u_Shininess = shininess;
        }
    },

    bindMaterial(this: WebGLRenderingObject,
        ambient: MV.Vector4D,
        diffuse: MV.Vector4D = MV.vec4(),
        specular: MV.Vector4D = MV.vec4(),
        shininess: number = 1.0
    ) {
        Object.assign(this.uniforms, {
            u_Ambient: ambient,
            u_Diffuse: diffuse,
            u_Specular: specular,
            u_Shininess: shininess,
            u_ColorSource: 0
        });
    },

    bindTexture(this: WebGLRenderingObject,
        image: TexImageSource, // 源图片，也即 DiffuseMap
        nMap?: TexImageSource   // 法线贴图(NormalMap)
    ) {
        const texture = this.gl.initTexture(image, (curTexture));
        Object.assign(this.uniforms, {
            u_DiffuseMap: curTexture,
            u_ColorSource: 1
        });
        curTexture = (curTexture + 1) % 32;
        if (nMap) {
            this.gl.initTexture(nMap, curTexture);
            this.uniforms.u_NormalMap = curTexture;
            curTexture = (curTexture + 1) % 32;
        } else {
            this.uniforms.u_NormalMap = curTexture - 1;
        }
        this.textureInfo = { texture };
    },

    bindFrameBuffer(this: WebGLRenderingObject, size: [number, number]) {
        this.textureInfo = this.gl.createFrameBufferInfo(size, 0);
    }
});
