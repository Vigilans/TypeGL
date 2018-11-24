function _argumentsToArray(args) {
    return [].concat.apply([], Array.prototype.slice.apply(args));
}

export type Scalar = number;

export type Vector = Array<number>;

export type Vector2D = [number, number];

export type Vector3D = [number, number, number];

export type Vector4D = [number, number, number, number];

export interface Matrix extends Array<number[]> {
    matrix?: boolean;
}

export type Tensor = number | Array<number> | Matrix;

export function isMatrix(v: Tensor): v is Matrix {
    return (<Matrix>v).matrix;
}

export function isVector(v: Tensor): v is Array<number> {
    return !isMatrix(v) && Array.isArray(v);
}

export function isScalar(v: Tensor): v is number {
    return typeof v === "number";
}

//----------------------------------------------------------------------------

export function radians(degrees: number) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

export function vec2(...numbers: Tensor[]) {
    let result = _argumentsToArray(numbers);

    switch (result.length) {
        case 0: result.push(0.0);
        case 1: result.push(0.0);
    }

    return result.splice(0, 2) as Vector2D;
}

export function vec3(...numbers: Tensor[]) {
    let result = _argumentsToArray(numbers);

    switch (result.length) {
        case 0: result.push(0.0);
        case 1: result.push(0.0);
        case 2: result.push(0.0);
    }

    return result.splice(0, 3) as Vector3D;
}

