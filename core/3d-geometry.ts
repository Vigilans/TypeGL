import * as MV from "./MV.js";
import { WebGLAttributeMap, WebGLAttribute, WebGLUniformType, WebGLArray } from "./webgl-extension.js";
import { WebGLRenderingObject } from "./webgl-object.js";
import { Canvas } from "./canvas.js";

// 创建一个平面的顶点
export function createPlaneVertices(
    width = 1,
    depth = 1,
    subdivisionsWidth = 1,
    subdivisionsDepth = 1
) {
    const numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
    const positions: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    for (let z = 0; z <= subdivisionsDepth; z++) {
        for (let x = 0; x <= subdivisionsWidth; x++) {
            const u = x / subdivisionsWidth;
            const v = z / subdivisionsDepth;
            positions.push(
                width * u - width * 0.5,
                0,
                depth * v - depth * 0.5
            );
            normals.push(0, 1, 0);
            texCoords.push(u, v);
        }
    }

    let numVertsAcross = subdivisionsWidth + 1;

    for (let z = 0; z < subdivisionsDepth; z++) {
        for (let x = 0; x < subdivisionsWidth; x++) {
            // Make triangle 1 of quad.
            indices.push(
                (z + 0) * numVertsAcross + x,
                (z + 1) * numVertsAcross + x,
                (z + 0) * numVertsAcross + x + 1
            );

            // Make triangle 2 of quad.
            indices.push(
                (z + 1) * numVertsAcross + x,
                (z + 1) * numVertsAcross + x + 1,
                (z + 0) * numVertsAcross + x + 1
            );
        }
    }

    return {
        position: { numComponents: 3, data: positions },
        texCoord: { numComponents: 2, data: texCoords },
        normal: { numComponents: 3, data: normals },
        indices: { numComponents: 3, data: indices },
    } as WebGLAttributeMap;
}

// 创建一个球体的顶点
export function createSphereVertices(
    radius,
    subdivisionsAxis,
    subdivisionsHeight,
    opt_startLatitudeInRadians = 0,
    opt_endLatitudeInRadians = Math.PI,
    opt_startLongitudeInRadians = 0,
    opt_endLongitudeInRadians = Math.PI * 2
) {
    if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
        throw Error('subdivisionAxis and subdivisionHeight must be > 0');
    }

    const latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
    const longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

    // We are going to generate our sphere by iterating through its
    // spherical coordinates and generating 2 triangles for each quad on a
    // ring of the sphere.
    const numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
    const positions: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    // Generate the individual vertices in our vertex buffer.
    for (let y = 0; y <= subdivisionsHeight; y++) {
        for (let x = 0; x <= subdivisionsAxis; x++) {
            // Generate a vertex based on its spherical coordinates
            const u = x / subdivisionsAxis;
            const v = y / subdivisionsHeight;
            const theta = longRange * u;
            const phi = latRange * v;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            const ux = cosTheta * sinPhi;
            const uy = cosPhi;
            const uz = sinTheta * sinPhi;
            positions.push(radius * ux, radius * uy, radius * uz);
            normals.push(ux, uy, uz);
            texCoords.push(1 - u, v);
        }
    }

    const numVertsAround = subdivisionsAxis + 1;
    for (let x = 0; x < subdivisionsAxis; x++) {
        for (let y = 0; y < subdivisionsHeight; y++) {
            // Make triangle 1 of quad.
            indices.push(
                (y + 0) * numVertsAround + x,
                (y + 0) * numVertsAround + x + 1,
                (y + 1) * numVertsAround + x
            );

            // Make triangle 2 of quad.
            indices.push(
                (y + 1) * numVertsAround + x,
                (y + 0) * numVertsAround + x + 1,
                (y + 1) * numVertsAround + x + 1
            );
        }
    }

    return {
        position: { numComponents: 3, data: positions },
        texCoord: { numComponents: 2, data: texCoords },
        normal: { numComponents: 3, data: normals },
        indices: { numComponents: 3, data: indices },
    } as WebGLAttributeMap;
}

export function bindDrawing3D<T extends any[]>(createVertices: (..._Args: T) => WebGLAttributeMap) {
    return function (this: Canvas, color: string | number[], mode: "fill" | "stroke", ...args: T) {
        const attributes = createVertices(...args);
        return this.drawFigure3D(color, mode, attributes);
    }
}

const drawFigureBindings = {
    drawPlane: bindDrawing3D(createPlaneVertices),
    drawSphere: bindDrawing3D(createSphereVertices)
};

declare module "./canvas.js" {
    interface Canvas {
        drawFigure3D(color: string | number[], mode: "fill" | "stroke", attributes?: { [key: string]: WebGLAttribute }, uniforms?: { [key: string]: WebGLUniformType }): WebGLRenderingObject;
        drawPlane: typeof drawFigureBindings.drawPlane;
        drawSphere: typeof drawFigureBindings.drawSphere;
    }
}

