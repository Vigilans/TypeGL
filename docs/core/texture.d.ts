import * as MV from "./MV.js";
import { WebGLTextureInfo } from "./webgl-extension.js";
export declare function loadImage(url: string): Promise<HTMLImageElement>;
declare module "./webgl-object.js" {
    interface WebGLRenderingObject {
        bindColor(rgba: MV.Vector4D, shininess?: number): void;
        bindMaterial(material: {
            ambient: MV.Vector4D;
            diffuse?: MV.Vector4D;
            specular?: MV.Vector4D;
            shininess?: number;
        }): void;
        bindTexture(image: WebGLTextureInfo, normalMap?: WebGLTextureInfo): void;
        bindFrameBuffer(this: WebGLRenderingObject, size: [number, number]): void;
    }
}
