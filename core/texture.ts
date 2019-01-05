import * as MV from "./MV.js";
import { WebGLTextureInfo } from "./webgl-extension.js";
import { WebGLRenderingObject } from "./webgl-object.js";

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
        bindColor(rgba: MV.Vector4D, shininess?: number) : void;
        bindMaterial(material: {
            ambient: MV.Vector4D,
            diffuse?: MV.Vector4D,
            specular?: MV.Vector4D,
            shininess?: number
        }) : void;
        bindTexture(image: WebGLTextureInfo, normalMap?: WebGLTextureInfo) : void;
        bindFrameBuffer(this: WebGLRenderingObject, size: [number, number]) : void;
    }
}

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

    bindMaterial(this: WebGLRenderingObject, material: {
        ambient: MV.Vector4D,
        diffuse?: MV.Vector4D,
        specular?: MV.Vector4D,
        shininess?: number
    }) {
        Object.assign(this.uniforms, {
            u_Ambient:   material.ambient,
            u_Diffuse:   material.diffuse   || MV.vec4(),
            u_Specular:  material.specular  || MV.vec4(),
            u_Shininess: material.shininess || 1.0,
            u_ColorSource: 0
        });
    },

    bindTexture(this: WebGLRenderingObject,
        image: WebGLTextureInfo, // 源图片，也即 DiffuseMap
        nMap?: WebGLTextureInfo   // 法线贴图(NormalMap)
    ) {
        Object.assign(this.uniforms, {
            u_DiffuseMap: image.level,
            u_NormalMap: nMap ? nMap.level : image.level,
            u_ColorSource: 1
        });
    },
});
