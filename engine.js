var ctx; // Context of canvas
var canvas;

var cursor_pos = "Cursor Coordinates: X=0, Y=0";

var clog_msg = ""; // For not updating html in every frame

var IKrun = false; // Run animation for IK

var IKtarget = {
	'x' : 0,
	'y' : 0,
	'theta1' : 0,
	'theta2' : 0,
	'theta1Previous' : 0,
	'theta2Previous' : 0,
	'theta1Cache': [],
	'theta2Cache': [],
	'theta1Done': false,
	'theta2Done': false,		
	'step' : 0.5	
}

var targetPos = {
	'x': 0,
	'y': 0,
	'theta1': 0,
	'theta2' : 0	
}

var targetAchived = true;

var base = {
	'x' : 180,
	'y' : 280,
	'width': 140,
	'height': 20
}

var baseTop = {
	'x': 250,
	'y': 280	
}

var arm = {
	'x': 0,
	'y': 0,
	'width': 100,
	'height': 3	
}

lineArmDefines = function()
{
	ctx.lineWidth = 5;
	ctx.strokeStyle = "#000";
	ctx.lineCap = "round";
	ctx.fillStyle = "#000";
}

render = function()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	ctx.fillStyle = "#eeeeee";
	ctx.fillRect(0,0,500,300);
	
	drawOuterRange();
	drawInnerRange();
	
	drawFakeAxis(); // Draw the Axis from the base top center
	drawBase();		// Draw the base object
	drawArm();
	drawCursorCoord();
	
	if(IKrun == true)
	{
		drawIKtarget();
		IKtarget.theta1Cache = TripleArrayPush(IKtarget.theta1Cache, IKtarget.theta1Previous);
		if((IKtarget.theta1Previous == IKtarget.theta1) || IKtarget.theta1Done)
		{
			IKtarget.theta1Done = true;
		}
		else if(IKtarget.theta1Previous > IKtarget.theta1)
		{
			updateRangeSpan("angle1Range", "angle1Range-out", IKtarget.theta1Previous -= IKtarget.step);
		}
		else if(IKtarget.theta1Previous < IKtarget.theta1)
		{
			updateRangeSpan("angle1Range", "angle1Range-out", IKtarget.theta1Previous += IKtarget.step);
		}
		else{}
		IKtarget.theta1Done = duplicateSearch(IKtarget.theta1Cache);

		
		IKtarget.theta2Cache = TripleArrayPush(IKtarget.theta2Cache, IKtarget.theta2Previous);
		if((IKtarget.theta2Previous == IKtarget.theta2) || IKtarget.theta2Done)
		{
			IKtarget.theta2Done = true;
		}
		else if(IKtarget.theta2Previous > IKtarget.theta2)
		{
			updateRangeSpan("angle2Range", "angle2Range-out", IKtarget.theta2Previous -= IKtarget.step);
		}
		else if(IKtarget.theta2Previous < IKtarget.theta2)
		{
			updateRangeSpan("angle2Range", "angle2Range-out", IKtarget.theta2Previous += IKtarget.step);
		}
		else{}
		IKtarget.theta2Done = duplicateSearch(IKtarget.theta2Cache);

		if(IKtarget.theta1Done && IKtarget.theta2Done)
		{
			IKrun = false;	
		}
	}
	else
	{
		EnDisDiv("myinput", false);	
	}

	// Request every frame
	requestAnimationFrame(render);
}

var requestAnimationFrame =  
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(callback) {
          return setTimeout(callback, 1);
        };

init = function()
{
	canvas = document.getElementById("arm");

	if(canvas.getContext == null)
	{
		alert("Canvas is not supported by your broswer!");
		return;
	}
	ctx = canvas.getContext("2d");
	render();
}


FK2DofPos = function(theta1, theta2)
{
	// Calculated Posisition
	theta1R = theta1 * (Math.PI/180.0); // Convert to Radians
	theta2R = theta2 * (Math.PI/180.0);
	Px = arm.width*Math.cos(theta1R) + arm.width*Math.cos(theta1R+theta2R);
	Py = arm.width*Math.sin(theta1R) + arm.width*Math.sin(theta1R + theta2R);
	return {
		'x' : Px,
		'y' : Py	
	}
}

