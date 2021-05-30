var image;
var form;
var spacing;
var slope;
var canvas;
var context;
var length = 0.5 * 160; 
var X0 = 50;
var Y0;
var dyP;
var altitude;
var azimuth;
var cosIncidenceAngle; 
var timer;

function setup(solarForm) {
	image = document.getElementById("pvArray");
	form = solarForm;
	spacing = length * parseFloat(form.elements["spacing"].value); 
	slope = form.elements["panelSlope"].value * Math.PI/180; 
	canvas = document.getElementById("topView");
	context = canvas.getContext("2d"); 
	canvas.style.backgroundColor = "lightgray"; 
	context.clearRect(0, 0, canvas.width, canvas.height); 
	context.fillStyle = "black";
	context.font = "1em Tahoma";
	context.fillText("(North)", 324, 20);
	if (slope < 0) { 
		Y0 = 0.5 * (canvas.height - spacing - length);
		dyP = + length * Math.cos(slope);
	}
	else {
		Y0 = 0.5 * (canvas.height - spacing + length);
		dyP = - length * Math.cos(slope);
	}
	drawOneArray(Y0); 
	drawOneArray(Y0 + spacing);
}

function drawOneArray(y0) {
	var scaleFac;
	var width;

	scaleFac = Math.cos(slope);
	width = image.width;
	context.scale(1.0, scaleFac);
	if (slope >= 0) {y0-= length * scaleFac;} 
	context.drawImage(image, 50, y0 / scaleFac); 
	context.scale(1.0, 1.0 / scaleFac);
	context.strokeStyle = "white";
	context.lineWidth = 3;
	context.beginPath();
	if (slope < 0) {y0 += length * scaleFac;} 
	context.moveTo(X0, y0);
	context.lineTo(X0 + width, y0);
	context.stroke();
}

function showBehavior() { 
	var degradation;
	var output;
	var direct;

	computeAngles();
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (altitude > 0) {
		canvas.style.backgroundColor = "lightgray";
		showOneShadow(X0, Y0);
		showOneShadow(X0, Y0 + spacing);
		drawOneArray(Y0);
		drawOneArray(Y0 + spacing);
		degradation = Math.pow(getObscuration(X0, Y0), 0.38);
		degradation += Math.pow(getObscuration(X0, Y0 + spacing), 0.38); 
		form.elements["azimuth"].value = Math.round(azimuth * 180/Math.PI); 
		form.elements["altitude"].value = Math.round(altitude * 180/Math.PI); 
		direct = 0.86 * cosIncidenceAngle * (1.0 - 0.5 * degradation);
		output = parseInt(100 * (direct + 0.14 * Math.sin(altitude))); 
	}
	else {
		canvas.style.backgroundColor = "midnightblue"; 
		form.elements["azimuth"].value = ""; 
		form.elements["altitude"].value = "";
		output = 0;
	}
	context.fillStyle = "black";
	context.font = "1em Tahoma";
	context.fillText("Electrical Output: " + output + " %", 10, 25); 
	context.fillText("(North)", 324, 20);
}

function computeAngles() {
	var latitude;
	var month;
	var hour;
	var solarDeclination; 
	var hourAngle; 
	var cosAzimuth;
	var sinAltitude;

	latitude = form.elements["latitude"].value * Math.PI/180; 
	month = form.elements["month"].value;
	hour = form.elements["hour"].value;
	solarDeclination = (-23.45 * Math.PI/180) * Math.cos(month * Math.PI/6);
	hourAngle = Math.abs((hour - 12) * Math.PI/12); 
	cosAzimuth = 0;
	sinAltitude = Math.cos(hourAngle) * Math.cos(latitude) * Math.cos(solarDeclination) + Math.sin(latitude) * Math.sin(solarDeclination);
	altitude = Math.asin(sinAltitude * 0.999999); 
	if (altitude > 0) {
		cosAzimuth = (Math.sin(solarDeclination) - sinAltitude * Math.sin(latitude)) / (Math.cos(altitude) * Math.cos(latitude));
		azimuth = Math.acos(cosAzimuth * 0.999999);
		azimuth = (hour <= 12) ? azimuth : 2 * Math.PI - azimuth; 
		cosIncidenceAngle = sinAltitude * Math.cos(slope) - cosAzimuth * Math.cos(altitude) * Math.sin(slope); 
		if (cosIncidenceAngle < 0) {
			cosIncidenceAngle = 0.0;
		}
	} 
}


