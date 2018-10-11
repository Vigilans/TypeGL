var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function getLocation(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {
        x: (x - bbox.left) * (canvas.width / bbox.width),
        y: (y - bbox.top) * (canvas.height / bbox.height)
        
        /*
        x: (x - bbox.left),
        y: (y - bbox.top)
        */
    };
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