IK2DofThetas = function(l1, l2, px, py)
{
	c2 = (    ( Math.pow(px, 2)+ Math.pow(py, 2) - (Math.pow(l1, 2)) - (Math.pow(l2,2)) ) /  (2*l1*l2)   );
	
	s2 = Math.sqrt(1 - (Math.pow(c2,2)));
	theta2 = Math.atan2(s2, c2);
	theta1 = Math.atan2( -(l2*s2*px) + py*(l1+l2*c2) , l2*s2*py + px*(l1+l2*c2));
	
	if(theta1*(180.0/Math.PI) < 0)
	{
		s2 = Math.sqrt(1 - (Math.pow(c2,2)))*(-1);
		theta2 = Math.atan2(s2, c2);
		theta1 = Math.atan2( -(l2*s2*px) + py*(l1+l2*c2) , l2*s2*py + px*(l1+l2*c2));
	}

	return {
		'theta1' : theta1*(180.0/Math.PI), /// Convert to degrees
		'theta2' : theta2*(180.0/Math.PI)	
	}
}

function RunIK()
{
	// Clear, if any, Cache
	IKtarget.theta1Cache = [];
	IKtarget.theta2Cache = [];
	// One shot function
	Px = parseFloat(document.getElementById("IKPx").value);
	Py = parseFloat(document.getElementById("IKPy").value);
	IKtarget.step = parseFloat(document.getElementById("stepSize").value);
	if(checkForNan(Px, Py, IKtarget.step))
	{
		clog("Not a number in Px or Py or Step size. Try again..");
		return;	
	}
	
	IKtarget.x = Px; IKtarget.y = Py; // Store requested position
	
	var pos = IK2DofThetas(arm.width, arm.width, Px, Py);
	if(checkForNan(pos.theta1, pos.theta2))
	{
		clog("It seems like the point you are trying to reach is out of range!");	
	}
	IKtarget.theta1 = parseFloat(pos.theta1);
	IKtarget.theta2 =  parseFloat(pos.theta2);
	IKtarget.theta1Previous = parseFloat(document.getElementById("angle1Range").value);
	IKtarget.theta2Previous = parseFloat(document.getElementById("angle2Range").value);
	EnDisDiv("myinput", true);	
	IKrun = true;
}

function checkForNan() // Variadic function for checking NaN
{
	for (var i = 0; i < arguments.length; i++) {
		if(isNaN(arguments[i])) return true;
	}
	return false;
}

function EnDisDiv(id, stat) // Enable or Disable all divs nodes, drop opacity and change background color
{
	var elm = document.getElementById(id);
	var nodes = document.getElementById(id).getElementsByTagName('*');
	for(var i = 0; i < nodes.length; i++)
	{
		 nodes[i].disabled = stat;
		 if(!stat) nodes[i].disabled = stat;
	}

	if(stat == true) // Disable element
	{
		elm.style.opacity = 0.6;
		elm.style.backgroundColor = "#939393";
	}
	else
	{
		elm.style.opacity = 1;
		elm.style.backgroundColor = "#FFF";
	}
}

rangeToSpan = function(val, target) {
	document.getElementById(target).innerHTML = parseFloat(val).toFixed(2);	
}


function updateRangeSpan(rangeId, spanId, val)
{
	document.getElementById(rangeId).value = val;
	rangeToSpan(val, spanId);	
}

function resetIK()
{
	IKrun = false;
	EnDisDiv("myinput", false);
}

function duplicateSearch(arr)
{
	var tmp = []; tmp = arr.slice(0);
	tmp.sort();
	var cnt = 0;
	for (var i = 0; i < tmp.length - 1; i++) {
		if (tmp[i + 1] == tmp[i]) {
			cnt += 1;
		}
	}
	if(cnt>=2) return true;
	return false;
}

function TripleArrayPush(array, itm)
{
	var local = [];
	local = array.slice(0);
	if(local.length > 3)
	{
		local.shift(); // Remove the first item
		local.push(itm); // Add one at the end
	}
	else
	{
		local.push(itm);
	}
	return local;
}

function CalcInnerRange(l1, l2, maxTheta2)
{
	maxTheta2 = maxTheta2 * (Math.PI/180.0); /// convert to Rads
	
	var h1 = l1 - (Math.cos(Math.PI-Math.abs(maxTheta2))*l2 );
	var w1 = Math.sin(Math.PI-Math.abs(maxTheta2))*l2;
	
	return Math.sqrt(Math.pow(h1,2)+Math.pow(w1, 2));
}