function showOneShadow(x0, y0) {
  var xB;
  var yB;
  var xT;
  var yT;
  var clearance; 
  var totalHeight; 
  var botDxS;
  var botDyS;
  var topDxS;
  var topDyS;
  var width;

  clearance = length * parseFloat(form.elements["clearance"].value);
  totalHeight = clearance + length * Math.abs(Math.sin(slope));
  botDxS = - Math.sin(azimuth) * clearance / Math.tan(altitude); 
  botDyS = Math.cos(azimuth) * clearance / Math.tan(altitude); 
  topDxS = - Math.sin(azimuth) * totalHeight / Math.tan(altitude); 
  topDyS = Math.cos(azimuth) * totalHeight / Math.tan(altitude); 
  width = image.width;
  xB = x0 + botDxS;
  yB = y0 + botDyS;
  xT = x0 + topDxS;
  yT = y0 + dyP + topDyS;
  context.beginPath();
  context.moveTo(xB, yB);
  context.lineTo(xT, yT);
  context.lineTo(xT + width, yT);
  context.lineTo(xB + width, yB);
  context.fillStyle = "gray";
  context.fill();
} 

function getObscuration(x0, y0) {
	var latitude;
	var projLength;
	var width;
	var tanShadeAngle;
	var shadeLength;
	var offset;
	var obscuredWidth;
	var obscuration = 0;

	latitude = form.elements["latitude"].value * Math.PI/180;
	projLength = image.height * Math.cos(slope);
	width = image.width;
	context.globalAlpha = 0.4;
	context.fillStyle = "black";
  
  	if (cosIncidenceAngle <= 0) {
    	if (slope > 0) {y0 = y0 + 2 - projLength;}
    	context.fillRect(x0, y0 - 1, width, projLength);
	}

	else if (Math.cos(azimuth) * (y0 - 0.5 * canvas.height) > 0 && latitude * slope > 0) {
    	tanShadeAngle = Math.tan(altitude) / Math.cos(azimuth - Math.PI);
    	shadeLength = length - spacing / (Math.cos(slope) + Math.sin(slope) / tanShadeAngle);
    	if (shadeLength < 0) {shadeLength = 0;} // no obscuration
	    projLength = shadeLength * Math.cos(slope);
	    offset = Math.abs(Math.tan(azimuth) * (spacing + projLength - length * Math.cos(slope)));
    	if (slope > 0) {y0 += 1;}          // cover image bottom
    	else {projLength = - projLength;}
    	if (Math.sin(azimuth) < 0) {
     	context.fillRect(x0 + offset, y0, width - offset, - projLength);
     	}
    	else {
    		context.fillRect(x0, y0, width  - offset, - projLength);
    	}
    	obscuration = (shadeLength * (width - offset)) / (length * width);
    	if (obscuration < 0) {obscuration = 0;}
  	} // end else if
  	context.globalAlpha = 1.0;
  	return obscuration;
}

function runClock() {
	timer = window.setInterval(updateDisplay, 200); 
	form.elements["run"].disabled = "disabled"; 
	form.elements["stop"].disabled = "";
}

function updateDisplay() {  
	var mo;
	var hr;
	var nextHr;

	mo = parseInt(form.elements["month"].value); 
	hr = parseInt(form.elements["hour"].value); 
	nextHr = (hr + 1) % 24;
	if (nextHr < hr) {
		nextHr = 0;
		mo += 1;
	if (mo > 12) {
		stopClock(form);
		mo = 1; }
		form.elements["month"].value = mo; 
	}
	form.elements["hour"].value = nextHr;
	showBehavior(form); 
}

function stopClock() { 
	window.clearInterval(timer); 
	form.elements["stop"].disabled = "disabled"; 
	form.elements["run"].disabled = "";
} 