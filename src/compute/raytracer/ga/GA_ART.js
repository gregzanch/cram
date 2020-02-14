//
// Acoustic Radiance Transfer (ART)
//
// (c) Lauri Savioja, 2016
//

"use strict";

var ARTinitialShootEnergy = 500;

GA.prototype.createARTresponses = function() {
    var i;
    this.rayPaths = [];
    this.unshotARTenergy = [];
    this.totalUnshotARTenergy = [];
    this.ARTenergy = [];
    this.totalARTenergy = [];
    this.rayWeightsPerARTSegment = [];
    for (i=0;i<this.startVertices.length;i++) {
        this.unshotARTenergy[i] = new DirectionalResponse(this.nofBRDFsectors, this.responseLength);
        this.totalUnshotARTenergy[i] = new DirectionalResponse(this.nofBRDFsectors, 1);
        this.ARTenergy[i] = new DirectionalResponse(this.nofBRDFsectors, this.responseLength);
        this.totalARTenergy[i] = new DirectionalResponse(this.nofBRDFsectors, 1);
    }
    this.sources[0].ARTemission = new DirectionalResponse(1, 1);
    this.sources[0].ARTemission.responseToDirection[0].values[0] = ARTinitialShootEnergy;

    this.ART_responses_created = true;
};

GA.prototype.createNextARTraysAndReflect = function() {
    var i;
    var maxEnergy = -1, e, nextSurfToShoot;
    for (i=0;i<this.startVertices.length; i++) {
        e = this.totalUnshotARTenergy[i].sum();
        if (e>maxEnergy) {
            maxEnergy = e;
            nextSurfToShoot = i;
        }
    }
    this.rayPaths = [];

    // Compute weights for the rays

    console.log("Next shoot:" + nextSurfToShoot);

    var emission = this.unshotARTenergy[nextSurfToShoot];
    var totalEnergy = emission.sum();
    var nofSlots = this.BRDFs[nextSurfToShoot].nofSlots;
    var energyInSlot;
    var fractionOfTotalEnergy = [];
    var raysPerSlot = [];
    var maxRaysPerSlot = (2*ART_RAYS_PER_SHOOT) / nofSlots;
    var slotSize = M_PI / nofSlots;
    var maxAngle = this.surfaceNormalAngles[nextSurfToShoot] + M_PI_2;
    var minAngle = maxAngle - slotSize;
    for (i=0; i<nofSlots; i++) {
        energyInSlot = emission.responseToDirection[i].sum();
        if (energyInSlot > 0) {
            fractionOfTotalEnergy[i] = energyInSlot / totalEnergy;
            raysPerSlot[i] = Math.max(1, Math.floor(fractionOfTotalEnergy[i] * maxRaysPerSlot));
            this.createRays(raysPerSlot[i], nextSurfToShoot, this.centers[nextSurfToShoot], 0, CAST_RAY, 1/raysPerSlot[i], minAngle, maxAngle);
        } else
            raysPerSlot[i] = 0;
        maxAngle = minAngle;
        minAngle -= slotSize;
    }

    this.reflectRays(0);

    this.unshotARTenergy[nextSurfToShoot].clear();
};

GA.prototype.nextARTshoot = function() {
    // Emission
    if (this.rayPaths.length == 0) {// Initial shoot
        this.createRays(ART_RAYS_PER_SHOOT, this.sources[0], this.sources[0].loc, 0, CAST_RAY, 1 / ART_RAYS_PER_SHOOT, 0, M_2_PI);
        this.reflectRays(0);
    } else
        this.createNextARTraysAndReflect();

    var i;
    // Update cumulative energies
    for (i=0;i<this.startVertices.length; i++) {
        this.totalUnshotARTenergy[i].accumulateFrom(this.unshotARTenergy[i]);
        this.totalARTenergy[i].accumulateFrom(this.ARTenergy[i]);
    }
};

GA.prototype.startNextShootAnimation = function() {
    this.nextARTshoot();
    var i;
    var maxTime = -1;
    this.rayVisualization = ALL_RAYS;
    this.rayVisualizationOrder = 0;
    for (i=0;i<this.rayPaths.length;i++)
        maxTime = Math.max(maxTime, this.rayPaths[i].durations[0]);
    this.time = 0;
    this.maxTime = Math.round(maxTime);
};

var room;
var times;
var buttonElement = -1;
var originalButtonValue;
var originalEnergyValue;
var originalTemporalValue;
var originalValue;
var speed = 1;

function ARTshoot() {
    if (times>0) {
        if (room.time == 0) {
            if (buttonElement != -1)
                buttonElement.value = times.toString() + " left.";
            room.startNextShootAnimation();
        }
        room.inAnimation = true;
        room.time += speed;
        room.drawAll(false);
        if (room.time > room.maxTime) {
            room.time = 0;
            times--;
            if (times == 0) {
                buttonElement.value = originalValue;
                room.visualize[RAY_SEGMENTS] = 0;
                room.ARTenergyVisualization = originalEnergyValue;
                room.ARTtemporalVisualization = originalTemporalValue;
            }
        }
        setTimeout(ARTshoot, 0.01);
    }
    else {
//        console.log("FInal draw!")
        room.inAnimation = false;
        room.drawAll();
    }
}

