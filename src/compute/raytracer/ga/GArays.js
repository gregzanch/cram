//
// Ray-tracing
//
// (c) Lauri Savioja, 2016
//

"use strict";

var emittedRayDuration = 60;
var reflectedRayDuration = 1250;

function Ray(src) {
    this.points = [];
    this.reflectors = [];
    this.directions = [];
    this.startTimes = [];
    this.durations = [];
    this.energies = [];
    this.shadowRays = [];
    this.order = 0;
    this.status = OK;
    this.escaped = false;
    this.source = src;
}

Ray.prototype.markAudibility = function(p0, p1, rec, radius) {
    if (typeof p1 == 'undefined')
        console.log("No p1");
    var audible = false;
    var dir = new Vec2(p1);
    dir.sub(p0);
    var norm = new Vec2(dir.y, -dir.x);
    norm.normalize();
    norm.scale(radius);
    if (segmentsIntersect(p0, dir, rec, norm, -1)) {
        this.status = AUDIBLE;
        audible = true;
    }
    norm.scale(-1);
    if (segmentsIntersect(p0, dir, rec, norm, -1)) {
        this.status = AUDIBLE;
        audible = true;
    }
    return audible;
};

function getClosestReflector(room, p0, s0, limit) {
    var i;
    var t;
    var t_min = 1E+20;
    if (typeof limit != 'undefined')
        t_min = limit;
    var reflector;

    for (i = 0; i < room.startVertices.length; i++) {
        t = intersect(room.startVertices[i], room.lineDirs[i], p0, s0);
        if ((t > EPS) && (t < t_min)) {
            var dir = new Vec2(s0);
            dir.scale(t*1.1);
            if (segmentsIntersect(room.startVertices[i], room.lineDirs[i], p0, dir, 1)) {
                t_min = t;
                reflector = i;
            }
        }
    }
    return {t_min: t_min, reflector: reflector};
}

Ray.prototype.reflectAgainstClosestIntersectionPoint = function(room) {
    var p0 = this.points[this.points.length - 1];
    var s0 = new Vec2(this.directions[this.points.length - 1]);
    var ip = getClosestReflector(room, p0, s0);
    var angle;
    if (typeof ip.reflector != 'undefined') {
        this.reflectors[this.order] = ip.reflector;
        s0.set(this.directions[this.points.length - 1]);
        s0.scale(ip.t_min);
        this.durations[this.order] = s0.timeOfFlight();
        this.startTimes.push(this.startTimes[this.order] + this.durations[this.order]);
        this.durations[this.order+1] = reflectedRayDuration;
        s0.add(p0);
        if (typeof s0 == 'undefined')
            console.log("Pieleen!");
        this.points.push(s0);
        if (room.simulationModes[ART] == 1) {
            room.registerARTenergies(this.source, this.reflectors[this.order], this.durations[this.order], s0, this.energies[0]);
        }
        var reflectedDir;
        if ((room.raySplitFactor > 0) || (Math.random() >= room.diffusionCoeffs[ip.reflector])) { // Specular reflection
            reflectedDir = p0.reflect(room.normals[ip.reflector], s0);
            reflectedDir.sub(s0);
            if (reflectedDir.len() == 0) {
                angle = ((Math.random() - 0.5) * M_PI) + room.surfaceNormalAngles[ip.reflector];
                reflectedDir = new Vec2(Math.cos(angle), Math.sin(angle));
            }
        } else {  // Diffuse reflection
            angle = ((Math.random()-0.5) * M_PI) + room.surfaceNormalAngles[ip.reflector];
            reflectedDir = new Vec2(Math.cos(angle), Math.sin(angle));
        }
        this.directions.push(reflectedDir);
        if ((room.simulationModes[CREATE_RAYS] == 1) && (room.simulationModes[MAKE_IS] == 1))
            this.source = room.sources[1];    // Hack!To show ray extension to an image source in reflectionModels!
        this.order++;
        if (room.raySplitFactor > 0) {
            var availableEnergy = this.energies[this.order-1] * (1-room.absorptionCoeffs[ip.reflector]);
            var diffusedEnergy = availableEnergy * room.diffusionCoeffs[ip.reflector];
            var reflectedEnergy = availableEnergy - diffusedEnergy;
            this.energies[this.order] = reflectedEnergy;
            room.createRays(room.raySplitFactor, ip.reflector, s0, this.startTimes[this.startTimes.length - 1], DIFFUSE_SPLIT_RAY, diffusedEnergy / (room.raySplitFactor),
                room.surfaceNormalAngles[ip.reflector] - M_PI_2, room.surfaceNormalAngles[ip.reflector] + M_PI_2);
        } else
            this.energies[this.order] = this.energies[this.order-1] * (1-room.absorptionCoeffs[ip.reflector]);
    } else {
        console.log("Ray escaped: " + this.id + " at order " + this.reflectors.length);
        this.escaped = true;
    }
};

