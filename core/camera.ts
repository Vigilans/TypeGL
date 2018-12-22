import { Canvas } from "./canvas.js"
import * as MV from "./MV.js"
import { WebGLRenderingObject } from "./webgl-object.js";

// 将 (x, y) 由 [-1, 1] × [-1, 1] 平面映射至单位半球面
export function trackballView(x: number, y: number) {
    let v = MV.vec2(x, y);
    let n = MV.l2_norm(v);
    if (n <= 1.0) {
        return MV.vec3(v, Math.sqrt(1.0 - n));
    } else {
        return MV.vec3(MV.normalize(v), 0.0);
    }
}

// 只记录瞬时更新信息，长时累积效应通过Camera类保存。
export class Trackball {

    public mode: "rotate" | "zoom" | "pan" = "rotate";
    
    // 状态变量
    public trackingMouse: boolean     = false; // 记录是否开始更新变量
    public lastPlanePos : MV.Vector2D = MV.vec2(); // 上一时刻平面位置
    public lastBallPos  : MV.Vector3D = MV.vec3(); // 上一时刻跟踪球位置

    // 更新变量
    public rAxis  : MV.Vector3D   = [0, 0, 1];
    public rAngle : number        = 0.0;
    public tOffset: MV.Vector3D   = MV.vec3();

    public constructor(
        public speed = 50, 
        public focusType: "object" | "void" = "void",
        public reserveAfterStop = false
    ) { }

    public reset() {
        this.rAngle = 0.0;
        this.rAxis = [0, 0, 1]
        this.tOffset = MV.vec3();
    }

    public startRecord(x?: number, y?: number) {
        this.trackingMouse = true;
        if (x && y) {
            this.lastBallPos = trackballView(x, y);
        }
    }

    public stopRecord() {
        this.trackingMouse = false;
        if (!this.reserveAfterStop) {
            this.reset();
        }
    }
}

// 保存由Trackball积累下来的效应
export class Camera {
    
    // Camera所绑定的跟踪球
    public trackball: Trackball;

    // Trackball所积累的变换矩阵
    public transMatrix: MV.Matrix = MV.mat4();

    // 非聚焦模式下镜头所对准的聚焦球球心
    public focusBallCenter?: MV.Vector3D;

    // 聚焦球的半径
    public focusBallRadius?: number;
    
    public constructor(
        public perspective: MV.Matrix, // 视角矩阵
        public focusObj?: WebGLRenderingObject, // focusObj: 当前聚焦的对象，决定了摄像机的聚焦模式
        public position: MV.Vector3D = [0, 0, 1], // Camera所处的位置，是Trackball的积累效应
        public up: MV.Vector3D = [0, 1, 0], // Camera的上头位置
        updateSpeed = 50
    ) {
        this.trackball = new Trackball(updateSpeed);
        if (!focusObj) {
            this.focusBallCenter = MV.vec3();
            if (this.position) {
                this.focusBallRadius = MV.length(MV.subtract(this.position, this.focusBallCenter));
            } else {
                this.focusBallRadius = 2;
                this.position = MV.add(this.focusBallCenter, MV.vec3(0, 0, 2)) as MV.Vector3D;
            }
        }
    }

    public get center() {
        return this.focusObj ? this.focusObj.center : this.focusBallCenter;
    }

    public get orientation() {
        return MV.normalize(MV.subtract(this.center, this.position));
    }

    public get sideAxis() {
        return MV.normalize(MV.cross(this.orientation, this.up));
    }

    public get viewMatrix() {
        const lookAt = MV.lookAt(this.position, this.center, this.up);
        return lookAt;
    }

    public get projectionMatrix() {
        return this.perspective;
    }

    // 更新 Camera 的所处位置，为了防溢出操碎了心……
    public updatePosition() {
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

    public mouseMotion(x: number, y: number) {
        let curBallPos = trackballView(x, y);
        let trackball = this.trackball
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
                    trackball.tOffset = MV.add(
                        MV.scale(delta[0], this.sideAxis),
                        MV.scale(delta[1], this.up)
                    );
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

    public wheelMotion(deltaY: number) {
        let speed = this.trackball.speed * deltaY / 10000;
        if (this.focusObj) {
            this.trackball.tOffset[2] = speed;
        } else {
            let direction = MV.normalize(MV.subtract(this.focusBallCenter, this.position));
            this.trackball.tOffset = MV.scale(-speed, direction) as MV.Vector3D;
        }
    }
}

declare module "./canvas.js" {
    interface Canvas {
        camera?: Camera; // 调用 bindTackball 后，该成员将被设置。
        bindCamera(fovy: number, focusObj?: WebGLRenderingObject, initialPos?: MV.Vector3D, updateSpeed?: number): void;
    }
}

Object.assign(Canvas.prototype, {

    bindCamera(this: Canvas, fovy: number, focusObj?: WebGLRenderingObject, initialPos = MV.vec3(), initialUp = MV.vec3(0, 1, 0), updateSpeed = 25) {
        // 建立 Camera，并将 Camera 的更新逻辑推送至更新管道
        let perspective = MV.perspective(fovy, this.size[0] / this.size[1], 1, 2000);
        this.camera = new Camera(perspective, focusObj, initialPos, initialUp, updateSpeed);
        this.updatePipeline.push(c => { 
            c.camera.updatePosition();
            for (let obj of c.objectsToDraw) {
                Object.assign(obj.uniforms, {
                    u_ViewMatrix: MV.flatten(c.camera.viewMatrix),
                    u_ProjectionMatrix: MV.flatten(c.camera.projectionMatrix)
                })
            }
        });
        
        // 将 Event 中的坐标映射至 clip space
        let clipXY = (event: MouseEvent) => this.normVec2D([event.clientX, event.clientY]);
        let setMode = (event: MouseEvent) => {
            switch (event.button) {
                case 0: this.camera.trackball.mode = "rotate"; break;
                case 1: this.camera.trackball.mode = "zoom"; break;
                case 2: this.camera.trackball.mode = "pan"; break;
            }
        }

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
