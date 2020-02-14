//
// User interface
//
// (c) Lauri Savioja, 2016
//

"use strict";


GA.prototype.resetClipping = function() {
    var ctx = document.getElementById(this.id).getContext('2d');
    ctx.restore();
    this.saved = 0;
};


GA.prototype.zoomOutButtonPressedEvent = function() {
    this.scaler *=  0.9;
    if (this.showOutside == 0)
        this.resetClipping();
    this.drawAll();
};

GA.prototype.zoomInButtonPressedEvent = function() {
    this.scaler *=  1.1;
    if (this.showOutside == 0)
        this.resetClipping();
    this.drawAll();
};

function mouseWheel(ev, room) {
    if (ev.shiftKey) { // let us zoom
        if (ev.wheelDelta < 0)
            room.scaler *= 0.9;
        else
            room.scaler *= 1.1;
        room.drawAll();
    }
}

var mouseDownFlag = false;
var mouseCoords = new Vec2(0,0);
var pointToTrack;
var sourceMoves = false;
var geometryChanges = false;

function updateMouseCoords(ev, room)  {
    var rect = document.getElementById(room.id).getBoundingClientRect();
    var x = ev.clientX - rect.left;
    var y = ev.clientY - rect.top;
    mouseCoords.set(room.scaleXinv(x), room.scaleYinv(y));
//        coor = "Coordinates: (" + x + "," + y + ")";
//        console.log(coor);

}

function mouseMoved(ev, room) {
    if (mouseDownFlag) {
        if (typeof room == 'undefined')
            return;
        if (ev.currentTarget.id != room.id)
            return;
        updateMouseCoords(ev, room);
        pointToTrack.set(mouseCoords.x, mouseCoords.y);
        if (geometryChanges) {
            room.updateGeometry();
            room.computeAll();
        }
        if (room.simulationModes[MAKE_IS_PATHS] == 1) {
            if (sourceMoves)
                room.computeAll();
            room.constructAllISRayPaths();
        }
        if (room.simulationModes[CREATE_RAYS] == 1) {
            if (sourceMoves)
                room.computeAll();
            room.checkAudibilities();
            room.updateShadowRays();
        }
        if (room.animation)
            room.animation.reset();
        room.drawAll();
    }
}

function mouseDown(ev, room) {
    if (ev.button == 2) { // The right button
        room.currentOrderColormap = (room.currentOrderColormap+1) % (room.orderColors.length);
        room.drawAll();
        return;
    }
    mouseDownFlag = true;
    if (room.coverFig == 1) {
        room.showOutside = 1 - room.showOutside;
        room.drawAll();
        return;
    }
    updateMouseCoords(ev, room);
    var srcDist = mouseCoords.distance(room.sources[0].loc);
    var rcvDist = mouseCoords.distance(room.receivers[0].loc);
    if ((srcDist<rcvDist) && (room.sourceCanMove)) {
        sourceMoves = true;
        pointToTrack = room.sources[0].loc;
    } else {
        sourceMoves = false;
        pointToTrack = room.receivers[0].loc;
    }
    var minDist = Math.min(srcDist, rcvDist);
    var dist;
    var i;
    if (room.geometryCanChange)
        for (i=0;i<room.startVertices.length;i++) {
            dist = mouseCoords.distance(room.startVertices[i]);
            if (dist < minDist) {
                minDist = dist;
                pointToTrack = room.startVertices[i];
                geometryChanges = true;
                sourceMoves = true;
                activeSurface = i;
            }
            dist = mouseCoords.distance(room.endVertices[i]);
            if (dist < minDist) {
                minDist = dist;
                pointToTrack = room.endVertices[i];
                geometryChanges = true;
                sourceMoves = true;
                activeSurface = Math.max(0, i + 1);
            }
    }
}

function coverMouseMoved(ev, room) {
        var rect = document.getElementById(room.id).getBoundingClientRect();
        var x = ev.clientX - rect.left;
        room.timeSlider = x / rect.width;
        room.drawAll();
}

// function mouseUp(ev, room)
function mouseUp() { mouseDownFlag = false; geometryChanges = false; sourceMoves = false; }

//
// The code below copied from http://blog.movalog.com/a/javascript-toggle-visibility/
//
function toggle_visibility(divId, button, v1, v2) {
    var e = document.getElementById(divId);
    if(e.style.display == 'block') {
        e.style.display = 'none';
        if (typeof v1 != 'undefined')
            button.value = v1;
    } else {
        e.style.display = 'block';
        if (typeof v2 != 'undefined')
            button.value = v2;
    }
}

GA.prototype.prevPatch = function() {
    activeSurface = (activeSurface + this.absorptionCoeffs.length - 1) % this.absorptionCoeffs.length;
    this.drawAll();
};

GA.prototype.nextPatch = function() {
    activeSurface = (activeSurface + 1) % this.absorptionCoeffs.length;
    this.drawAll();
};