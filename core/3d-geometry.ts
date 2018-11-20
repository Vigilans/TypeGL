import * as MV from "./MV.js"
import { WebGLAttributeMap } from "./webgl-extension.js";

// 通过轮廓创建3D模型
export function lathePoints(
    points: Array<MV.Vector2D>,
    scale: MV.Vector3D = [1, 1, 1], // 放缩倍数
    axis:  MV.Vector3D = [0, 1, 0], // 旋转轴
    startAngle = 0,         // 起始角 (例如 0)
    endAngle = Math.PI * 2, // 终止角 (例如 Math.PI * 2)
    numDivisions = 8,      // 这中间生成多少块
    capStart = true,        // true 就封闭起点
    capEnd   = true         // true 就封闭终点
) {
    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    const vOffset = capStart ? 1 : 0;
    const pointsPerColumn = points.length + vOffset + (capEnd ? 1 : 0);
    const quadsDown = pointsPerColumn - 1;

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
            texCoords.push(u, v);
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
        indices:  { numComponents: 3, data: indices },
    } as WebGLAttributeMap;
}

