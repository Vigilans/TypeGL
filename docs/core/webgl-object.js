import * as MV from "./MV.js";
export class WebGLRenderingObject {
    constructor(gl) {
        this.gl = gl;
        this.worldMatrix = MV.mat4(); // 初始为恒等矩阵
        this.center = MV.vec3(); // 初始为坐标原点
        // 就算着色器中没有该uniform，也不会出错
        this.uniforms = {
            u_WorldMatrix: MV.flatten(this.worldMatrix)
        };
    }
    // 直接设置MV矩阵
    setModel(m) {
        this.worldMatrix = m;
        this.center = MV.transformPoint(m, MV.vec3());
        this.uniforms.u_WorldMatrix = MV.flatten(this.worldMatrix);
    }
    // 对MV矩阵实施变换
    transform(m) {
        this.worldMatrix = MV.mult(m, this.worldMatrix);
        this.center = MV.transformPoint(m, this.center);
        this.uniforms.u_WorldMatrix = MV.flatten(this.worldMatrix);
    }
    draw() {
        let mode = this.programInfo.mode || this.gl.TRIANGLES;
        let numElements = this.bufferInfo.numElements;
        if (this.bufferInfo.indices) {
            this.gl.drawElements(mode, numElements, this.gl.UNSIGNED_SHORT, 0);
        }
        else {
            this.gl.drawArrays(mode, 0, numElements);
        }
    }
}
// 带朝向与法线的 WebGL 渲染对象，朝向与法线均保持初始状态。
export class WebGLOrientedObject extends WebGLRenderingObject {
    constructor(gl, initDir, initNorm) {
        super(gl);
        this.initDir = initDir;
        this.initNorm = initNorm;
        this.direction = initDir;
        this.normal = initNorm;
        this.initSideAxis = MV.normalize(MV.cross(initNorm, initDir));
    }
    get sideAxis() {
        return MV.normalize(MV.cross(this.normal, this.direction));
    }
    get coordSystem() {
        return [this.normal, this.direction, this.sideAxis];
    }
    // 直接设置MV矩阵
    setModel(m) {
        super.setModel(m);
        this.direction = MV.normalize(MV.subtract(MV.transformPoint(m, this.initDir), this.center));
        this.normal = MV.normalize(MV.subtract(MV.transformPoint(m, this.initNorm), this.center));
    }
    // 对MV矩阵实施变换
    transform(m) {
        const abs_dir = MV.add(this.direction, this.center);
        const abs_norm = MV.add(this.normal, this.center);
        super.transform(m);
        this.direction = MV.normalize(MV.subtract(MV.transformPoint(m, abs_dir), this.center));
        this.normal = MV.normalize(MV.subtract(MV.transformPoint(m, abs_norm), this.center));
    }
}
/*
    Input: "rgb(r,g,b)" or "#rrggbb" or [r, g, b] in [0, 255]
    Output: [r, g, b] in [0, 1]
*/
export function normRgb(rgb) {
    if (typeof rgb == "object") {
        return rgb.map(v => v / 255);
    }
    else if (typeof rgb == "string") {
        let strRgb = rgb;
        let hashReg = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
        let rgbReg = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
        switch (true) {
            case hashReg.test(strRgb):
                return normRgb(hashReg.exec(strRgb).slice(1).map(v => Number(`0x${v}`)));
            case rgbReg.test(strRgb):
                return normRgb(rgbReg.exec(strRgb).slice(1).map(Number));
            default:
                throw Error("invalid rgb format");
        }
    }
}
//# sourceMappingURL=webgl-object.js.map