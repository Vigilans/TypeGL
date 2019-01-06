import { Canvas } from "../../core/canvas.js";
import { WebGLAttributeMap, ShaderSource } from "../../core/webgl-extension.js";
import { WebGLOrientedObject, normRgb } from "../../core/webgl-object.js";
import * as MV from "../../core/MV.js"
import * as gl2d from "../../core/2d-figures.js"
import * as gl3d from "../../core/3d-geometry.js"
import "../../core/3d-geometry.js"
import "../../core/camera.js"
import "../../core/controller.js"
import "../../core/lighting.js"

let c = new Canvas("canvas");

async function main() {
    let source = await c.sourceByFile("shader.glslv", "shader.glslf");

    const plane = c.drawPlane([0, 0, 0], "stroke", source, [0, 0, 0], 128, 128, 32, 32);

    const sphere = c.drawSphere("#ffff00", "fill", source, [10, 0.5, -10], 0.5, 32, 32);

    const cube = drawCube(source);

    const fish_kun_attr = JSON.parse(await (await fetch("fish-kun.json")).text());
    const fish_kun = c.newOrientedObject(
        source, [0, 0, -1], [0, 1, 0], c.gl.TRIANGLES, fish_kun_attr, { 
            u_Color: MV.vec4(normRgb("rgb(47, 79, 139)"))
        }
    );

    const fish_aqua_raw = JSON.parse(await (await fetch("fish-aqua.json")).text());
    const fish_aqua_attr = fish_aqua_raw.models[0].fields as WebGLAttributeMap;
    const fish_aqua = c.newOrientedObject(
        source, [0, 0, 1], [0, 1, 0], c.gl.TRIANGLES, fish_aqua_attr, { 
            u_Ambient:  [1.0, 0.0, 1.0, 1.0],
            u_Diffuse:  [1.0, 0.8, 1.0, 1.0],
            u_Specular: [1.0, 1.0, 1.0, 1.0],
            u_Shininess: 1.0
        }
    );

    const fish_bezier = createFishWithCardioid(fish_kun, source);

    const lighting = c.bindLighting({
        initialPos: [10, 15, 10],
        ambient:  [0.2, 0.2, 0.2, 1.0],
        diffuse:  [1.0, 1.0, 1.0, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        distFactors: [1, 0.01, 0]
    });


    // 让光源沿Y轴旋转
    c.updatePipeline.push((cv, time, deltaTime) => {
        const R = MV.rotateY(2 * deltaTime);
        lighting.transform(R);
    });

    c.bindShadowObject(sphere, lighting);
    c.bindShadowObject(cube, lighting);
    c.bindShadowObject(fish_kun, lighting);
    c.bindShadowObject(fish_aqua, lighting);
    c.bindShadowObject(fish_bezier, lighting);

    c.bindController(fish_kun);
    c.bindController(fish_aqua, { offset: [6, 0, 7], rotate: [0, -4 * Math.PI / 5, 0] });
    c.bindController(lighting,  { offset: lighting.center });

    c.bindCamera(50, undefined, [5, 0, 5]);
 
    c.render(true);
}


function createFishWithCardioid(focusObj: WebGLOrientedObject, source: ShaderSource) {
    let fishVerts = gl2d.createBezierCurveVertices([
        [313, 0],    [298, 4],   [259, -20], [230, -46], [333, -152],
        [691, -157], [870, -11], [910, 0],   [969, -23], [997, -64] 
    ]);

    let fishAttr = gl3d.lathePoints(fishVerts, [0.002, 0.002, 0.002], [1, 0, 0], undefined, undefined, undefined, false, false);
    let fishObj = c.newOrientedObject(
        source, [0, 1, 0], [1, 0, 0], c.gl.TRIANGLES, gl3d.generateNormals(fishAttr, Math.PI / 6), { 
            u_Ambient:  [0.0, 1.0, 0.0, 1.0],
            u_Diffuse:  [0.4, 0.8, 0.4, 1.0],
            u_Specular: [0.0, 0.4, 0.4, 1.0],
            u_Shininess: 300.0
        }
    );

    // // 画心形线
    c.updatePipeline.push((cv, time, deltaTime) => {
        const theta = 0.75 * time * Math.PI;
        const rou = 5 * (1 + Math.sin(theta)); // a = 10
        const x = rou * Math.cos(theta);
        const y = rou * Math.sin(theta);
        const d = Math.sqrt(x * x + y * y);
        const dx = (x - 2*x*d);
        const dy = (2*y*d - d - y);
        const newDir = MV.normalize([dx, dy, 0]);
        const deltaTheta = MV.includedAngle(newDir, fishObj.initDir);
        const cstMatrix = MV.coordSysTransform(focusObj.center, focusObj.coordSystem);
        fishObj.setModel(MV.mult(
            MV.inverse4(cstMatrix),
            MV.translate(y, 0, x),
            MV.rotateZ(deltaTheta),
            cstMatrix,
            MV.translate(...focusObj.center),
            MV.rotateZ(-Math.PI / 2),
        ));
    });

    return fishObj;
}

function drawCube(source: ShaderSource) {
    const cube = c.newObject(source, c.gl.TRIANGLES, {
        a_Position: {
            numComponents: 3,
            data: [-0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,0.5,-0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5]
        },
        a_Normal: {
            numComponents: 3,
            data: [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1]
        }
    }, {
        u_Ambient:  [0.0, 1.0, 0.0, 1.0],
        u_Diffuse:  [0.4, 0.8, 0.4, 1.0],
        u_Specular: [0.0, 0.4, 0.4, 1.0],
        u_Shininess: 300.0
    })
    cube.transform(MV.translate(-10, 0.5, -5));
    return cube;
}

main();