Object.assign(Canvas.prototype, {
    drawFigure3D(
        this: Canvas,
        color: string | number[],
        mode: "fill" | "stroke",
        attributes?: { [key: string]: WebGLAttribute },
        uniforms?: { [key: string]: WebGLUniformType }
    ) {
        attributes = attributes || {};
        uniforms = uniforms || {};
        const source = {
            vertSrc: `
                attribute vec4 a_Position;

                void main() {
                    gl_Position = a_Position;
                }
            `,
            fragSrc: `
                precision mediump float;
                uniform vec3 u_Color;
                
                void main() {
                    gl_FragColor = vec4(u_Color, 1.0);
                }            
            `
        };
        Object.assign(uniforms, { u_Color: this.normRgb(color) });
        return this.newObject(source, this.fillOrStroke(mode), attributes, uniforms);
    },
}, drawFigureBindings);

// 下面的建模函数来源于https://webglfundamentals.org/webgl/lessons/webgl-3d-geometry-lathe.html

// 通过轮廓创建3D模型
export function lathePoints(
    points: Array<MV.Vector2D>,
    scale: MV.Vector3D = [1, 1, 1], // 放缩倍数
    axis: MV.Vector3D = [0, 1, 0], // 旋转轴
    startAngle = 0,         // 起始角 (例如 0)
    endAngle = Math.PI * 2, // 终止角 (例如 Math.PI * 2)
    numDivisions = 8,       // 这中间生成多少块
    capStart = true,        // true 就封闭起点
    capEnd = true         // true 就封闭终点
) {
    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    const vOffset = capStart ? 1 : 0;
    const pointsPerColumn = points.length + vOffset + (capEnd ? 1 : 0);
    const quadsDown = pointsPerColumn - 1;

    // 平滑材质的坐标分布
    let vCoords = [];
    let length = 0;
    for (let i = 0; i < points.length - 1; ++i) {
        vCoords.push(length);
        length += MV.distance(points[i], points[i + 1]);
    }
    vCoords.push(length);
    vCoords = vCoords.map(v => v / length);

    // 生成点
    for (let division = 0; division <= numDivisions; ++division) {
        const u = division / numDivisions;
        const angle = MV.lerp(startAngle, endAngle, u) % (Math.PI * 2);
        const mat = MV.mult(MV.rotate(angle, axis), MV.scalem(...scale));
        const axis_scale = MV.mult(scale, axis);
        if (capStart) {
            // 在开始处添加一个旋转轴上的点
            positions.push(...MV.mult(axis_scale, MV.vec3(points[0])));
            texCoords.push(u, 0);
        }
        points.forEach((p, ndx) => {
            const tp = MV.transformPoint(mat, MV.vec3(p));
            positions.push(tp[0], tp[1], tp[2]);
            const v = (ndx + vOffset) / quadsDown;
            texCoords.push(u, vCoords[ndx]);
        });
        if (capEnd) {
            // 在终点处添加一个旋转轴上的点
            positions.push(...MV.mult(axis_scale, MV.vec3(points.slice(-1)[0])));
            texCoords.push(u, 1);
        }
    }

    // 创建索引
    for (let division = 0; division < numDivisions; ++division) {
        const column1Offset = division * pointsPerColumn;
        const column2Offset = column1Offset + pointsPerColumn;
        for (let quad = 0; quad < quadsDown; ++quad) {
            indices.push(column1Offset + quad, column2Offset + quad, column1Offset + quad + 1);
            indices.push(column1Offset + quad + 1, column2Offset + quad, column2Offset + quad + 1);
        }
    }

    return {
        position: { numComponents: 3, data: positions },
        texCoord: { numComponents: 2, data: texCoords },
        indices: { numComponents: 3, data: indices },
    } as WebGLAttributeMap;
}

