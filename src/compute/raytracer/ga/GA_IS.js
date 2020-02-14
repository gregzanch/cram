//
// Image source method
//
// (c) Lauri Savioja, 2016
//


"use strict";

GA.prototype.sourceInFrontOfReflector = function(src, refl) {
    return src.loc.inFrontOfPlane(this.centers[refl], this.normals[refl]);
};

GA.prototype.reflectorInFrontOfOtherReflector = function(prevRefl, newRefl) {
    if (prevRefl == -1)
        return true;
    if (this.startVertices[newRefl].inFrontOfPlane(this.centers[prevRefl], this.normals[prevRefl]))
        return true;
    return (this.endVertices[newRefl].inFrontOfPlane(this.centers[prevRefl], this.normals[prevRefl]));
};

GA.prototype.computeImageSources = function(src, maxOrder) {
    var i;
    var reflectSource;
    var newBeam;
    for (i = 0; i < this.centers.length; i++)
        if ((this.sourceInFrontOfReflector(src, i)) &&
            (this.reflectorInFrontOfOtherReflector(src.reflector, i))) {
            reflectSource = 1;
            if (this.useOfBeams >= SIMPLE_BEAMS) {
                newBeam = this.newBeam(src.loc, i);

                newBeam.intersect(src.beam, (this.useOfBeams >= BEAM_CLIPPING));
                if (newBeam.angle > 0)
                    newBeam.computeLimitsFromAngles(this.startVertices[i], this.lineDirs[i]);
                if (this.useOfBeams == FULL_CLIPPING) {
                    var j;
                    for (j = 0; ((j < this.centers.length) && (newBeam.angle > 0)); j++)  // Go through all surfaces to find occluders.
                        if ((j != i) && (j != src.reflector) &&
                            (this.reflectorInFrontOfOtherReflector(src.reflector, j))) {  // Let us try to find out if the possible occluder is in between the old and the new.
                            if (src.reflector != -1)
                                newBeam.computeStartingPoints(this.startVertices[src.reflector], this.endVertices[src.reflector]);
                            newBeam.substractLineSegment(this.startVertices[j], this.endVertices[j]);
                            newBeam.computeLimitsFromAngles(this.startVertices[i], this.lineDirs[i]);
                        }
                }

                // newBeam.debug("New limits: ");
                if (newBeam.angle == 0)
                    reflectSource = 0;
            }

            if (reflectSource == 1) {
                var newLoc = src.loc.reflect(this.lineNormDirs[i], this.centers[i]);
                var newSource = new Source(newLoc, src.order + 1, src, i);
                if (this.useOfBeams >= SIMPLE_BEAMS) {
                    newBeam.reflectSector(this.lineNormDirs[i], this.centers[i]);
                    newSource.beam = newBeam;
                }
                if (this.sources.length < MAX_IMAGE_SOURCES) {
                    this.sources.push(newSource);
                    src.children.push(newSource);
                    if (maxOrder > 1)
                        this.computeImageSources(newSource, maxOrder - 1)
                }
            }
        }
};

Ray.prototype.markObstructions = function(room, rcv, srcloc, reflector) {
    var i;
    var rayDir = getDir(rcv, srcloc);
    for (i = 0; i < room.startVertices.length; i++)
        if (i != reflector) {  // Let us test intersection against all the other surfaces//
            if (segmentsIntersect(room.startVertices[i], room.lineDirs[i], rcv, rayDir, 1))
                this.status = OBSTRUCTED;
        }
};

Ray.prototype.addISSections = function(room, rcv, src) {
    this.points[src.order+1] = rcv;
    var rayDir = getDir(src.loc, rcv);
    this.directions[src.order] = rayDir;
    if (src.order > 0) {
        var intersection = intersectionPoint(src.loc, rayDir, room.startVertices[src.reflector], room.lineDirs[src.reflector]);
        var t_xpoint = intersect(src.loc, rayDir, room.startVertices[src.reflector], room.lineDirs[src.reflector]);
        var xpointToRcv = getDir(intersection, rcv);
        this.durations[src.order] = xpointToRcv.timeOfFlight();
        this.reflectors[src.order] = src.reflector;

        if (rayDir.dot(xpointToRcv) < 0)
            this.status = WRONG_SIDE;
        if ((this.status == OK) && ((t_xpoint < 0) || (t_xpoint > 1)))  // Initial path validation
            this.status = OUT_OF_SURFACE;
        if (this.status == OK)  //Further path validation
            this.markObstructions(room, rcv, intersection, src.reflector);

        var xpointToSrc = getDir(intersection, src.loc);
        this.startTimes[src.order] = xpointToSrc.timeOfFlight();

        this.addISSections(room, intersection, src.parent);
    } else {
        this.points[0] = src.loc;
        this.startTimes[0] = 0;
        this.durations[0] = rayDir.timeOfFlight();
        this.energies[0] = 1;     // Actually this is not energy, but pressure
        if (this.status == OK)
            this.markObstructions(room, rcv, src.loc, -1)
    }
};

GA.prototype.constructAllISRayPaths = function() {
    var i;

    this.receivers[0].reset();
    for (i=0;i<this.sources.length;i++) {
        var r = new Ray(this.sources[i]);
        r.type = IMAGE_SOURCE_RAY;
        r.addISSections(this, this.receivers[0].loc, this.sources[i]);
        r.order = this.sources[i].order;
        this.rayPaths[i] = r;
        if (r.status == OK) {  // A specular path found
            var hitTime = this.sources[i].loc.timeOfFlight(this.receivers[0].loc);
            this.receivers[0].registerPath(hitTime, i, r.order);
        }
    }
    this.rayVisualizationOrder = this.maxOrder;
};

GA.prototype.nextBeamModulo = function(directionIncrement) {
    this.beamToBeVisualized += directionIncrement;
    if (this.beamToBeVisualized == 0)
        this.beamToBeVisualized = this.sources.length-1;
    else if (this.beamToBeVisualized > (this.sources.length-1))
        this.beamToBeVisualized = 1;
};

GA.prototype.searchForBeam = function(directionIncrement) {
    var oldBeam = this.beamToBeVisualized;
    var found = 0;
    this.nextBeamModulo(directionIncrement);
    while ((found == 0) && (this.beamToBeVisualized != oldBeam))
        if (this.showOrders[this.sources[this.beamToBeVisualized].order] == 1)
            found = 1;
        else
            this.nextBeamModulo(directionIncrement);
    console.log("Beam: " + this.beamToBeVisualized);
    this.drawAll();
};
