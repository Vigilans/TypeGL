import { Canvas } from "../core/canvas.js";
import { WebGLAttributeMap, ShaderSource } from "../core/webgl-extension.js";
import { WebGLOrientedObject, normRgb } from "../core/webgl-object.js";
import * as MV from "../core/MV.js"
import * as gl2d from "../core/2d-figures.js"
import * as gl3d from "../core/3d-geometry.js"
import "../core/3d-geometry.js"
import "../core/camera.js"
import "../core/controller.js"
import "../core/lighting.js"
import "../core/texture.js"
import { loadImage } from "../core/texture.js";

let c = new Canvas("canvas");

async function main() {
    let sphereArray = [];
    const normalShader = await c.sourceByFile("normal-shader.glslv", "normal-shader.glslf");
    const textureShader = await c.sourceByFile("texture-shader.glslv", "texture-shader.glslf");

    const plane = c.drawPlane([0, 0, 0], "fill", textureShader, [0, 0, 0], 128, 128, 32, 32);

    //const sphere = c.drawSphere("#ffff00", "fill", textureShader, [10, 0.5, -10], 0.5, 32, 32);

    const cube = drawCube(normalShader);

    const fish_kun_attr = JSON.parse(await (await fetch("fish-kun.json")).text());
    const fish_kun = c.newOrientedObject(
        normalShader, [0, 0, -1], [0, 1, 0], c.gl.TRIANGLES, fish_kun_attr, { 
            u_Color: MV.vec4(normRgb("rgb(47, 79, 139)"))
        }
    );

    const fish_aqua_raw = JSON.parse(await (await fetch("fish-aqua/fish-aqua.json")).text());
    const fish_aqua_attr = fish_aqua_raw.models[0].fields as WebGLAttributeMap;
    const fish_aqua = c.newOrientedObject(
        textureShader, [0, 0, 1], [0, 1, 0], c.gl.TRIANGLES, fish_aqua_attr
    );
    const fish_aqua_DM = await loadImage("fish-aqua/fish-aqua-DM.jpg");
    const fish_aqua_NM = await loadImage("fish-aqua/fish-aqua-NM.png");

    const ball_texture = await loadImage("eyeball.jpg");
    const ground_texture = await loadImage("ground.jpg");
    plane.bindTexture(ground_texture);

    fish_aqua.bindTexture(fish_aqua_DM, fish_aqua_NM);

    const fish_bezier = createFishWithCardioid(fish_kun, normalShader);

    const lighting = c.bindLighting(
        [10, 15, 10], 
        [0.2, 0.2, 0.2, 1.0], 
        [1.0, 1.0, 1.0, 1.0], 
        [1.0, 1.0, 1.0, 1.0],
        [1, 0.01, 0]
    );

    // 让光源沿Y轴旋转
    c.updatePipeline.push((cv, time, deltaTime) => {
        const R = MV.rotateY(2 * deltaTime);
        lighting.transform(R);
    });

    //c.bindShadowObject(sphere, lighting);
    c.bindShadowObject(cube, lighting);
    c.bindShadowObject(fish_kun, lighting);
    c.bindShadowObject(fish_aqua, lighting);
    c.bindShadowObject(fish_bezier, lighting);

    c.bindController(fish_kun);
    c.bindController(fish_aqua, { offset: [6, 0, 7], rotate: [0, -4 * Math.PI / 5, 0] });
    c.bindController(lighting,  { offset: lighting.center });

    c.bindCamera(50, undefined, [5, 0, 5]);

    c.gl.activeTexture(c.gl.TEXTURE0);
 
    setInterval(()=>{
        let x = MV.randomNum(-80,80), y = MV.randomNum(-1,15), z = MV.randomNum(-80,80)
        let newSphere;
        sphereArray.push(newSphere = c.drawSphere("#ffff00","fill",textureShader,[x,y,z],0.5,32,32))
        newSphere.bindTexture(ball_texture);
        c.bindShadowObject(newSphere,lighting);
    },5000)
    let totalScore = 0;
    setInterval(function checkCollider(){
        sphereArray.forEach((mySphere,INDEX)=>{
            let isCollider = MV.collider(fish_kun,mySphere);
            if(isCollider){
                mySphere.transform(MV.translate(100,1000,100));
                sphereArray.splice(INDEX,1);
                totalScore += 50;
                document.getElementById("scoreShow").innerText="Score : " + totalScore;
            }
        })
    },1000)

    c.render(true);
}


function createFishWithCardioid(focusObj: WebGLOrientedObject, source: ShaderSource) {
    let fishVerts = gl2d.createBezierCurveVertices([
        [313, 0], [298, 4], [259, -20], [230, -46], [333, -152],
        [691, -157], [870, -11], [910, 0], [969, -23], [997, -64]
    ]);

    let fishAttr = gl3d.lathePoints(fishVerts, [0.002, 0.002, 0.002], [1, 0, 0], undefined, undefined, undefined, false, false);
    let fishObj = c.newOrientedObject(
        source, [0, 1, 0], [1, 0, 0], c.gl.TRIANGLES, gl3d.generateNormals(fishAttr, Math.PI / 6), {
            u_Ambient: [0.0, 1.0, 0.0, 1.0],
            u_Diffuse: [0.4, 0.8, 0.4, 1.0],
            u_Specular: [0.0, 0.4, 0.4, 1.0],
            u_Shininess: 1.0
        }
    );

    // // 画心形线
    c.updatePipeline.push((cv, time, deltaTime) => {
        const theta = 0.75 * time * Math.PI;
        const rou = 5 * (1 + Math.sin(theta)); // a = 10
        const x = rou * Math.cos(theta);
        const y = rou * Math.sin(theta);
        const d = Math.sqrt(x * x + y * y);
        const dx = (x - 2 * x * d);
        const dy = (2 * y * d - d - y);
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
            data: [-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5]
        },
        a_Normal: {
            numComponents: 3,
            data: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]
        }
    }, {
        u_Ambient: [0.0, 1.0, 0.0, 1.0],
        u_Diffuse: [0.4, 0.8, 0.4, 1.0],
        u_Specular: [0.0, 0.4, 0.4, 1.0],
        u_Shininess: 300.0
    })
    cube.transform(MV.translate(-10, 0.5, -5));
    return cube;
}

main();
