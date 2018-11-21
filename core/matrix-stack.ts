import * as MV from "./MV.js"

export class MatrixStack {
    // 存放变换矩阵的栈
    public stack: Array<MV.Matrix> = [];

    // 栈顶的矩阵（当前矩阵）
    public get top() { return this.stack.slice(-1)[0]; };
    public set top(m: MV.Matrix) { this.stack.slice(-1)[0] = m; }

    public constructor() {
        // 因为栈是空的，需要放入一个初始化矩阵
        this.restore(); 
    }

    // 抛出顶部的矩阵，重置为前一个矩阵
    public restore() {
        this.stack.pop();
        if (this.stack.length < 1) {
            this.stack[0] = MV.mat4();
        }
    }

    // 将当前矩阵备份到栈中
    public save() {
        this.stack.push(this.top);
    }

    // 平移当前矩阵
    public translate(diff: MV.Vector3D) {
        this.top = MV.mult(MV.translate(...diff), this.top);
    };
    
    // 旋转当前矩阵
    public rotate(angle: number, axis: MV.Vector3D) {
        this.top = MV.mult(MV.rotate(angle, axis), this.top);
    };
    
    // 缩放当前矩阵
    public scale(x=1.0, y=1.0, z=1.0) {
        this.top = MV.mult(MV.scalem(x, y, z), this.top);
    };
}
