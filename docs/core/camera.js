import { Canvas } from "./canvas.js";
import * as MV from "./MV.js";
// 将 (x, y) 由 [-1, 1] × [-1, 1] 平面映射至单位半球面
export function trackballView(x, y) {
    let v = MV.vec2(x, y);
    let n = MV.l2_norm(v);
    if (n <= 1.0) {
        return MV.vec3(v, Math.sqrt(1.0 - n));
    }
    else {
        return MV.vec3(MV.normalize(v), 0.0);
    }
}
// 只记录瞬时更新信息，长时累积效应通过Camera类保存。
export class Trackball {
    constructor(speed = 50, focusType = "void", reserveAfterStop = false) {
        this.speed = speed;
        this.focusType = focusType;
        this.reserveAfterStop = reserveAfterStop;
        this.mode = "rotate";
        // 状态变量
        this.trackingMouse = false; // 记录是否开始更新变量
        this.lastPlanePos = MV.vec2(); // 上一时刻平面位置
        this.lastBallPos = MV.vec3(); // 上一时刻跟踪球位置
        // 更新变量
        this.rAxis = [0, 0, 1];
        this.rAngle = 0.0;
        this.tOffset = MV.vec3();
    }
    reset() {
        this.rAngle = 0.0;
        this.rAxis = [0, 0, 1];
        this.tOffset = MV.vec3();
    }
    startRecord(x, y) {
        this.trackingMouse = true;
        if (x && y) {
            this.lastBallPos = trackballView(x, y);
        }
    }
    stopRecord() {
        this.trackingMouse = false;
        if (!this.reserveAfterStop) {
            this.reset();
        }
    }
}
// 保存由Trackball积累下来的效应
export class Camera {
    constructor(perspective, // 视角矩阵
    focusObj, // focusObj: 当前聚焦的对象，决定了摄像机的聚焦模式
    position = [0, 0, 1], // Camera所处的位置，是Trackball的积累效应
    up = [0, 1, 0], // Camera的上头位置
    updateSpeed = 50) {
        this.perspective = perspective;
        this.focusObj = focusObj;
        this.position = position;
        this.up = up;
        // Trackball所积累的变换矩阵
        this.transMatrix = MV.mat4();
        this.trackball = new Trackball(updateSpeed);
        if (!focusObj) {
            this.focusBallCenter = MV.vec3();
            if (this.position) {
                this.focusBallRadius = MV.length(MV.subtract(this.position, this.focusBallCenter));
            }
            else {
                this.focusBallRadius = 2;
                this.position = MV.add(this.focusBallCenter, MV.vec3(0, 0, 2));
            }
        }
    }
    get center() {
        return this.focusObj ? this.focusObj.center : this.focusBallCenter;
    }
    get orientation() {
        return MV.normalize(MV.subtract(this.center, this.position));
    }
    get sideAxis() {
        return MV.normalize(MV.cross(this.orientation, this.up));
    }
    get viewMatrix() {
        const lookAt = MV.lookAt(this.position, this.center, this.up);
        return lookAt;
    }
    get projectionMatrix() {
        return this.perspective;
    }
    // 更新 Camera 的所处位置，为了防溢出操碎了心……
    updatePosition() {
        // 旋转变换通过矩阵完成
        if (this.trackball.rAngle !== 0) {
            const C = MV.coordSysTransform(MV.vec3(), [this.sideAxis, this.up, MV.negate(this.orientation)]);
            const R = MV.rotate(-this.trackball.rAngle, this.trackball.rAxis); // 视点沿鼠标反方向旋转
            const M = MV.mult(MV.inverse4(C), R, C);
            // 下面只对方向向量作旋转变换，变换完后立即归一化
            let length = MV.length(MV.subtract(this.position, this.center));
            let orient = MV.normalize(MV.transformPoint(M, this.orientation));
            let up = MV.normalize(MV.transformPoint(M, this.up));
            // 强制调整orient，使orient与up垂直
            if (MV.dot(orient, up) !== 0) {
                for (let i = 0; i < up.length; ++i) {
                    if (up[i] !== 0) {
                        orient[i] -= MV.dot(orient, up) / up[i];
                        break;
                    }
                }
            }
            // 通过向量运算获取新的position
            this.position = MV.add(this.center, MV.scale(-length, orient));
            this.up = up;
        }
        this.position = MV.add(this.position, this.trackball.tOffset);
        this.trackball.reset();
    }
    mouseMotion(x, y) {
        let curBallPos = trackballView(x, y);
        let trackball = this.trackball;
        if (trackball.trackingMouse) {
            switch (trackball.mode) {
                case "rotate": { // 镜头在聚焦球球面上旋转
                    const mouseDelta = MV.subtract(curBallPos, trackball.lastBallPos);
                    const delta = MV.scale(trackball.speed / 10, mouseDelta);
                    if (!MV.equal(curBallPos, trackball.lastBallPos)) {
                        trackball.rAxis = MV.cross(trackball.lastBallPos, curBallPos);
                        trackball.rAngle = MV.length(delta);
                    }
                    break;
                }
                case "pan": { // 在聚焦球切面上平移相机
                    const mouseDelta = MV.subtract(MV.vec2(x, y), trackball.lastPlanePos);
                    const delta = MV.scale(-trackball.speed / 8, mouseDelta);
                    trackball.tOffset = MV.add(MV.scale(delta[0], this.sideAxis), MV.scale(delta[1], this.up));
                    if (!this.focusObj) { // 非聚焦模式下圆心同步平移
                        this.focusBallCenter = MV.add(trackball.tOffset, this.focusBallCenter);
                    }
                    break;
                }
                case "zoom": { // 沿聚焦球直径平移相机
                    const mouseDelta = MV.subtract(MV.vec2(x, y), trackball.lastPlanePos);
                    const delta = MV.scale(trackball.speed, mouseDelta);
                    trackball.tOffset = MV.scale(delta[1], this.orientation);
                    break;
                }
            }
        }
        trackball.lastPlanePos = MV.vec2(x, y);
        trackball.lastBallPos = curBallPos;
    }
    wheelMotion(deltaY) {
        let speed = this.trackball.speed * deltaY / 10000;
        if (this.focusObj) {
            this.trackball.tOffset[2] = speed;
        }
        else {
            let direction = MV.normalize(MV.subtract(this.focusBallCenter, this.position));
            this.trackball.tOffset = MV.scale(-speed, direction);
        }
    }
}
Object.assign(Canvas.prototype, {
    bindCamera(fovy, focusObj, initialPos = MV.vec3(), initialUp = MV.vec3(0, 1, 0), updateSpeed = 25) {
        // 建立 Camera，并将 Camera 的更新逻辑推送至更新管道
        let perspective = MV.perspective(fovy, this.size[0] / this.size[1], 1, 2000);
        this.camera = new Camera(perspective, focusObj, initialPos, initialUp, updateSpeed);
        this.updatePipeline.push(c => {
            c.camera.updatePosition();
            for (let obj of c.objectsToDraw) {
                Object.assign(obj.uniforms, {
                    u_ViewMatrix: MV.flatten(c.camera.viewMatrix),
                    u_ProjectionMatrix: MV.flatten(c.camera.projectionMatrix)
                });
            }
        });
        // 将 Event 中的坐标映射至 clip space
        let clipXY = (event) => this.normVec2D([event.clientX, event.clientY]);
        let setMode = (event) => {
            switch (event.button) {
                case 0:
                    this.camera.trackball.mode = "rotate";
                    break;
                case 1:
                    this.camera.trackball.mode = "zoom";
                    break;
                case 2:
                    this.camera.trackball.mode = "pan";
                    break;
            }
        };
        // 绑定鼠标键盘监听
        this.canvas.addEventListener("mousedown", event => {
            setMode(event);
            this.camera.trackball.startRecord(...clipXY(event));
        });
        this.canvas.addEventListener("mouseup", event => {
            setMode(event);
            this.camera.trackball.stopRecord();
        });
        this.canvas.addEventListener("mousemove", event => {
            this.camera.mouseMotion(...clipXY(event));
        });
        this.canvas.addEventListener("wheel", event => {
            this.camera.wheelMotion(event.deltaY);
        });
    }
});
//# sourceMappingURL=camera.js.map