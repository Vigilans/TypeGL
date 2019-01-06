import * as MV from "./MV.js";
export class MatrixStack {
    constructor() {
        // 存放变换矩阵的栈
        this.stack = [];
        // 因为栈是空的，需要放入一个初始化矩阵
        this.restore();
    }
    // 栈顶的矩阵（当前矩阵）
    get top() { return this.stack.slice(-1)[0]; }
    ;
    set top(m) { this.stack.slice(-1)[0] = m; }
    // 抛出顶部的矩阵，重置为前一个矩阵
    restore() {
        this.stack.pop();
        if (this.stack.length < 1) {
            this.stack[0] = MV.mat4();
        }
    }
    // 将当前矩阵备份到栈中
    save() {
        this.stack.push(this.top);
    }
    // 平移当前矩阵
    translate(diff) {
        this.top = MV.mult(MV.translate(...diff), this.top);
    }
    ;
    // 旋转当前矩阵
    rotate(angle, axis) {
        this.top = MV.mult(MV.rotate(angle, axis), this.top);
    }
    ;
    // 缩放当前矩阵
    scale(x = 1.0, y = 1.0, z = 1.0) {
        this.top = MV.mult(MV.scalem(x, y, z), this.top);
    }
    ;
}
//# sourceMappingURL=matrix-stack.js.map