function clog(msg)
{
	var innerMsg = document.getElementById("logp").innerHTML;
	// Check if are the same to prevent rewriting the same
	if(innerMsg != msg) document.getElementById("logp").innerHTML = "> "+ msg;
}

function ptco(msg)
{
	console.log("%c%s", "padding: 0 5px 0 5px;color: rgb(68, 230, 68); background: black; font-size: 18px; font-weigth: bold;", msg);
	return true;
}


function getCursorCoords(e)
{
	var pos = getMousePos(canvas, e);
    var x = pos.x;
    var y = pos.y;
	if(x < 500 && y < 300)
												// Center the Axis in the base top
		cursor_pos = "Cursor Coordinates: X=" + (x - baseTop.x) + ", Y=" + (300-y-base.height);
}

window.addEventListener('mousemove',getCursorCoords , false);

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
