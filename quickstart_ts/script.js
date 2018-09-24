function main() {
    let c = document.getElementById("canvas");
    c.width = 500;
    c.height = 400;
    let gl = c.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
//# sourceMappingURL=script.js.map