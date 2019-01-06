import * as MV from "./MV.js";
export declare class MatrixStack {
    stack: Array<MV.Matrix>;
    top: MV.Matrix;
    constructor();
    restore(): void;
    save(): void;
    translate(diff: MV.Vector3D): void;
    rotate(angle: number, axis: MV.Vector3D): void;
    scale(x?: number, y?: number, z?: number): void;
}