Ray.prototype.getPressure = function(order, absCoeffs) {
    var i;
    var val = this.energies[0];
    for (i=1;i<=order;i++)
        val = val * Math.sqrt(1-absCoeffs[this.reflectors[i]])
    return val;
};

Ray.prototype.getEnergy = function(order, absCoeffs) {
    var i;
    var val = this.energies[0];
    for (i=1;i<=order;i++)
        val = val * (1-absCoeffs[this.reflectors[i]])
    return val;
};

Ray.prototype.debug = function() {
    var i;
    console.log("ID: " + this.id + ". Order: " + this.order + ". Status: " + this.status);
    for (i=0;i<=this.order;i++) {
        this.points[i].print("Point: ");
        this.directions[i].print("Direction: ");
        console.log("Reflector: " + this.reflectors[i]);
    }
};

GA.prototype.checkAudibilities = function() {
    var i, j, maxOrder;
    var r;
    var rec = this.receivers[0];

    rec.reset();

    for (i=0;i<this.rayPaths.length;i++) {
        r = this.rayPaths[i];
        r.status = OK;

        maxOrder = Math.min(this.rayVisualizationOrder, r.points.length-1);
        if (r.escaped)
            maxOrder--;
        for (j=0;j<=maxOrder;j++) {
            if ((this.receiverRadius > 0) && (r.directions[j].len() > 1e-5)) {
                if (r.markAudibility(r.points[j], r.points[j + 1], rec.loc, this.receiverRadius)) {
                    var t = r.points[j].timeOfFlight(rec.loc);
                    t += r.startTimes[j];
                    rec.registerPath(t, i, j, AUDIBLE);
                }
            }
        }
    }
};

GA.prototype.reflectRays = function(initOrder) {
    var i, j;
    var r;
    for (j=0; j<this.rayPaths.length;j++) {
        r = this.rayPaths[j];
        for(i=initOrder;i<this.maxOrder;i++) if (!r.escaped) {
            r.reflectAgainstClosestIntersectionPoint(this);
        }
    }
};

GA.prototype.resetRays = function() {
    var i;
    this.rayPaths.splice(this.nofRays,this.rayPaths.length-this.nofRays);
    for (i=0; i<this.rayPaths.length;i++) {
        this.rayPaths[i].points.splice(1,this.rayPaths[i].points.length-1);
        this.rayPaths[i].startTimes.splice(1,this.rayPaths[i].startTimes.length-1);
        this.rayPaths[i].directions.splice(1,this.rayPaths[i].directions.length-1);
        this.rayPaths[i].durations.splice(1,this.rayPaths[i].durations.length-1);
        this.rayPaths[i].energies.splice(1,this.rayPaths[i].energies.length-1);
        this.rayPaths[i].order = 0;
    }
};