export function vec4(...numbers: Tensor[]) {
    let result = _argumentsToArray(numbers);

    switch (result.length) {
        case 0: result.push(0.0);
        case 1: result.push(0.0);
        case 2: result.push(0.0);
        case 3: result.push(1.0);
    }

    return result.splice(0, 4) as Vector4D;
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

export function mat2(...numbers: Tensor[]) {
    let v = _argumentsToArray(numbers);

    let m = [] as Matrix;
    switch (v.length) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec2(v[0], 0.0),
                vec2(0.0, v[0])
            ];
            break;

        default:
            m.push(vec2(v)); v.splice(0, 2);
            m.push(vec2(v));
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

export function mat3(...numbers: Tensor[]) {
    let v = _argumentsToArray(numbers);

    let m = [] as Matrix;
    switch (v.length) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec3(v[0], 0.0, 0.0),
                vec3(0.0, v[0], 0.0),
                vec3(0.0, 0.0, v[0])
            ];
            break;

        default:
            m.push(vec3(v)); v.splice(0, 3);
            m.push(vec3(v)); v.splice(0, 3);
            m.push(vec3(v));
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

export function mat4(...numbers: Tensor[]) {
    let v = _argumentsToArray(numbers);

    let m = [] as Matrix;
    switch (v.length) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec4(v[0], 0.0, 0.0, 0.0),
                vec4(0.0, v[0], 0.0, 0.0),
                vec4(0.0, 0.0, v[0], 0.0),
                vec4(0.0, 0.0, 0.0, v[0])
            ];
            break;

        default:
            m.push(vec4(v)); v.splice(0, 4);
            m.push(vec4(v)); v.splice(0, 4);
            m.push(vec4(v)); v.splice(0, 4);
            m.push(vec4(v));
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

export function vec2mat(vec: Array<number>): Matrix {
    let result = [...vec, 1.0].map(e => [e]) as Matrix;
    result.matrix = true;
    return result;
}

export function mat2vec(mat: Matrix): Array<number> {
    return _argumentsToArray(mat).slice(0, -1);
}

// export function transformPoint(mat: Matrix, point: Vector3D) {
//     return mat2vec(mult(mat, vec2mat(point))) as Vector3D;
// }

export function transformPoint(mat, vec, dst?) {
    dst = dst || vec3();
    const v0 = vec[0];
    const v1 = vec[1];
    const v2 = vec[2];
    const m = flatten(mat);
    const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
  
    dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
    dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
    dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;
    return dst;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

export function equal(u: Tensor, v: Tensor) {
    if (typeof u === "number" && typeof v === "number") {
        return u === v;
    }
    else if (typeof u === "number" || typeof v === "number") {
        throw "trying to add number with non-number"
    }

    if (u.length != v.length) { return false; }

    if (isMatrix(u) && isMatrix(v)) {
        for (let i = 0; i < u.length; ++i) {
            if (u[i].length != v[i].length) { return false; }
            for (let j = 0; j < u[i].length; ++j) {
                if (u[i][j] !== v[i][j]) { return false; }
            }
        }
    }
    else if (isMatrix(u) && !isMatrix(v) || !isMatrix(u) && isMatrix(v)) {
        return false;
    }
    else {
        for (let i = 0; i < u.length; ++i) {
            if (u[i] !== v[i]) { return false; }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

function add_impl(u: Matrix, v: Matrix): Matrix;
function add_impl(u: Array<number>, v: Array<number>): Array<number>;
function add_impl(u: number, v: number): number;
function add_impl(u, v) {
    if (isMatrix(u) && isMatrix(v)) {

        if (u.length != v.length) {
            throw "add(): trying to add matrices of different dimensions";
        }

        let result = [] as Matrix;

        for (let i = 0; i < u.length; ++i) {
            if (u[i].length != v[i].length) {
                throw "add(): trying to add matrices of different dimensions";
            }
            result.push([]);
            for (let j = 0; j < u[i].length; ++j) {
                result[i].push(u[i][j] + v[i][j]);
            }
        }

        result.matrix = true;

        return result;
    }
    else if (isVector(u) && isVector(v)) {
        if (u.length != v.length) {
            throw "add(): vectors are not the same dimension";
        }

        let result = [] as Array<number>;

        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] + v[i]);
        }

        return result;
    }
    else if (isScalar(u) && isScalar(v)) {
        return u + v;
    }
    else {
        throw "add(): trying to add letiables of different type";
    }
}

//----------------------------------------------------------------------------

function subtract_impl(u: Matrix, v: Matrix): Matrix;
function subtract_impl(u: Array<number>, v: Array<number>): Array<number>;
function subtract_impl(u: number, v: number): number;
function subtract_impl(u, v) {
    if (isMatrix(u) && isMatrix(v)) {
        if (u.length != v.length) {
            throw "subtract(): trying to subtract matrices" +
            " of different dimensions";
        }

        let result = [] as Matrix;

        for (let i = 0; i < u.length; ++i) {
            if (u[i].length != v[i].length) {
                throw "subtract(): trying to subtact matrices" +
                " of different dimensions";
            }
            result.push([]);
            for (let j = 0; j < u[i].length; ++j) {
                result[i].push(u[i][j] - v[i][j]);
            }
        }

        result.matrix = true;

        return result;
    }
    else if (isVector(u) && isVector(v)) {
        if (u.length != v.length) {
            throw "subtract(): vectors are not the same length";
        }

        let result = [] as Array<number>;

        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] - v[i]);
        }

        return result;
    }
    else if (isScalar(u) && isScalar(v)) {
        return u - v;
    }
    else {
        throw "subtact(): trying to subtact letiables of different type";
    }
}

//----------------------------------------------------------------------------

function mult_impl(u: Matrix, v: Matrix): Matrix;
function mult_impl(u: Array<number>, v: Array<number>): Array<number>;
function mult_impl(u: number, v: number): number;
function mult_impl(u, v) {
    if (isMatrix(u) && isMatrix(v)) {

        let result = [] as Matrix;

        for (let i = 0; i < u.length; ++i) {
            result.push([]);

            for (let j = 0; j < v[0].length; ++j) {
                let sum = 0.0;
                if (u[i].length != v.length) {
                    throw "mult(): trying to mult matrices that dimensions do not match";
                }
                for (let k = 0; k < v.length; ++k) {
                    sum += u[i][k] * v[k][j];
                }
                result[i].push(sum);
            }
        }

        result.matrix = true;

        return result;
    }
    else if (isVector(u) && isVector(v)) {
        if (u.length != v.length) {
            throw "mult(): vectors are not the same dimension";
        }

        let result = [] as Array<number>;

        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] * v[i]);
        }

        return result;
    }
    else if (isScalar(u) && isScalar(v)) {
        return u * v;
    }
    else {
        throw "mult(): trying to mult letiables of different type"
    }
}

