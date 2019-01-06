import * as MV from "./MV.js";
import { WebGLRenderingObject } from "./webgl-object.js";
export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', _ => resolve(img));
        img.addEventListener('error', () => {
            reject(new Error(`Failed to load image's URL: ${url}`));
        });
        img.src = url;
    });
}
Object.assign(WebGLRenderingObject.prototype, {
    bindColor(rgba, shininess) {
        Object.assign(this.uniforms, {
            u_Color: rgba,
            u_ColorSource: 0
        });
        if (shininess) {
            this.uniforms.u_Shininess = shininess;
        }
    },
    bindMaterial(material) {
        Object.assign(this.uniforms, {
            u_Ambient: material.ambient,
            u_Diffuse: material.diffuse || MV.vec4(),
            u_Specular: material.specular || MV.vec4(),
            u_Shininess: material.shininess || 1.0,
            u_ColorSource: 0
        });
    },
    bindTexture(image, // 源图片，也即 DiffuseMap
    nMap // 法线贴图(NormalMap)
    ) {
        Object.assign(this.uniforms, {
            u_DiffuseMap: image.level,
            u_NormalMap: nMap ? nMap.level : image.level,
            u_ColorSource: 1
        });
    },
});
//# sourceMappingURL=texture.js.map