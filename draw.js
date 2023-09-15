drawIKtarget = function()
{
	Px = IKtarget.x + baseTop.x;
	Py = (300-base.height) - IKtarget.y;
	
	ctx.strokeStyle = "#ff0202";
	ctx.beginPath();
	ctx.arc(Px, Py, 10, 0, 2*Math.PI);
	ctx.stroke();
		
	ctx.beginPath();
	ctx.arc(Px, Py, 5, 0, 2*Math.PI);
	ctx.stroke();	
}

drawInnerRange = function()
{
	var l1 = arm.width;
	var l2 = arm.width;
	var maxTheta2 = parseFloat(document.getElementById("angle2Range").max);
	
	var radious = CalcInnerRange(l1, l2, maxTheta2);
	
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#D3D3D3";	
	ctx.fillStyle = "#eeeeee";	
	ctx.beginPath();
	ctx.arc(baseTop.x, baseTop.y, radious, 0, 2*Math.PI, true);
	ctx.fill();
	ctx.stroke();
}

drawOuterRange = function()
{
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#D3D3D3";
	ctx.fillStyle = "#FFF";	
	ctx.beginPath();
	ctx.arc(baseTop.x, baseTop.y, arm.width*2, 0, 2*Math.PI, false);
	ctx.fill();
	ctx.stroke();
}

drawJoint = function(x,y){
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = "#999966";
	ctx.beginPath();
	ctx.arc(x, y, 10, 0, 2*Math.PI);
	ctx.stroke();
}

drawCoordinates = function(x, y) {
	ctx.fillStyle = "#000";
	ctx.font = "13px Arial";
	// Invert the Y axis and 
	ctx.fillText("End Effector Coordinates: X=" + (x - baseTop.x).toFixed(2) + ", Y=" + ((300-base.height) - y).toFixed(2), 5, 15);
}

drawCursorCoord = function()
{
	ctx.fillStyle = "#000";
	ctx.font = "13px Arial";
	ctx.fillText(cursor_pos, 5, 30);
}

drawVirtualExtension = function(length, x, y, theta)
{
	//ctx.setLineDash([5, 10]);
	var oldStrokeStyle = ctx.strokeStyle;
	ctx.strokeStyle = '#d3d3d3';
	ctx.lineWidth = 1;
	
	ctx.translate(x, y);
	ctx.rotate(theta*(Math.PI/180.0)*-1);
	
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(length,0);
	ctx.stroke();
	
	ctx.rotate(-(theta*(Math.PI/180.0))*-1);
	ctx.translate(-x, -y);
	//ctx.setLineDash([0, 0]);
	ctx.strokeStyle = oldStrokeStyle;
}

drawTheta1Arc = function(angle)
{
	ctx.beginPath();
	ctx.lineWidth = 1;
	//ctx.arc(baseTop.x, baseTop.y, (arm.width/2), 0, 0.2, true);
	ctx.arc(baseTop.x, baseTop.y ,40, 0, (360-angle)*Math.PI/180.0, true);
	ctx.stroke();
}

drawTheta2Arc = function(lengthFromEndPoint, endPointX, endPointY, angle, angle2)
{	// Ve = VirtualExtension
	var VeCenterX = endPointX + (lengthFromEndPoint)*Math.cos(Math.PI * angle / 180.0);
	var VeCenterY = endPointY + ((lengthFromEndPoint)*Math.sin(Math.PI * angle / 180.0))*(-1);
	
	ctx.beginPath();
	ctx.lineWidth = 1;

	if(angle > angle2)
	{
		ctx.arc(endPointX, endPointY , 40 , (angle*(Math.PI/180.0))*-1, (angle2*(Math.PI/180.0))*-1, false);
	}
	else
	{
		ctx.arc(endPointX, endPointY , 40 , (angle*(Math.PI/180.0))*-1, (angle2*(Math.PI/180.0))*-1, true);
	}
	ctx.stroke();
}