//
// Starts animation of t shoots. Time is advanced by v at each frame
//
GA.prototype.ARTshootAnimation = function(bE, t, v) {
    room = this;
    times = t;
    buttonElement = bE;
    originalValue = bE.value;
    originalEnergyValue = this.ARTenergyVisualization;
    originalTemporalValue = this.ARTtemporalVisualization;
    this.ARTenergyVisualization = UNSHOT_ENERGY;
    this.ARTtemporalVisualization = TOTAL_ENERGY;
    room.visualize[RAY_SEGMENTS] = 1;
    room.rayVisualization = ALL_RAYS;
    room.rayVisualizationOrder = 0;
    speed = v;
    ARTshoot();
};



GA.prototype.ARTshoot1Toggle = function(bE, div, speed) {
    toggle_visibility(div);
    if (this.visualize[BRDF_SLOTS] == 1) {
        bE.value = "Back to setup";
        this.visualize[BRDF_SLOTS] = 0;
            this.ARTshootAnimation(bE, 1, speed);
        var i;
        for (i=0;i<this.disabledButtons.length; i++) {
            db = document.getElementById(this.disabledButtons[i]);
            db.disabled = false;
        }
        db = document.getElementById(this.geometrySelectionId);
        db.disabled = true;
        this.sourceCanMove = false;
        this.geometryCanChange = false;
    } else {
        this.visualize[BRDF_SLOTS] = 1;
        bE.value = "Initial shoot";
        var db;
        for (i=0;i<this.disabledButtons.length; i++) {
            db = document.getElementById(this.disabledButtons[i]);
            db.disabled = true;
        }
        db = document.getElementById(this.geometrySelectionId);
        db.disabled = false;
        this.timeSlider = 0;  // Hard reset the time (TODO: Reset the slider as well)
        this.createARTresponses();
        this.drawAll();
        this.sourceCanMove = true;
        this.geometryCanChange = true;
    }
};

GA.prototype.radiosityInitialShootAndToggle = function(bE, doAnimation) {
    bE.value = "1 x shoot";
    if (doAnimation)
        this.ARTshootAnimation(bE, 1, 3);
    else {
        this.nextARTshoot();
        this.drawAll();
    }

    if (!this.radiosityInitialShootDone) {
        for (i = 0; i < this.disabledButtons.length; i++) {
            db = document.getElementById(this.disabledButtons[i]);
            db.disabled = false;
        }
        this.timeSlider = 0;
    }
    this.radiosityInitialShootDone = true;
    this.sourceCanMove = false;
    this.geometryCanChange = false;
};

GA.prototype.registerARTenergies = function(srcID, rcvSurfID, flightTime, intersectionPoint, gain) {
    var srcLoc;
    var emission;
    if (srcID instanceof Source) {
        srcLoc = srcID.loc;
        emission = srcID.ARTemission.responseToDirection[0];
    } else {
        srcLoc = this.centers[srcID];
        var outAngleIdx = this.BRDFs[srcID].getAngleIndex(this.centers[srcID], this.lineDirs[srcID], intersectionPoint);
        emission = this.unshotARTenergy[srcID].responseToDirection[outAngleIdx];
    }
    var incidentAngleIdx = this.BRDFs[rcvSurfID].getAngleIndex(this.centers[rcvSurfID], this.lineDirs[rcvSurfID], srcLoc);

    var startEnergyAtReceiver = this.ARTenergy[rcvSurfID].sum();
    var emissionEnergy = emission.sum() * gain;

    this.unshotARTenergy[rcvSurfID].delayMultiplyAdd(emission, flightTime, this.BRDFs[rcvSurfID].coeffs[incidentAngleIdx], gain);
    this.ARTenergy[rcvSurfID].delayMultiplyAdd(emission, flightTime, this.BRDFs[rcvSurfID].coeffs[incidentAngleIdx], gain);

//    var endEnergyAtReceiver = this.ARTenergy[rcvSurfID].sum();
//    console.log(emissionEnergy + " E tranferred: balance change:" + (endEnergyAtReceiver - startEnergyAtReceiver));
//    this.ARTenergy[rcvSurfID].printNonZero(rcvSurfID+" reg: ");
};

GA.prototype.debugEPrint = function() {
    var i;
    for (i=0; i<this.lineDirs.length; i++) {
        console.log("surf: " + i + ". Total: " + this.totalARTenergy[i].sum() + ". Unshot: " + this.totalUnshotARTenergy[i].sum());
    }
};

GA.prototype.ARTprintNonZero = function() {
    var i;
    for (i=0; i<this.lineDirs.length; i++) {
        this.ARTenergy[i].printNonZero(i + ". total");
        this.unshotARTenergy[i].printNonZero(i + ". unshot");
    }
};

GA.prototype.printTotalEnergies = function() {
    var total = 0;
    var totalUnshot = 0;
    var startEnergy = this.sources[0].ARTemission.sum();
    var surfID;

    for (surfID = 0; surfID < this.lineDirs.length; surfID++) {
        total += this.totalARTenergy[surfID].sum();
        totalUnshot += this.totalUnshotARTenergy[surfID].sum();
    }
    console.log("Starting energy: ", startEnergy);
    console.log("  Unshot energy: ", totalUnshot);
    console.log("   Total energy: ", total);
};


