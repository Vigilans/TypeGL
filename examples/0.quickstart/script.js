function main() {
    let c = document.getElementById("canvas");
    c.width = 500;
    c.height = 300;
    let gl = c.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 0.8);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
