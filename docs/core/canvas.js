import { WebGLRenderingObject, WebGLOrientedObject } from "./webgl-object.js";
import { MatrixStack } from "./matrix-stack.js";
import "./webgl-extension.js";
export class Canvas {
    constructor(canvasId) {
        this.matrixStack = new MatrixStack();
        this.textureInfos = Array(32).fill(null);
        this.objectsToDraw = [];
        this.updatePipeline = [];
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext("webgl");
    }
    get size() { return [this.canvas.width, this.canvas.height]; }
    set size(size) { [this.canvas.width, this.canvas.height] = size; }
    sourceByDom(vNode, fNode) {
        const [vertSrc, fragSrc] = [vNode, fNode].map(e => document.getElementById(e)).map((e) => e.text);
        return { vertSrc, fragSrc };
    }
    async sourceByFile(vPath, fPath) {
        const [vertSrc, fragSrc] = await Promise.all([vPath, fPath].map(async (p) => await (await fetch(p)).text()));
        return { vertSrc, fragSrc };
    }
    /*
        Input: Vec2 in [width, height] origining at top-left
        Output: Vec2 in [-1, 1] of clip space origining at bottom-left
    */
    normVec2D(vec) {
        return [
            2 * vec[0] / this.size[0] - 1,
            2 * (this.size[1] - vec[1]) / this.size[1] - 1
        ];
    }
    newObject(source, mode, attributes, uniforms, destObj) {
        let object = destObj || new WebGLRenderingObject(this.gl);
        let vShader = this.gl.initShader(source.vertSrc, this.gl.VERTEX_SHADER);
        let fShader = this.gl.initShader(source.fragSrc, this.gl.FRAGMENT_SHADER);
        let program = this.gl.initProgram(vShader, fShader);
        object.programInfo = this.gl.createProgramInfo(program, mode);
        object.bufferInfo = this.gl.createBufferInfo(attributes);
        Object.assign(object.uniforms, uniforms, {});
        this.objectsToDraw.push(object);
        return object;
    }
    newTexture(image, level = -1, // append to the first undefined level by default
    size) {
        if (level === -1) {
            level = this.textureInfos.reduce((i, info) => info ? i + 1 : i, 0);
        }
        if (this.textureInfos[level]) { // update the existing texture
            this.gl.initTexture(image, level, this.textureInfos[level]);
        }
        else if (image) { // create a new texture by image
            const texture = this.gl.initTexture(image, level);
            this.textureInfos[level] = { texture, level };
        }
        else { // create an empty image and bind a frame buffer
            this.textureInfos[level] = this.gl.createFrameBufferInfo(size ? size : this.size, level);
        }
        return this.textureInfos[level];
    }
    render(anime) {
        this.gl.viewport(0, 0, ...this.size);
        this.gl.enable(this.gl.DEPTH_TEST);
        let lastUsedProgramInfo = null;
        let lastUsedBufferInfo = null;
        let then = 0.0;
        let mainLoop = (now) => {
            now *= 0.001; // convert time from ms to s
            for (let update of this.updatePipeline) {
                update(this, now, then - now);
            }
            then = now;
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            for (let obj of this.objectsToDraw) {
                let bindBuffers = false;
                if (!obj.programInfo) {
                    continue; // do not draw this object
                }
                if (obj.programInfo !== lastUsedProgramInfo) {
                    lastUsedProgramInfo = obj.programInfo;
                    this.gl.useProgram(obj.programInfo.program);
                    bindBuffers = true;
                }
                if (bindBuffers || obj.bufferInfo !== lastUsedBufferInfo) {
                    lastUsedBufferInfo = obj.bufferInfo;
                    // Setup all the needed buffers and attributes.
                    if (obj.bufferInfo.indices) {
                        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, obj.bufferInfo.indices);
                    }
                    for (let [name, attr] of Object.entries(obj.bufferInfo.attributes)) {
                        let setter = obj.programInfo.attributeSetters[name];
                        if (setter) {
                            setter(attr);
                        }
                    }
                }
                // Set the uniforms.
                for (let [name, uniform] of Object.entries(obj.uniforms)) {
                    let setter = obj.programInfo.uniformSetters[name];
                    if (setter) {
                        setter(uniform);
                    }
                }
                // Draw
                obj.draw();
            }
            if (anime) {
                requestAnimationFrame(mainLoop);
            }
        };
        requestAnimationFrame(mainLoop);
    }
}
Object.assign(Canvas.prototype, {
    newOrientedObject(source, direction, normal, mode, attributes, uniforms) {
        return this.newObject(source, mode, attributes, uniforms, new WebGLOrientedObject(this.gl, direction, normal));
    }
});
//# sourceMappingURL=canvas.js.map