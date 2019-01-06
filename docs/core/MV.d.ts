export declare type Scalar = number;
export declare type Vector = Array<number>;
export declare type Vector2D = [number, number];
export declare type Vector3D = [number, number, number];
export declare type Vector4D = [number, number, number, number];
export interface Matrix extends Array<number[]> {
    matrix?: boolean;
}
export declare type Tensor = number | Array<number> | Matrix;
export declare function isMatrix(v: Tensor): v is Matrix;
export declare function isVector(v: Tensor): v is Array<number>;
export declare function isScalar(v: Tensor): v is number;
export declare function radians(degrees: number): number;
export declare function vec2(...numbers: Tensor[]): [number, number];
export declare function vec3(...numbers: Tensor[]): [number, number, number];
export declare function vec4(...numbers: Tensor[]): [number, number, number, number];
export declare function mat2(...numbers: Tensor[]): Matrix;
export declare function mat3(...numbers: Tensor[]): Matrix;
export declare function mat4(...numbers: Tensor[]): Matrix;
export declare function vec2mat(vec: Array<number>): Matrix;
export declare function mat2vec(mat: Matrix): Array<number>;
export declare function transformPoint(mat: Matrix, vec: Vector3D, dst?: Vector3D): [number, number, number];
export declare function equal(u: Tensor, v: Tensor): boolean;
export declare function add<T extends Tensor>(...vals: T[]): T;
export declare function subtract<T extends Tensor>(...vals: T[]): T;
export declare function mult<T extends Tensor>(...vals: T[]): T;
export declare function translate(x: number, y: number, z: number): Matrix;
export declare function rotate(angle: number, axis: Vector3D): Matrix;
export declare function rotateX(theta: number): Matrix;
export declare function rotateY(theta: number): Matrix;
export declare function rotateZ(theta: number): Matrix;
export declare function scalem(x: number, y: number, z: number): Matrix;
export declare function lookAt(eye: Vector3D, at: Vector3D, up?: Vector3D): Matrix;
export declare function ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix;
export declare function perspective(fovy: number, aspect: number, near: number, far: number): Matrix;
export declare function transpose(m: Matrix): Matrix | "transpose(): trying to transpose a non-matrix";
export declare function dot(u: Vector, v: Vector): number;
export declare function distance(u: Vector, v: Vector): number;
export declare function sum(v: Vector): number;
export declare function lerp<T extends number | Vector>(u: T, v: T, t: number): T;
export declare function includedAngle(u: Array<number>, v: Array<number>): number;
export declare function negate<T extends Vector>(u: T): T;
export declare function cross(u: Vector3D, v: Vector3D): [number, number, number];
export declare function l2_norm(u: Vector): number;
export declare function length(u: Vector): number;
export declare function normalize<T extends Vector>(u: T, excludeLastComponent?: boolean): T;
export declare function scale<T extends Vector>(s: number, u: T): T;
export declare function flatten(v: any): Float32Array;
export declare let sizeof: {
    'vec2': number;
    'vec3': number;
    'vec4': number;
    'mat2': number;
    'mat3': number;
    'mat4': number;
};
export declare function printm(m: any): void;
export declare function det2(m: any): number;
export declare function det3(m: any): number;
export declare function det4(m: any): number;
export declare function det(m: any): number;
export declare function inverse2(m: any): Matrix;
export declare function inverse3(m: any): Matrix;
export declare function inverse4(m: any): Matrix;
export declare function inverse(m: any): Matrix;
export declare function normalMatrix(m: any, flag: any): Matrix;
export declare function coordSysTransform(newSysBase: Vector3D, newSysAxis: [Vector3D, Vector3D, Vector3D]): Matrix;
