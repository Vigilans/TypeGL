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
        public position?: MV.Vector3D, // Camera所处的位置，是Trackball的积累效应
        updateSpeed = 50
    ) {
        this.trackball = new Trackball(updateSpeed);
        if (!focusObj) {
            this.focusBallCenter = MV.vec3();
            if (this.position) {
                this.focusBallRadius = MV.length(MV.subtract(this.position, this.focusBallCenter));
            } else {
                this.focusBallRadius = 2;
                this.position = MV.add(this.focusBallCenter, MV.vec3(0, 1, 2)) as MV.Vector3D;
            }
        }
    }

    public get worldMatrix() {
        if (this.focusObj) {
            let lookAt = MV.lookAt(this.position, this.focusObj.center);
            return MV.mult(this.perspective, lookAt);
        } else { // 不聚焦某个对象
            let lookAt = MV.lookAt(this.position, this.focusBallCenter);
            return MV.mult(this.perspective, lookAt);
        }
    }

    // 更新 Camera 的所处位置
    public updatePosition() {
        const T = MV.translate(...this.trackball.tOffset);
        if (this.focusObj) {
            this.position = MV.transformPoint(T, this.position);
        } else {
            const TR = MV.translate(...this.focusBallCenter);
            const R = MV.rotate(this.trackball.rAngle, this.trackball.rAxis);
            const TR_ = MV.translate(...MV.negate(this.focusBallCenter));
            this.position = MV.transformPoint(MV.mult(T, TR, R, TR_), this.position);
        }
        this.trackball.reset();
    }

    public mouseMotion(x: number, y: number) {
        let curBallPos = trackballView(x, y);
        let trackball = this.trackball
        if (trackball.trackingMouse) {
            if (this.focusObj) {
                // 聚焦模式
                switch (trackball.mode) {
                    case "rotate": case "pan": { // 旋转
                        let delta = MV.subtract(MV.vec2(x, y), trackball.lastPlanePos);
                        trackball.tOffset[0] = trackball.speed * delta[0] / 2;
                        trackball.tOffset[1] = trackball.speed * delta[1] / 2;
                        break;
                    }
                    case "zoom": { // 缩放
                        trackball.tOffset[2] = trackball.speed * (y - trackball.lastPlanePos[1]);
                        break;
                    }
                }
            } else {
                // 非聚焦模式
                switch (trackball.mode) {
                    case "rotate": { // 旋转
                        let delta = MV.subtract(curBallPos, trackball.lastBallPos);
                        trackball.rAngle = trackball.speed * MV.length(delta) / 3;
                        if (!MV.equal(curBallPos, trackball.lastBallPos)) {
                            trackball.rAxis = MV.cross(curBallPos, trackball.lastBallPos);
                        }
                        break;
                    }
                    case "pan": { // 拖动
                        let delta = MV.subtract(MV.vec2(x, y), trackball.lastPlanePos);
                        trackball.tOffset[0] = -trackball.speed * delta[0] / 3;
                        trackball.tOffset[1] = -trackball.speed * delta[1] / 3;
                        this.focusBallCenter = MV.transformPoint(
                            MV.translate(trackball.tOffset[0], trackball.tOffset[1], 0),
                            this.focusBallCenter
                        );
                        break;
                    }
                    case "zoom": { // 缩放
                        let delta = MV.subtract(MV.vec2(x, y), trackball.lastPlanePos);
                        let direction = MV.normalize(MV.subtract(this.focusBallCenter, this.position));
                        trackball.tOffset = MV.scale(trackball.speed * delta[1], direction) as MV.Vector3D;
                        break;
                    }
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

    bindCamera(this: Canvas, fovy: number, focusObj?: WebGLRenderingObject, initialPos = MV.vec3(), updateSpeed = 25) {
        // 建立 Camera，并将 Camera 的更新逻辑推送至更新管道
        let perspective = MV.perspective(fovy, this.size[0] / this.size[1], 1, 2000);
        this.camera = new Camera(perspective, focusObj, initialPos, updateSpeed);
        this.updatePipeline.push(c => { 
            c.camera.updatePosition();
            for (let obj of c.objectsToDraw) {
                obj.uniforms.u_WorldMatrix = MV.flatten(c.camera.worldMatrix);
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
        this.canvas.addEventListener("keydown", event => {
            switch (event.key) {
                case 'z': this.camera.trackball.mode = "rotate"; break;
                case 'x': this.camera.trackball.mode = "zoom"; break;
                case 'c': this.camera.trackball.mode = "pan"; break;
                default: return; // 直接短路
            }
            this.camera.trackball.startRecord();
        });
        this.canvas.addEventListener("keyup", event => {
            switch (event.key) {
                case 'z': case 'x': case 'c': {
                    this.camera.trackball.stopRecord();
                }
            }
        });
    }
});
