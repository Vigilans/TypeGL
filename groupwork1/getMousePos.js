var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function getLocation(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {
        x: (x - bbox.left) * (canvas.width / bbox.width),
        y: (y - bbox.top) * (canvas.height / bbox.height)
        
        /*
         * 此处不用下面两行是为了防止使用CSS和JS改变了canvas的高宽之后是表面积拉大而实际
         * 显示像素不变而造成的坐标获取不准的情况
        x: (x - bbox.left),
        y: (y - bbox.top)
        */
    };
}
function drawHorizontalLine(y) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.closePath();
}
function drawVerticalLine(x) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
    ctx.closePath();
}
canvas.onmousemove = function (e) {
    var location = getLocation(e.clientX, e.clientY);
    var message = document.getElementById("message");
    message.innerHTML = "x=" + location.x + " ,y=" + location.y;
    /*ctx.clearRect(location.x-1,location.y-1,location.x+1,location.y+1);
    ctx.beginPath();
    ctx.arc(location.x,location.y,1,0,2*Math.PI);
    ctx.stroke();*/
};