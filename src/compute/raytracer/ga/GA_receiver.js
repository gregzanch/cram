//
// Real life parameter mapping and receiver handling
//
// (c) Lauri Savioja, 2016
//


"use strict";

//
// Global parameters to map from internal to real world values
//

function RealLifeParams() {
    this.spatialScaler = 0.1;    // 1 internal distance unit corresponds to 0.1m = 10cm in real world
    this.speedOfSound = 0.343;  // m / ms
}

RealLifeParams.prototype.tuneSpatialScaler = function(g) {
//    console.log("g = ",g );
    this.spatialScaler = g / 400;
};

RealLifeParams.prototype.internalDistToRealDist = function(t) {
    return t*this.spatialScaler;  // Converts the distance to meters
};

RealLifeParams.prototype.distToTime = function(d) {
    return d / this.speedOfSound;  // Converts the distance in meters to propagation delay in ms
};

RealLifeParams.prototype.internalDistToRealTime = function(d) {
    return this.distToTime(this.internalDistToRealDist(d));
};

RealLifeParams.prototype.realTimeToRealDist = function(t) {
    return t * this.speedOfSound;
};

RealLifeParams.prototype.realDistToInternalDist = function(d) {
    return d / this.spatialScaler;
};

RealLifeParams.prototype.realTimeToInternalTime = function(t) {
    return  this.realDistToInternalDist(this.realTimeToRealDist(t));
};

//
//  Receiver that contains a list of registered path events, and can convert that to an IR.
//
Receiver.prototype.registerPath = function(t, id, reflOrder, type) {
    this.registeredPaths.push({time: t, rayID: id, order: reflOrder, type: type});
};

Receiver.prototype.reset = function() {
    this.registeredPaths = [];
    this.IR = null;
};

//
// Makes accumulation and returns the internal time of the latest event
//

Receiver.prototype.accumulateIRfromPaths = function(fs, rl, showOrders, attenuation, rayPaths) {
    this.IR = new SampledResponse(fs, 10);  // Initial length of 10ms
    var i;
    var p, val, r;
    for (i=0;i<this.registeredPaths.length;i++) {
        p = this.registeredPaths[i];
        if (p.type == DIFFUSE_SHADOW_RAY)
            r = rayPaths[p.rayID].shadowRays[p.order];
        else
            r = rayPaths[p.rayID];
        if (showOrders[p.order] == 1) {
            var dist = rl.internalDistToRealDist(p.time);
            if (attenuation[MATERIAL_ABSORPTION] == 1) {
                if (p.type == DIFFUSE_SHADOW_RAY)
                    val = r.energies[0];
                else
                    val = r.energies[p.order];
            } else
                val = 1;
            if (attenuation[DISTANCE] == 1)
                val = (100*val/(dist+100));
            if (attenuation[AIR_ABSORPTION] == 1) {
                var lowpassCutoff = search3dBpointNTP(dist, this.humidity, this.temperature);
                var aafilt = makeAAFilter(dist, 32);
                this.IR.addArray(this.IR.timeToSample(rl.distToTime(dist)), aafilt, val);
            } else
                this.IR.add(rl.distToTime(dist), val);
        }
    }
};

GA.prototype.constructIRResponse = function() {
    var i, j, r;
    for (i=0;i<this.rayPaths.length;i++) {
        r = this.rayPaths[i];
        for (j = 1; j < r.reflectors.length; j++)
            r.energies[j] = r.energies[j - 1] * Math.sqrt(1 - this.absorptionCoeffs[r.reflectors[j]]);
    }
    this.receivers[0].accumulateIRfromPaths(this.fs, this.rlParams, this.showOrders, this.attenuation, this.rayPaths);
};

GA.prototype.constructETCResponseFromRays = function() {
    var i, j, r;
    for (i=0;i<this.rayPaths.length;i++) {
        r = this.rayPaths[i];
        for (j = 1; j < r.reflectors.length; j++)
            r.energies[j] = r.energies[j - 1] * (1 - this.absorptionCoeffs[r.reflectors[j]]);
    }
    var showOrders = [];
    for(i=0; i<this.maxOrder; i++)
        showOrders[i] = 1;
    this.receivers[0].accumulateIRfromPaths(this.fs, this.rlParams, showOrders, this.attenuation, this.rayPaths)
    this.receivers[0].ETC = this.receivers[0].IR;
};

GA.prototype.constructETCResponseFromART = function() {
    var ETC = new SampledResponse(this.fs, 100);  // Initial length of 100ms

    var emittingSurfID;
    var recLoc = this.receivers[0].loc;
    var unitDelay = this.rlParams.internalDistToRealTime(1);

    var angleIdx, idx;
    var emission, propagationDelay, currentDelay, directDelay;

    for (emittingSurfID=0; emittingSurfID<this.centers.length; emittingSurfID++) {
        angleIdx = this.BRDFs[emittingSurfID].getAngleIndex(this.centers[emittingSurfID], this.lineDirs[emittingSurfID], recLoc);
        if (angleIdx<this.ARTenergy[emittingSurfID].responseToDirection.length) {  // Needs to be facing the receiver
            emission = this.ARTenergy[emittingSurfID].responseToDirection[angleIdx];
            propagationDelay = this.centers[emittingSurfID].timeOfFlight(recLoc);
            propagationDelay = this.rlParams.internalDistToRealTime(propagationDelay);
            currentDelay = propagationDelay;
            for (idx = 0; idx < emission.values.length; idx++) {
                ETC.add(currentDelay, 10*emission.values[idx] / (propagationDelay+1));  // Arbitrary scaling - sorry!
                currentDelay += unitDelay;
            }
        }
    }
    var dir = getDir(recLoc, this.sources[0].loc);
    var ip = getClosestReflector(this, recLoc, dir, 1);
    if (typeof ip.reflector == 'undefined') {  // Source and receiver have a line-of-sight
        directDelay = this.rlParams.internalDistToRealTime(recLoc.timeOfFlight(this.sources[0].loc));
        ETC.add(directDelay, this.sources[0].ARTemission.responseToDirection[0].values[0] / (directDelay + 1))
    }

    this.receivers[0].ETC = ETC;
};

function Receiver(rec) {
    this.loc = new Vec2(rec);
    this.humidity = 40;
    this.temperature = 273.15 + 20;
    this.updateCounter = 0;
    this.reset();
}

//
// A helper class to enable accumulation of raylets on the listener in illustration
//
PolarDensity.prototype.getIndex = function(angle) {
    var nofSlots = this.size;
    var slotSize = (this.right - this.left)/ nofSlots;
    var diff = angle - this.left;

    return Math.floor(diff/slotSize);
};

PolarDensity.prototype.addNew = function(angle) {
    var idx = this.getIndex(angle);
    if (this.slots[idx] != null)
        return (1 + this.slots[idx].addNew(angle));
    else {
        var nofSlots = this.size;
        var slotSize = (this.right - this.left)/ nofSlots;
        var left = idx * slotSize;
        this.slots[idx] = new PolarDensity(2, left, left+slotSize);
        return 0;
    }
};

function PolarDensity(nofSectors, startAngle, endAngle) {
    this.slots = [];
    var i;
    for (i=0;i<nofSectors;i++)
        this.slots[i] = null;
    this.size = nofSectors;
    this.left = startAngle;
    this.right = endAngle;
}
