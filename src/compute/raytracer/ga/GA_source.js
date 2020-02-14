//
// Sectors, source handling
//
// (c) Lauri Savioja, 2016
//


"use strict";

function Sector(c) {
    this.center = new Vec2(c);
    this.leftStartingPoint = this.center;
    this.rightStartingPoint = this.center;

    this.leftDirection = new Vec2(-1, 0);
    this.leftLimit = new Vec2(this.center);
    this.leftLimit.add(this.leftDirection);

    this.rightDirection = new Vec2(-1, 0);
    this.rightLimit = new Vec2(this.center);
    this.rightLimit.add(this.rightDirection);

    this.leftAngle = -M_PI;
    this.rightAngle = M_PI;
    this.angle = M_2_PI;
}

Sector.prototype.computeAngles = function() {
    this.leftAngle = getLineOrientation(this.center, this.leftLimit);
    this.rightAngle = getLineOrientation(this.center, this.rightLimit);
    if (this.rightAngle < this.leftAngle) // Crossing from pi to -pi
        this.rightAngle += M_2_PI;
    this.angle = this.rightAngle - this.leftAngle;
};

Sector.prototype.computeDirectionsFromAngles = function() {
    this.leftDirection.setUnitVector(this.leftAngle);
    this.rightDirection.setUnitVector(this.rightAngle);
};

Sector.prototype.setLimits = function(l, r) {
    this.leftLimit.set(l);
    this.leftDirection.set(l);
    this.leftDirection.sub(this.center);

    this.rightLimit.set(r);
    this.rightDirection.set(r);
    this.rightDirection.sub(this.center);

    this.computeAngles();
};


Sector.prototype.computeLimitsFromAngles = function(p0, s1) {
    this.computeDirectionsFromAngles();

    var t;
    t = intersect(p0, s1, this.center, this.leftDirection);
    this.leftDirection.scale(t);
    this.leftLimit.set(this.leftDirection);
    this.leftLimit.add(this.center);

    t = intersect(p0, s1, this.center, this.rightDirection);
    this.rightDirection.scale(t);
    this.rightLimit.set(this.rightDirection);
    this.rightLimit.add(this.center);
};

var BEAM_EPS = 0.000001;

Sector.prototype.insideBeam = function(ang) {
    var i;
    ang -= M_2_PI;
    for (i=-1;i<2;i++) {
        if ((this.leftAngle <= (ang+BEAM_EPS)) && ((ang-BEAM_EPS) <= this.rightAngle)) {
//            console.log(toDeg(this.leftAngle) + " < " + toDeg(ang) + " < " + toDeg(this.rightAngle));
            return true;
        }
        ang += M_2_PI;
    }
    return false;
};

Sector.prototype.intersect = function(b, clip) {
    if (b.angle == M_2_PI) // Full circle - no need to do anything here!
        return;

    var crosses = false;
    if (this.insideBeam(b.leftAngle)) {
        if (clip)
            this.leftAngle = b.leftAngle;
        crosses = true;
    }
    if (this.insideBeam(b.rightAngle)) {
        if (clip)
            this.rightAngle = b.rightAngle;
        crosses = true;
    }

    if (!(crosses))
        if (!(b.insideBeam(this.leftAngle))) {  // No overlap, so no intersection
            this.rightAngle = 0;
            this.leftAngle = 0;
        }

    if (this.rightAngle < this.leftAngle)
        this.rightAngle += M_2_PI;
    this.angle = this.rightAngle - this.leftAngle;
};

Sector.prototype.match2PI = function(s) {
    if ((s.rightAngle - this.leftAngle > M_2_PI)) {
        this.leftAngle += M_2_PI;
        this.rightAngle += M_2_PI;
    }
    if ((this.rightAngle - s.leftAngle > M_2_PI)) {
        this.leftAngle -= M_2_PI;
        this.rightAngle -= M_2_PI;
    }
};


Sector.prototype.computeStartingPoints = function(p0, p1) {
    var dir = getDir(p0, p1);
    this.leftStartingPoint = intersectionPoint(this.center, this.leftDirection, p0, dir);
    this.rightStartingPoint = intersectionPoint(this.center, this.rightDirection, p0, dir);

};

Sector.prototype.substractLineSegment = function(p0, p1) {
    var occluder = new Sector(this.center);
    occluder.setLimits(p1, p0);
    // Make sure that left is on left and right is on right
    var n = getNormal(p0, p1);
    var d = getDir(this.center, p0);
    if (n.dot(d) > 0) {
//        occluder.debug("Swapping")
        occluder.setLimits(p0, p1);
    }

    occluder.match2PI(this);
    var lineDir = new Vec2(p1);
    lineDir.sub(p0);

    var segLine = getDir(this.leftStartingPoint, this.leftLimit);
    if (segmentsIntersect(this.leftStartingPoint, segLine, p0, lineDir, 1)) {
        this.leftAngle = occluder.rightAngle;
    }
    segLine = getDir(this.rightStartingPoint, this.rightLimit);
    if (segmentsIntersect(this.rightStartingPoint, segLine, p0, lineDir, 1)) {
        this.rightAngle = occluder.leftAngle;
    }
    if (this.rightAngle < this.leftAngle)
        this.angle = 0;
};

Sector.prototype.swapLimits = function() {
    var tmp = this.leftLimit;
    this.leftLimit = this.rightLimit;
    this.rightLimit = tmp;
};


Sector.prototype.debug = function(s) {
    console.log(s + " " + toDeg(this.leftAngle) + " - " + toDeg(this.rightAngle) + ". Angle: " + toDeg(this.angle));
    this.center.print("Center: ");
    this.leftStartingPoint.print("Left start: ");
    this.rightStartingPoint.print("Right start: ");
    this.leftLimit.print("Left limit: ");
    this.rightLimit.print("Right limit: ");
    this.leftDirection.print("Left direction: ");
    this.rightDirection.print("Right direction: ");
};


// Reflects a beam against line
Sector.prototype.reflectSector = function(dir, center) {
    var t;
    t = intersect(center,dir, this.center, this.rightDirection);
    this.leftLimit.set(this.rightDirection);
    this.leftLimit.scale(t);
    this.leftLimit.add(this.center);

    t = intersect(center,dir, this.center, this.leftDirection);
    this.rightLimit.set(this.leftDirection);
    this.rightLimit.scale(t);
    this.rightLimit.add(this.center);

    this.center = this.center.reflect(dir, center);

    this.computeAngles();
    this.computeDirectionsFromAngles();
};


GA.prototype.setBeam = function(src) {
    src.beam.setLimits(this.startVertices[src.reflector], this.endVertices[src.reflector]);
};


GA.prototype.newBeam = function(c, reflector) {
    var reflBeam = new Sector(c);
    reflBeam.setLimits(this.endVertices[reflector], this.startVertices[reflector]);
    return reflBeam;
};


//
// Source
//
function Source(src, order, parent, reflector, time) {
    this.loc = src;
    this.order = order;
    this.parent = parent;
    this.reflector = reflector;
    this.beam = new Sector(src);
    if (typeof time != 'undefined')
        this.startTime = time;
    else
        this.startTime = 0;
    this.children = [];
}

Source.prototype.debug = function(s) {
    console.log(s + ", source order: " + this.order);
    this.loc.print("Source at: ");
    var i;
    var tmp = this;
    for (i=this.order;i>0;i--) {
        console.log(" -> " + tmp.reflector);
        tmp = tmp.parent;
    }
};