GA.prototype.createShadowRays = function() {
    var i, j, r;
    var rec=this.receivers[0];
    var recDiameter = this.receiverRadius*2;
    var maxOrder;

    for (i=0;i<this.rayPaths.length; i++) {
        r = this.rayPaths[i];
        maxOrder = Math.min(r.points.length, this.rayVisualizationOrder);
        if (r.escaped)
            maxOrder--;
        for (j=1; j<=maxOrder; j++) {
            var p0 = r.points[j];
            if (typeof p0 == 'undefined')
                console.log("Error!");
            var dir = getDir(p0, this.receivers[0].loc);
            var t = dir.timeOfFlight();
            dir.normalize();
            var ip=getClosestReflector(this, p0, dir, t);
            if (typeof ip.reflector == 'undefined') { // No occlusion, i.e. makes a valid path
                var shadowRay = new Ray(this.sources[0].loc);
                var energy = r.energies[j - 1] * (1 - this.absorptionCoeffs[r.reflectors[j-1]]) * (this.diffusionCoeffs[r.reflectors[j-1]]);
                energy = energy * (recDiameter / (M_PI * t));// Divide the energy evenly over a hemi-circle and take the fraction covered by the receiver (approx.)
                if (energy > 0) {
                    shadowRay.type = DIFFUSE_SHADOW_RAY;
                    shadowRay.status = AUDIBLE;
                    shadowRay.startTimes[0] = r.startTimes[j];
                    shadowRay.energies[0] = energy;
                    shadowRay.points[0] = p0;
                    shadowRay.points[1] = this.receivers[0].loc;
                    shadowRay.directions[0] = dir;
                    shadowRay.durations[0] = t;
                    r.shadowRays[j] = shadowRay;
                    rec.registerPath(shadowRay.startTimes[0]+t, i, j, DIFFUSE_SHADOW_RAY);
                }
            }
        }
    }
};

GA.prototype.clearShadowRays = function() {
    var i, j, r;
    for (i=0;i<this.rayPaths.length; i++) {
        r = this.rayPaths[i];
        for (j=1; j< r.points.length; j++) {
            r.shadowRays[j] = null;
        }
    }
};

GA.prototype.createRays = function(nofRays, src, srcLoc, emissionTime, rayType, energyPerRay, minAngle, maxAngle) {
    var i;
    var angle;
    var totalAngle = maxAngle - minAngle;
    var r;
    if (totalAngle<M_2_PI) {
        var offset = totalAngle / (nofRays + 1);
        minAngle += offset;
        totalAngle -= offset;
    }
    for (i=0; i<nofRays;i++) {
        r = new Ray(src);
        this.rayPaths.push(r);
        r.points[0] = srcLoc;
        r.startTimes[0] = emissionTime;
        r.type = rayType;
        if (rayType == CAST_RAY) {
            r.durations[0] = emittedRayDuration;
            r.id = "Cast:" + i.toString();
            r.order = 0;
        } else {
            r.durations[0] = reflectedRayDuration;
            r.id = "Split:" + i.toString();
            r.order = 1;  // HACK, wrong if higher order reflections, but those are not good in any case :-)
        }
        r.energies[0] = energyPerRay;
        if ((this.rayDistribution == RANDOM) || (rayType == DIFFUSE_SPLIT_RAY))
            angle = (Math.random() * totalAngle) + minAngle;
        else {
            angle = ((i / nofRays) * totalAngle) + minAngle;
            if (this.rayDistribution == JITTERED)
                angle = angle + (Math.random()-0.5) * (totalAngle / nofRays  ) / 2;
        }
        r.directions[0] = new Vec2(Math.cos(angle), Math.sin(angle));
        r.status = OK;
    }
};

GA.prototype.validateRays = function() {
    var i, j, r;
    for (i=0; i<this.rayPaths.length; i++) {
        r=this.rayPaths[i];
        if ((r.points.length-1) != r.reflectors.length)
            console.log("Too few/many points, ray=",i);
        for (j=0;j<(r.startTimes.length-1);j++)
            if (typeof r.reflectors[j] == 'undefined')
                console.log("No reflector!");
        if (r.reflectors.length == 0)
            console.log("No reflector at all: ", i);
    }
};

GA.prototype.toggleShowRayReflection = function() {
    if (this.rayVisualizationOrder == -1)
       this.rayVisualizationOrder = 1;
    else
        this.rayVisualizationOrder = -1;
    //   this.showOrders[1] = 1;
    this.drawAll();
};