export function add(...vals: number[]): number;
export function add(...vals: Array<number>[]): Array<number>;
export function add(...vals: Matrix[]): Matrix;
export function add(...vals) {
    switch (vals.length) {
        case 0: return undefined;
        case 1: return vals[0];
        case 2: return add_impl(vals[0], vals[1]);
        default: return add_impl(vals[0], add(...vals.slice(1)));
    }
}

export function subtract(...vals: number[]): number;
export function subtract(...vals: Array<number>[]): Array<number>;
export function subtract(...vals: Matrix[]): Matrix;
export function subtract(...vals) {
    switch (vals.length) {
        case 0: return undefined;
        case 1: return vals[0];
        case 2: return subtract_impl(vals[0], vals[1]);
        default: return subtract_impl(vals[0], subtract(...vals.slice(1)));
    }
}

export function mult(...vals: number[]): number;
export function mult(...vals: Array<number>[]): Array<number>;
export function mult(...vals: Matrix[]): Matrix;
export function mult(...vals) {
    switch (vals.length) {
        case 0: return undefined;
        case 1: return vals[0];
        case 2: return mult_impl(vals[0], vals[1]);
        default: return mult_impl(vals[0], mult(...vals.slice(1)));
    }
}

//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

export function translate(x, y, z) {
    if (Array.isArray(x) && x.length == 3) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    let result = mat4();
    result[0][3] = x;
    result[1][3] = y;
    result[2][3] = z;

    return result;
}

//----------------------------------------------------------------------------

export function rotate(angle, axis) {
    if (!Array.isArray(axis)) {
        axis = [arguments[1], arguments[2], arguments[3]];
    }

    let v = normalize(axis);

    let x = v[0];
    let y = v[1];
    let z = v[2];

    let c = Math.cos(angle);
    let omc = 1.0 - c;
    let s = Math.sin(angle);

    let result = mat4(
        vec4(x * x * omc + c, x * y * omc - z * s, x * z * omc + y * s, 0.0),
        vec4(x * y * omc + z * s, y * y * omc + c, y * z * omc - x * s, 0.0),
        vec4(x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c, 0.0),
        vec4()
    );

    return result;
}

export function rotateX(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    let rx = mat4(1.0, 0.0, 0.0, 0.0,
        0.0, c, s, 0.0,
        0.0, -s, c, 0.0,
        0.0, 0.0, 0.0, 1.0);
    return rx;
}

export function rotateY(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    let ry = mat4(c, 0.0, -s, 0.0,
        0.0, 1.0, 0.0, 0.0,
        s, 0.0, c, 0.0,
        0.0, 0.0, 0.0, 1.0);
    return ry;
}

export function rotateZ(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    let rz = mat4(c, s, 0.0, 0.0,
        -s, c, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0);
    return rz;
}


//----------------------------------------------------------------------------

export function scalem(x, y, z) {
    if (Array.isArray(x) && x.length == 3) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    let result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}

//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