drawArm = function()
{
	var angle = parseFloat(document.getElementById("angle1Range").value); // in degrees
	var angle2 = parseFloat(document.getElementById("angle2Range").value);
	if(checkForNan(angle, angle2))
	{
		clog("One angle found to be NaN. Check again your angle values");
	}
	angle2 += angle;
	
	drawJoint(baseTop.x, baseTop.y); // Draw the joint circle at the base top
	
	// Calculate the angle of the first link and draw it
	lineArmDefines();
	ctx.beginPath();
	ctx.moveTo(baseTop.x, baseTop.y);
	var endPointX = baseTop.x + arm.width*Math.cos(Math.PI * angle / 180.0);
	var endPointY = baseTop.y + (arm.width*Math.sin(Math.PI * angle / 180.0))*(-1);
	ctx.lineTo(endPointX, endPointY);
	ctx.stroke();
	
	drawVirtualExtension(arm.width, endPointX, endPointY, angle);
	
	drawJoint(endPointX, endPointY); // Draw the second joint
	
	// Draw calculate the angle of the second link and draw it from the end point of the first link
	ctx.beginPath();
	lineArmDefines();
	var endPointX2 = endPointX + arm.width*Math.cos(Math.PI * (angle2) / 180.0);
	var endPointY2 = endPointY + (arm.width*Math.sin(Math.PI * (angle2) / 180.0))*(-1);
	ctx.moveTo(endPointX, endPointY);
	ctx.lineTo(endPointX2, endPointY2);
	ctx.stroke();
	
	drawTheta1Arc(angle);
	drawTheta2Arc((arm.width/2), endPointX, endPointY, angle, angle2);
	
	drawFKerror(angle, (angle2 - angle), endPointX2, endPointY2);
	
	drawCoordinates(endPointX2, endPointY2);
}

drawFKerror = function(theta1, theta2, endEffectorX, endEffectorY)
{
	// Convert endPoints to relative cords
	endEffectorX = endEffectorX - baseTop.x;
	endEffectorY = (300 - base.height) - endEffectorY; // invert y
	
	var pos = FK2DofPos(theta1, theta2); // Calculate the position
	var xError = (Math.abs(pos.x - endEffectorX)/Math.abs(endEffectorX))*100; // X Axis error
	var yError = (Math.abs(pos.y - endEffectorY)/Math.abs(endEffectorY))*100; // Y Axis error
	
	ctx.fillStyle = "#000";
	ctx.font = "13px Arial";
	ctx.fillText("(FK)End Effector Error: X=" + xError.toFixed(2) + "%,  Y=" + yError.toFixed(2) + "%" , 5, 45);
}

baseText = function()
{
	ctx.fillStyle = "#FFF";
	ctx.font = "15px Arial";
	ctx.fillText("Base", 200, 295);
}

drawBase = function()
{
	ctx.beginPath();
	ctx.fillStyle = "#0000CD";
	ctx.fillRect(base.x, base.y, base.width, base.height);
	ctx.fill();
	baseText();
}

drawFakeAxis = function()
{
	
	var oldStrokeStyle = ctx.strokeStyle;
	ctx.strokeStyle = '#d3d3d3';
	ctx.fillStyle = "#000";
	ctx.lineWidth = 1;
	
	ctx.fillText("+x", baseTop.x+200, baseTop.y + 15);
	ctx.fillText("+y", baseTop.x-20, baseTop.y-210);
	
	// Draw Y axis
	ctx.beginPath();
	ctx.moveTo(baseTop.x, baseTop.y);
	ctx.lineTo(baseTop.x, 0);
	ctx.stroke();
	// Draw X axis
	ctx.beginPath();
	ctx.moveTo(baseTop.x, baseTop.y);
	ctx.lineTo(baseTop.x+500, baseTop.y);
	ctx.stroke();
	
	
	ctx.strokeStyle = oldStrokeStyle;
}
