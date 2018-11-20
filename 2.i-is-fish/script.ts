import { Canvas } from "../core/canvas.js";
import { WebGLAttribute } from "../core/webgl-extension.js";
import * as MV from "../core/MV.js"

interface Controller {
    rotateAngle?: number;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
    offsetZ?: number;
}

let nowPtr: number = 0;
let ctrl: [Controller, Controller] = [{
    rotateAngle: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 0.2,
    offsetZ: 0
}, {
    rotateAngle: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 0.2,
    offsetZ: 0
}];

let rAngle = 0;
let rAxis = [0, 0, 1];
let rMatrix = MV.mat4();

let trackingMouse = false;
let trackballMove = false;

let lastPos = [0, 0, 0];
let curx, cury;
let startX, startY;

let c = new Canvas("canvas");

function mult2(A,B){
    let c = [0,0,0,0];
    for(var i = 0 ; i < A.length ; i++){
        for(var j = 0 ; j < B.length ; j++)
            c[i]+=A[i][j]*B[j];
    }
    return c;
}

let render = (anime=true) => c.render((cv: Canvas) => {
    let uniforms;
    try {
        uniforms = cv.objectsToDraw[nowPtr].uniforms;
    } catch (e) {
        console.log(e);
    }
    let ctr = ctrl[nowPtr];
    let S = MV.scalem(ctr.scale, ctr.scale, ctr.scale);

    let R = MV.rotateY(ctr.rotateAngle);
    let FB = mult2(R,uniforms.u_Direction);
    let T = MV.translate(
                         ctr.offsetX+FB[0],
                         ctr.offsetY+FB[1],
                         ctr.offsetZ+FB[2]
                        );
    console.log(FB," asdasd ",ctr)
    uniforms.u_MVMatrix = MV.flatten(MV.mult(MV.mult(S, R), T));
    uniforms.u_Color = [1, 0.5, 0, 1];

    rMatrix = MV.mult(rMatrix, MV.rotate(rAngle, rAxis));
    for (let { uniforms } of cv.objectsToDraw) {
        uniforms.u_RMatrix = MV.flatten(rMatrix);
    }
}, anime);

async function main() {
    let raw = JSON.parse(await (await fetch("aqua-fish.json")).text());
    let aqua_fish = raw.models[0].fields as { [key: string]: WebGLAttribute };
    delete aqua_fish.binormal;
    delete aqua_fish.texCoord;
    delete aqua_fish.tangent;

    c.newObject(
        await c.sourceByFile("fish.glslv", "fish.glslf"),
        c.gl.TRIANGLES,
        aqua_fish, {
            u_MVMatrix: MV.flatten(MV.scalem(0.2, 0.2, 0.2)),
            u_RMatrix: MV.flatten(MV.mat4()),
            u_Color: [1, 0.5, 0, 1],
            u_Direction: [0, 0, 1, 1]
        }
    );

    let kun = JSON.parse(await (await fetch("kun.json")).text());

    c.newObject(
        await c.sourceByFile("fish.glslv", "fish.glslf"),
        c.gl.LINES,
        kun, {
            u_MVMatrix: MV.flatten(MV.scalem(0.2, 0.2, 0.2)),
            u_RMatrix:  MV.flatten(MV.mat4()),
            u_Color: [1, 0.5, 0, 1],
            u_Direction: [0, 0, -1, 1]
        }
    );

    c.canvas.addEventListener("mousedown", function (event) {
        var x = 2 * event.clientX / c.canvas.width - 1;
        var y = 2 * (c.canvas.height - event.clientY) / c.canvas.height - 1;
        startMotion(x, y);
    });

    c.canvas.addEventListener("mouseup", function (event) {
        var x = 2 * event.clientX / c.canvas.width - 1;
        var y = 2 * (c.canvas.height - event.clientY) / c.canvas.height - 1;
        stopMotion(x, y);
    });

    c.canvas.addEventListener("mousemove", function (event) {
        var x = 2 * event.clientX / c.canvas.width - 1;
        var y = 2 * (c.canvas.height - event.clientY) / c.canvas.height - 1;
        mouseMotion(x, y);
        render(false);
    });

    render();
}

// 键盘交互

document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 49) {
        nowPtr = 0;
    }
    if (e && e.keyCode == 50) {
        nowPtr = 1;
    }
    // ↑ 38 ↓ 40 ← 37 →39
    // z 90 c 67
    // w 87 s 83
    // q 81 e 101
    if (e && e.keyCode == 38) {
        ctrl[nowPtr].offsetY += 0.05;
    }
    if (e && e.keyCode == 40) {
        ctrl[nowPtr].offsetY -= 0.05;
    }
    if (e && e.keyCode == 37) {
        ctrl[nowPtr].offsetX -= 0.05;
    }
    if (e && e.keyCode == 39) {
        ctrl[nowPtr].offsetX += 0.05;
    }
    if (e && e.keyCode == 90) {
        ctrl[nowPtr].rotateAngle++;
    }
    if (e && e.keyCode == 67) {
        ctrl[nowPtr].rotateAngle--;
    }
    if (e && e.keyCode == 87) { //w 放大
        ctrl[nowPtr].scale += 0.005;
    }
    if (e && e.keyCode == 83) { //s 缩小
        ctrl[nowPtr].scale -= 0.005;
        if (ctrl[nowPtr].scale < 0) ctrl[nowPtr].scale = 1;
    }
    if (e && e.keyCode == 81){
        ctrl[nowPtr].offsetZ += 0.05;
    }
    if(e && e.keyCode == 69){
        ctrl[nowPtr].offsetZ -= 0.05;
    }
}

// 鼠标跟踪球交互

function trackballView(x, y) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0] * v[0] + v[1] * v[1];
    if (d < 1.0)
        v[2] = Math.sqrt(1.0 - d);
    else {
        v[2] = 0.0;
        a = 1.0 / Math.sqrt(d);
        v[0] *= a;
        v[1] *= a;
    }
    return v;
}

function mouseMotion(x, y) {
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if (trackingMouse) {
        dx = curPos[0] - lastPos[0];
        dy = curPos[1] - lastPos[1];
        dz = curPos[2] - lastPos[2];

        if (dx || dy || dz) {
            rAngle = -0.1 * Math.sqrt(dx * dx + dy * dy + dz * dz);


            rAxis[0] = lastPos[1] * curPos[2] - lastPos[2] * curPos[1];
            rAxis[1] = lastPos[2] * curPos[0] - lastPos[0] * curPos[2];
            rAxis[2] = lastPos[0] * curPos[1] - lastPos[1] * curPos[0];

            lastPos[0] = curPos[0];
            lastPos[1] = curPos[1];
            lastPos[2] = curPos[2];
        }
    }
}

function startMotion(x, y) {
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
    trackballMove = true;
}

function stopMotion(x, y) {
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
        rAngle = 0.0;
        trackballMove = false;
    }
}

main();