export function generateNormals(model: WebGLAttributeMap, maxAngle: number) {
    const positions = model.position.data as number[];
    const texcoords = model.texcoord.data as number[];

    // first compute the normal of each face
    let getNextIndex = makeIndiceIterator(model);
    const numFaceVerts = getNextIndex.numElements;
    const numVerts = model.position.data.length;
    const numFaces = numFaceVerts / 3;
    const faceNormals = [] as Array<MV.Vector3D>;

    // Compute the normal for every face.
    // While doing that, create a new vertex for every face vertex
    for (let i = 0; i < numFaces; ++i) {
        const n1 = getNextIndex() * 3;
        const n2 = getNextIndex() * 3;
        const n3 = getNextIndex() * 3;

        const v1 = positions.slice(n1, n1 + 3) as MV.Vector3D;
        const v2 = positions.slice(n2, n2 + 3) as MV.Vector3D;
        const v3 = positions.slice(n3, n3 + 3) as MV.Vector3D;

        faceNormals.push(MV.normalize(MV.cross(MV.subtract(v1, v2), MV.subtract(v3, v2))));
    }

    let tempVerts: { [key: string]: number } = {};
    let tempVertNdx = 0;

    // this assumes vertex positions are an exact match

    function getVertIndex(vert: MV.Vector3D) {
        const vertId = vert.toString();
        const ndx = tempVerts[vertId];
        if (ndx !== undefined) {
            return ndx;
        }
        const newNdx = tempVertNdx++;
        tempVerts[vertId] = newNdx;
        return newNdx;
    }

    // We need to figure out the shared vertices.
    // It's not as simple as looking at the faces (triangles)
    // because for example if we have a standard cylinder
    //
    //
    //      3-4
    //     /   \
    //    2     5   Looking down a cylinder starting at S
    //    |     |   and going around to E, E and S are not
    //    1     6   the same vertex in the data we have
    //     \   /    as they don't share UV coords.
    //      S/E
    //
    // the vertices at the start and end do not share vertices
    // since they have different UVs but if you don't consider
    // them to share vertices they will get the wrong normals

    const vertIndices = [] as number[];
    for (let i = 0; i < numVerts; ++i) {
        const offset = i * 3;
        const vert = positions.slice(offset, offset + 3) as MV.Vector3D;
        vertIndices.push(getVertIndex(vert));
    }

    // go through every vertex and record which faces it's on
    const vertFaces = [] as number[][];
    getNextIndex.reset();
    for (let i = 0; i < numFaces; ++i) {
        for (let j = 0; j < 3; ++j) {
            const ndx = getNextIndex();
            const sharedNdx = vertIndices[ndx];
            let faces = vertFaces[sharedNdx];
            if (!faces) {
                faces = [];
                vertFaces[sharedNdx] = faces;
            }
            faces.push(i);
        }
    }

    // now go through every face and compute the normals for each
    // vertex of the face. Only include faces that aren't more than
    // maxAngle different. Add the result to arrays of newPositions,
    // newTexcoords and newNormals, discarding any vertices that
    // are the same.
    tempVerts = {};
    tempVertNdx = 0;
    const newPositions: number[] = [];
    const newTexcoords: number[] = [];
    const newNormals: number[] = [];

    function getNewVertIndex(x, y, z, nx, ny, nz, u, v) {
        const vertId = arguments.toString();
        const ndx = tempVerts[vertId];
        if (ndx !== undefined) {
            return ndx;
        }
        const newNdx = tempVertNdx++;
        tempVerts[vertId] = newNdx;
        newPositions.push(x, y, z);
        newNormals.push(nx, ny, nz);
        newTexcoords.push(u, v);
        return newNdx;
    }

    const newVertIndices: number[] = [];
    getNextIndex.reset();
    const maxAngleCos = Math.cos(maxAngle);
    // for each face
    for (let i = 0; i < numFaces; ++i) {
        // get the normal for this face
        const thisFaceNormal = faceNormals[i];
        // for each vertex on the face
        for (let j = 0; j < 3; ++j) {
            const ndx = getNextIndex();
            const sharedNdx = vertIndices[ndx];
            const faces = vertFaces[sharedNdx];
            let norm = [0, 0, 0] as MV.Vector3D;
            faces.forEach(faceNdx => {
                // is this face facing the same way
                const otherFaceNormal = faceNormals[faceNdx];
                const dot = MV.dot(thisFaceNormal, otherFaceNormal);
                if (dot > maxAngleCos) {
                    norm = MV.add(otherFaceNormal, norm);
                }
            });
            norm = MV.normalize(norm);
            const poffset = ndx * 3;
            const toffset = ndx * 2;
            newVertIndices.push(getNewVertIndex(
                positions[poffset + 0], positions[poffset + 1], positions[poffset + 2],
                norm[0], norm[1], norm[2],
                texcoords[toffset + 0], texcoords[toffset + 1]
            ));
        }
    }

    return {
        position: { numComponents: 3, newPositions },
        texCoord: { numComponents: 2, newTexcoords },
        normal: { numComponents: 3, newNormals },
        indices: { numComponents: 3, newVertIndices },
    };
}

function makeIndexedIndicesFn(model: WebGLAttributeMap) {
    const indices = model.indices.data;
    let ndx = 0;
    const fn = function () {
        return indices[ndx++];
    };
    fn.reset = function () {
        ndx = 0;
    };
    fn.numElements = indices.length;
    return fn;
}

function makeUnindexedIndicesFn(model: WebGLAttributeMap) {
    let ndx = 0;
    const fn = function () {
        return ndx++;
    };
    fn.reset = function () {
        ndx = 0;
    }
    fn.numElements = model.positions.data.length / 3;
    return fn;
}

function makeIndiceIterator(model: WebGLAttributeMap) {
    return model.indices
        ? makeIndexedIndicesFn(model)
        : makeUnindexedIndicesFn(model);
}