export function lookAt(eye: Vector3D, at: Vector3D, up: Vector3D = [0, 1, 0]) {
    if (!Array.isArray(eye) || eye.length != 3) {
        throw "lookAt(): first parameter [eye] must be an a vec3";
    }

    if (!Array.isArray(at) || at.length != 3) {
        throw "lookAt(): first parameter [at] must be an a vec3";
    }

    if (!Array.isArray(up) || up.length != 3) {
        throw "lookAt(): first parameter [up] must be an a vec3";
    }

    if (equal(eye, at)) {
        return mat4();
    }

    let v = normalize(subtract(at, eye));  // view direction vector
    let n = normalize(cross(v, up));       // perpendicular vector
    let u = normalize(cross(n, v));        // "new" up vector

    v = negate(v);

    let result = mat4(
        vec4(n, -dot(n, eye)),
        vec4(u, -dot(u, eye)),
        vec4(v, -dot(v, eye)),
        vec4()
    );

    return result;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

export function ortho(left, right, bottom, top, near, far) {
    if (left == right) { throw "ortho(): left and right are equal"; }
    if (bottom == top) { throw "ortho(): bottom and top are equal"; }
    if (near == far) { throw "ortho(): near and far are equal"; }

    let w = right - left;
    let h = top - bottom;
    let d = far - near;

    let result = mat4();
    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;

    return result;
}

//----------------------------------------------------------------------------

export function perspective(fovy, aspect, near, far) {
    let f = 1.0 / Math.tan(radians(fovy) / 2);
    let d = far - near;

    let result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

export function transpose(m) {
    if (!m.matrix) {
        return "transpose(): trying to transpose a non-matrix";
    }

    let result = [] as Matrix;
    for (let i = 0; i < m.length; ++i) {
        result.push([]);
        for (let j = 0; j < m[i].length; ++j) {
            result[i].push(m[j][i]);
        }
    }

    result.matrix = true;

    return result;
}

//----------------------------------------------------------------------------
//
//  Vector Functions
//

export function dot(u: Array<number>, v: Array<number>) {
    if (u.length != v.length) {
        throw "dot(): vectors are not the same dimension";
    }

    let sum = 0.0;
    for (let i = 0; i < u.length; ++i) {
        sum += u[i] * v[i];
    }

    return sum;
}

export function lerp(u: number, v: number, t: number): number
export function lerp(u: Vector2D, v: Vector2D, t: number): Vector2D
export function lerp(u: Vector3D, v: Vector3D, t: number): Vector3D
export function lerp(u: Vector4D, v: Vector4D, t: number): Vector4D
export function lerp(u, v, t: number) {
    if (typeof u === "number" && typeof v == "number") {
        return u + (v - u) * t;
    } else if (Array.isArray(u) && Array.isArray(v) && u.length == v.length) {
        return u.map((_, i) => u[i] + (v[i] - u[i]) * t);
    } else {
        throw "lerp(): invalid argument";
    }
}

export function includedAngle(u: Array<number>, v: Array<number>) {
    return Math.acos(dot(u, v) / (length(u) * length(v)));
}

//----------------------------------------------------------------------------

export function negate<T extends Array<number>>(u: T): T {
    let result = [] as T;
    for (let i = 0; i < u.length; ++i) {
        result.push(-u[i]);
    }

    return result;
}

//----------------------------------------------------------------------------

export function cross(u: Vector3D, v: Vector3D): Vector3D;
export function cross(u, v) {
    if (!Array.isArray(u) || u.length < 3) {
        throw "cross(): first argument is not a vector of at least 3";
    }

    if (!Array.isArray(v) || v.length < 3) {
        throw "cross(): second argument is not a vector of at least 3";
    }

    let result = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];

    return result;
}

//----------------------------------------------------------------------------

export function l2_norm(u) {
    return dot(u, u);
}

export function length(u) {
    return Math.sqrt(l2_norm(u));
}

//----------------------------------------------------------------------------

export function normalize(u, excludeLastComponent?) {
    if (excludeLastComponent) {
        var last = u.pop();
    }

    let len = length(u);

    if (!isFinite(len)) {
        throw "normalize: vector " + u + " has zero length";
    }

    for (let i = 0; i < u.length; ++i) {
        u[i] /= len;
    }

    if (excludeLastComponent) {
        u.push(last);
    }

    return u;
}

//----------------------------------------------------------------------------

export function mix(u, v, s) {
    if (typeof s !== "number") {
        throw "mix: the last paramter " + s + " must be a number";
    }

    if (u.length != v.length) {
        throw "vector dimension mismatch";
    }

    let result = [];
    for (let i = 0; i < u.length; ++i) {
        result.push((1.0 - s) * u[i] + s * v[i]);
    }

    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

export function scale(s: number, u: Array<number>) {
    if (!Array.isArray(u)) {
        throw "scale: second parameter " + u + " is not a vector";
    }

    let result = [];
    for (let i = 0; i < u.length; ++i) {
        result.push(s * u[i]);
    }

    return result;
}

//----------------------------------------------------------------------------
//
//
//

export function flatten(v) {
    if (isMatrix(v)) {
        v = transpose(v);
    }

    let n = v.length;
    let elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    let floats = new Float32Array(n);

    if (elemsAreArrays) {
        let idx = 0;
        for (let i = 0; i < v.length; ++i) {
            for (let j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for (let i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}

//----------------------------------------------------------------------------

export let sizeof = {
    'vec2': new Float32Array(flatten(vec2())).byteLength,
    'vec3': new Float32Array(flatten(vec3())).byteLength,
    'vec4': new Float32Array(flatten(vec4())).byteLength,
    'mat2': new Float32Array(flatten(mat2())).byteLength,
    'mat3': new Float32Array(flatten(mat3())).byteLength,
    'mat4': new Float32Array(flatten(mat4())).byteLength
};

// printing

export function printm(m) {
    if (m.length == 2)
        for (let i = 0; i < m.length; i++)
            console.log(m[i][0], m[i][1]);
    else if (m.length == 3)
        for (let i = 0; i < m.length; i++)
            console.log(m[i][0], m[i][1], m[i][2]);
    else if (m.length == 4)
        for (let i = 0; i < m.length; i++)
            console.log(m[i][0], m[i][1], m[i][2], m[i][3]);
}
// determinants

export function det2(m) {

    return m[0][0] * m[1][1] - m[0][1] * m[1][0];

}

export function det3(m) {
    let d = m[0][0] * m[1][1] * m[2][2]
        + m[0][1] * m[1][2] * m[2][0]
        + m[0][2] * m[2][1] * m[1][0]
        - m[2][0] * m[1][1] * m[0][2]
        - m[1][0] * m[0][1] * m[2][2]
        - m[0][0] * m[1][2] * m[2][1]
        ;
    return d;
}

export function det4(m) {
    let m0 = [
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[2][1], m[2][2], m[2][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    let m1 = [
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[2][0], m[2][2], m[2][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    let m2 = [
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[2][0], m[2][1], m[2][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    let m3 = [
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[2][0], m[2][1], m[2][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];
    return m[0][0] * det3(m0) - m[0][1] * det3(m1)
        + m[0][2] * det3(m2) - m[0][3] * det3(m3);

}

export function det(m) {
    if (m.matrix != true) console.log("not a matrix");
    if (m.length == 2) return det2(m);
    if (m.length == 3) return det3(m);
    if (m.length == 4) return det4(m);
}

//---------------------------------------------------------

// inverses

export function inverse2(m) {
    let a = mat2();
    let d = det2(m);
    a[0][0] = m[1][1] / d;
    a[0][1] = -m[0][1] / d;
    a[1][0] = -m[1][0] / d;
    a[1][1] = m[0][0] / d;
    a.matrix = true;
    return a;
}

export function inverse3(m) {
    let a = mat3();
    let d = det3(m);

    let a00 = [
        vec2(m[1][1], m[1][2]),
        vec2(m[2][1], m[2][2])
    ];
    let a01 = [
        vec2(m[1][0], m[1][2]),
        vec2(m[2][0], m[2][2])
    ];
    let a02 = [
        vec2(m[1][0], m[1][1]),
        vec2(m[2][0], m[2][1])
    ];
    let a10 = [
        vec2(m[0][1], m[0][2]),
        vec2(m[2][1], m[2][2])
    ];
    let a11 = [
        vec2(m[0][0], m[0][2]),
        vec2(m[2][0], m[2][2])
    ];
    let a12 = [
        vec2(m[0][0], m[0][1]),
        vec2(m[2][0], m[2][1])
    ];
    let a20 = [
        vec2(m[0][1], m[0][2]),
        vec2(m[1][1], m[1][2])
    ];
    let a21 = [
        vec2(m[0][0], m[0][2]),
        vec2(m[1][0], m[1][2])
    ];
    let a22 = [
        vec2(m[0][0], m[0][1]),
        vec2(m[1][0], m[1][1])
    ];

    a[0][0] = det2(a00) / d;
    a[0][1] = -det2(a10) / d;
    a[0][2] = det2(a20) / d;
    a[1][0] = -det2(a01) / d;
    a[1][1] = det2(a11) / d;
    a[1][2] = -det2(a21) / d;
    a[2][0] = det2(a02) / d;
    a[2][1] = -det2(a12) / d;
    a[2][2] = det2(a22) / d;

    return a;

}

export function inverse4(m) {
    let a = mat4();
    let d = det4(m);

    let a00 = [
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[2][1], m[2][2], m[2][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    let a01 = [
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[2][0], m[2][2], m[2][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    let a02 = [
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[2][0], m[2][1], m[2][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    let a03 = [
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[2][0], m[2][1], m[2][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];
    let a10 = [
        vec3(m[0][1], m[0][2], m[0][3]),
        vec3(m[2][1], m[2][2], m[2][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    let a11 = [
        vec3(m[0][0], m[0][2], m[0][3]),
        vec3(m[2][0], m[2][2], m[2][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    let a12 = [
        vec3(m[0][0], m[0][1], m[0][3]),
        vec3(m[2][0], m[2][1], m[2][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    let a13 = [
        vec3(m[0][0], m[0][1], m[0][2]),
        vec3(m[2][0], m[2][1], m[2][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];
    let a20 = [
        vec3(m[0][1], m[0][2], m[0][3]),
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    let a21 = [
        vec3(m[0][0], m[0][2], m[0][3]),
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    let a22 = [
        vec3(m[0][0], m[0][1], m[0][3]),
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    let a23 = [
        vec3(m[0][0], m[0][1], m[0][2]),
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];

    let a30 = [
        vec3(m[0][1], m[0][2], m[0][3]),
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[2][1], m[2][2], m[2][3])
    ];
    let a31 = [
        vec3(m[0][0], m[0][2], m[0][3]),
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[2][0], m[2][2], m[2][3])
    ];
    let a32 = [
        vec3(m[0][0], m[0][1], m[0][3]),
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[2][0], m[2][1], m[2][3])
    ];
    let a33 = [
        vec3(m[0][0], m[0][1], m[0][2]),
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[2][0], m[2][1], m[2][2])
    ];



    a[0][0] = det3(a00) / d;
    a[0][1] = -det3(a10) / d;
    a[0][2] = det3(a20) / d;
    a[0][3] = -det3(a30) / d;
    a[1][0] = -det3(a01) / d;
    a[1][1] = det3(a11) / d;
    a[1][2] = -det3(a21) / d;
    a[1][3] = det3(a31) / d;
    a[2][0] = det3(a02) / d;
    a[2][1] = -det3(a12) / d;
    a[2][2] = det3(a22) / d;
    a[2][3] = -det3(a32) / d;
    a[3][0] = -det3(a03) / d;
    a[3][1] = det3(a13) / d;
    a[3][2] = -det3(a23) / d;
    a[3][3] = det3(a33) / d;

    return a;
}
export function inverse(m) {
    if (m.matrix != true) console.log("not a matrix");
    if (m.length == 2) return inverse2(m);
    if (m.length == 3) return inverse3(m);
    if (m.length == 4) return inverse4(m);
}

export function normalMatrix(m, flag) {
    let a = mat4();
    a = inverse(transpose(m));
    if (flag != true) return a;
    else {
        let b = mat3();
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) b[i][j] = a[i][j];
        return b;
    }

}

export function coordSysTransform(newSysBase: Vector3D, newSysAxis: [Vector3D, Vector3D, Vector3D]) {
    const b = newSysBase;
    const [u, v, n] = newSysAxis;
    return mat4(
        ...u, -dot(b, u),
        ...v, -dot(b, v),
        ...n, -dot(b, n),
        0, 0, 0, 1
    );
}
