// Simulation modes
var MAKE_IS = 0;
var MAKE_IS_PATHS = 1;
var CREATE_RAYS = 2;
var CREATE_BRDFS = 3;
var ART = 4;
var BEM = 5;

// Visualization modes
var WAVE_FRONTS = 0;
var FULL_RAYS = 1;
var BEAMS = 2;
var RAY_EXTENSIONS = 3;
var RAY_SEGMENTS = 4;
var RAY_EMISSION = 5;
var BRDF_SLOTS = 6;
var RADIANCE = 7;
var SHOW_RECEIVER = 8;
var SHOW_PRIMARY_SOURCE = 9;

// Status for rays
var OK = 0;
var OUT_OF_SURFACE = 1;
var WRONG_SIDE = 2;
var OBSTRUCTED = 3;
var AUDIBLE = 4;
// ESCAPED = 5;

// Ray type
var IMAGE_SOURCE_RAY = 0;
var CAST_RAY = 1;
var DIFFUSE_SPLIT_RAY = 2;
var DIFFUSE_SHADOW_RAY = 3;

// Use of beams
var NO_BEAMS = 0;
var SIMPLE_BEAMS = 1;
var BEAM_CLIPPING = 2;
var FULL_CLIPPING = 3;

// Beam visualization
var SHOW_NO_BEAMS = 0;
var SINGLE_BEAM = 1;
var BEAM_BRANCH = 2;
var ALL_BEAMS = 3;

// Ray distribution
var UNIFORM = 0;
var JITTERED = 1;
var RANDOM = 2;

// Ray visualization
var ALL_RAYS = 0;
var AUDIBLE_RAYS = 1;

// Initial ray energy
var ENERGY_PER_RAY = 100;

// Diffusion model
var SHADOW_RAYS = 0;

// Number of rays in ART shoot
//ART_RAYS_PER_SHOOT = 500;
var ART_RAYS_PER_SHOOT = 200;
var ART_INITIAL_RESPONSE_LENGTH = 5;  // Internal samples, i.e. internal time units, i.e. internal distance units

// ART visualization
var TOTAL_ENERGY = 0;
var INSTANTANEOUS_ENERGY = 1;

var ALL_ENERGY = 0;
var UNSHOT_ENERGY = 1;

// Maximum number of image sources
var MAX_IMAGE_SOURCES = 65535;

// Time limit for full path visualization (used in testing if we are going to visualize the whole paths --- beware!!!)
var FULL_PATH_VISUALIZATION_TIME = 100000;

// Absorption of reflection paths
var DISTANCE = 0;
var MATERIAL_ABSORPTION = 1;
var AIR_ABSORPTION = 2;

// Response visualization
var IMPULSE_RESPONSE = 0;
var ETC_CURVE = 1;
var SCHROEDER_PLOT = 2;

// Material database
var HARD = 0;
var DIFFUSE = 1;
var SEMIDIFFUSE = 2;
var ABS05 = 3;
var AUDIENCE = 4;

var materials=[];
materials[HARD] = {abs: 0, diff: 0};
materials[DIFFUSE] = {abs: 0, diff: 1};
materials[SEMIDIFFUSE] = {abs: 0, diff: 0.5};
materials[ABS05] = {abs: 0.5, diff: 0};
materials[AUDIENCE] = {abs: 0.2, diff: 0.5};

// Math constants
var M_PI = Math.PI;
var M_PI_2 = Math.PI/2;
var M_2_PI = Math.PI * 2;
var EPS = 1e-10;
// EPS = 0;

// GLOBAL VARIABLES
var g_listOfRoomsForRedraw = [];

var activeSurface = 0;

GA.prototype.updateGeometry = function() {
    console.log("Now updating the geometry!");
    var surfID;
    for (surfID=0;surfID<this.startVertices.length;surfID++) {
        this.lineDirs[surfID] = new Vec2(this.endVertices[surfID]);
        this.lineDirs[surfID].sub(this.startVertices[surfID]);
        this.lineNormDirs[surfID] = new Vec2(this.lineDirs[surfID]);
        this.lineNormDirs[surfID].normalize();
        this.normals[surfID] = new Vec2(this.lineDirs[surfID].y, -this.lineDirs[surfID].x);
        this.normals[surfID].normalize();
        this.surfaceNormalAngles[surfID] = Math.atan2(this.normals[surfID].y, this.normals[surfID].x);
        this.centers[surfID] = new Vec2(this.startVertices[surfID]);
        this.centers[surfID].add(this.endVertices[surfID]);
        this.centers[surfID].scale(0.5);
    }
    this.closer = [];    // Vertices to surround the space at canvas boundaries if an open space
    if (this.buildAutoHideCloser == 1) {
        this.closer.push(new Vec2(5000, this.endVertices[this.endVertices.length-1].y));
        this.closer.push(new Vec2(5000, -5000));
        this.closer.push(new Vec2(-5000, -500));
        this.closer.push(new Vec2(-5000, this.startVertices[0].y));
    }
    this.clipChanged = 1;
};

GA.prototype.addPatches = function(surfID, startVert, endVert, absCoeff, diffCoeff, label) {
    var surfLen = startVert.distance(endVert);
    var nofSurfs = Math.ceil(surfLen / this.patchSize);
    var i;
    this.startVertices[surfID] = startVert;
    this.absorptionCoeffs[surfID] = absCoeff;
    this.diffusionCoeffs[surfID] = diffCoeff;
    if (label == "")
        label = (surfID+1).toString();
    this.labels[surfID] = label;

    for (i=1; i<nofSurfs; i++) {
        var newVert = new Vec2(endVert);
        newVert.sub(startVert);
        newVert.scale(i/nofSurfs);
        newVert.add(startVert);
        this.endVertices[surfID] = newVert;
        surfID++;
        this.startVertices[surfID] = newVert;
        this.absorptionCoeffs[surfID] = absCoeff;
        this.diffusionCoeffs[surfID] = diffCoeff;
        this.labels[surfID] = label + "_" + i.toString();
    }
    this.endVertices[surfID] = endVert;
    surfID++;

    return surfID;
};

GA.prototype.prepareGeometry = function(roomID) {
    this.roomID = roomID;

    // Separate source and receiver from the rest
    this.sources = [];
    this.sources[0] = new Source(new Vec2(this.vertices[this.objects[roomID][0].start-2]), 0, -1, -1);
    this.receivers = [];
    this.receivers[0] = new Receiver(this.vertices[this.objects[roomID][0].start-1]);

    // Local copy of the vertices, and normals
    this.startVertices = [];
    this.endVertices = [];
    this.lineDirs = [];
    this.lineNormDirs = [];
    this.normals = [];
    this.surfaceNormalAngles = [];
    this.centers = [];
    this.absorptionCoeffs = [];
    this.diffusionCoeffs = [];
    this.labels = [];
    this.showLabels = false;
    var surfID = 0, surfStartID = 0;
    var obj, i;
    var startVert, endVert;
    for (obj = 0; obj < this.objects[roomID].length; obj++) {
        for (i = this.objects[roomID][obj].start; i < this.objects[roomID][obj].end; i++) {
            if (i > this.objects[roomID][obj].start)
                startVert = this.endVertices[surfID - 1];
            else {
                surfStartID = surfID;
                startVert = new Vec2(this.vertices[i].x, this.vertices[i].y);
            }
            if ((i < (this.objects[roomID][obj].end - 1)) ||
                ((this.vertices[i + 1].x != this.vertices[this.objects[roomID][obj].start].x) ||
                 (this.vertices[i + 1].y != this.vertices[this.objects[roomID][obj].start].y)))
                endVert = new Vec2(this.vertices[i + 1].x, this.vertices[i + 1].y);
            else
                endVert = this.startVertices[surfStartID];  // Close the loop by pointing to the startingVertex - not a copy of it!
            surfID = this.addPatches(surfID, startVert, endVert, materials[this.materialIDs[i]].abs, materials[this.materialIDs[i]].diff, this.rawLabels[i]);
        }
    }
    this.updateGeometry();

    // Initialize the ray path array
    this.rayPaths = [];
    this.BRDFs_created = false;
    this.ART_responses_created = false;
};

GA.prototype.verticesToInternalCoordinates = function() {
    var i;
    if (!this.aspectRatio)
        this.aspectRatio = this.origWidth / this.origHeight;
    for (i=0;i<this.vertices.length;i++)  // Move the coordinates from (0,100) - (0,100) range to (-width/2,width/2) - (-height/2, height/2)
        this.vertices[i].set((this.vertices[i].x-50)*this.origWidth/100, (this.vertices[i].y-50)*(this.origWidth/this.aspectRatio)/100);
};

function GA(id, vertices, objects, materialIDs, labels, closedFlag) {
    console.log("Making a new GA figure: " + id);
    this.id = id;
    this.showOutside = 1;
    this.coverFig = 0;
    this.clipChanged = false;
    this.saved = 0;

    this.roomID = 0;
    this.patchSize = 5000; // Any big number to guarantee one patch per surface
    this.responseLength = ART_INITIAL_RESPONSE_LENGTH;
    this.updateCounter = 0;
    this.inAnimation = false;

    this.sourceCanMove = true;
    this.geometryCanChange = true;

    // Let us scale everything to the canvas coordinates
    var ctx = document.getElementById(this.id).getContext('2d');
    this.origWidth = ctx.canvas.width;
    this.origHeight = ctx.canvas.height;
    this.aspectRatio = this.origWidth / this.origHeight;

    this.vertices = vertices;
    this.objects = objects;
    this.materialIDs = materialIDs;
    this.rawLabels = labels;
//    this.verticesToInternalCoordinates();

//    this.vertices[i].set((vertices[i].x-50)*origWidth/100, (vertices[i].y-50)*this.origHeight/100);
    this.scaler = 1.0;

    this.resize(ctx.canvas);

    this.buildAutoHideCloser = 1 - closedFlag;

    // For indexing all the below, use the constants presented at the beginning of this file!
    // Array that tells what should be visualized. Geometry is visualized in any case
    this.visualize = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.visualize[SHOW_RECEIVER] = 1;
    this.visualize[SHOW_PRIMARY_SOURCE] = 1;
    // What cases of image sources will be visualized
    this.isVisualize = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    // What reflection orders will be visualized with image sources
    this.showOrders = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // What will be simulated
    this.simulationModes = [0, 0, 0, 0, 0, 0, 0, 0];
    this.useOfBeams = NO_BEAMS;
    // Ray emission distribution
    this.rayDistribution = [0, 0, 0];
    // Ray visualization
    this.rayVisualization = ALL_RAYS;
    this.receiverRadius = 0;
    // Ray diffusion
    this.rayDiffusionModel = [0, 0, 0];
    // Beam visualization
    this.beamToBeVisualized = 1;

    this.maxOrder = 1;
    this.BRDFvisualizationScaler = 1.0;

    this.attenuation = [0, 0, 0, 0, 0, 0, 0, 0]; // Attenuation of reflection paths in impulse response generation

    g_listOfRoomsForRedraw.push(this);
    console.log("Initialized!")
}

GA.prototype.changeGeometry = function(ev) {
    console.log("New geometry: ", ev.value);
    this.prepareGeometry(ev.value);
    this.computeAll();
    this.drawAll();
};

GA.prototype.repatch = function() {
    console.log("New patch size: ", this.patchSize);
    this.prepareGeometry(this.roomID);
    this.computeAll();
    this.drawAll();
};

GA.prototype.computeAll = function() {
    console.log("Compute all upto order ", this.maxOrder);
    if (this.simulationModes[MAKE_IS] == 1) {
        if (this.sources.length > 1)
            this.sources.splice(1, this.sources.length-1);
        this.computeImageSources(this.sources[0], this.maxOrder);
    }
    this.rayPaths = [];
    if (this.simulationModes[MAKE_IS_PATHS] == 1)
        this.constructAllISRayPaths();
    if (this.simulationModes[CREATE_RAYS] == 1) {
        console.log("Starting ray creation.");
        this.createRays(this.nofRays, this.sources[0], this.sources[0].loc, 0, CAST_RAY, ENERGY_PER_RAY, 0, M_2_PI);
        console.log("Rays created.");
        this.reflectRays(0);
        console.log("Rays reflected.");
        this.checkAudibilities();
        console.log("Visibilities checked.");
        this.updateShadowRays();
    }
    if ((this.simulationModes[CREATE_BRDFS] == 1) && (this.BRDFs_created == false)) {
        this.createBRDFs();
        this.BRDFs_created = true;
        this.ART_responses_created = false;
    }
    if ((this.simulationModes[ART] == 1) && (this.ART_responses_created == false)) {
        this.createARTresponses();
        this.rayPaths = [];
    }
    if (this.simulationModes[BEM] == 1) {
        this.createSecondarySources();
    }
};

// Ray tracing and ART helpers
GA.prototype.resetAndReflectRays = function() {
//    this.receivers[0].reset();
    this.resetRays();
    this.reflectRays(0);
//    if (this.rayDiffusionModel[SHADOW_RAYS])
//        this.createShadowRays();
    this.checkAudibilities();
    this.updateShadowRays();
};

GA.prototype.setDiffusionAndRecompute = function() {
    var i;
    for (i=0; i<this.diffusionCoeffs.length; i++)
        this.diffusionCoeffs[i] = this.generalDiffusion;
    if (this.simulationModes[CREATE_RAYS] == 1)
        this.resetAndReflectRays();
    if (this.simulationModes[CREATE_BRDFS] == 1)
        this.createBRDFs();
};

GA.prototype.setAbsorptionAndRecompute = function() {
    var i;
    for (i=0; i<this.absorptionCoeffs.length; i++)
        this.absorptionCoeffs[i] = this.generalAbsorption;
    if (this.simulationModes[CREATE_RAYS] == 1)
        this.updateShadowRays();
    if (this.simulationModes[CREATE_BRDFS] == 1)
        this.createBRDFs();
};

GA.prototype.updateShadowRays = function() {
    this.checkAudibilities(); // Makes too much computation, but cleans the registeredPaths efficiently :-)
    this.clearShadowRays();
    if (this.rayDiffusionModel[SHADOW_RAYS] == 1) {
        this.createShadowRays();
        console.log("Shadow rays created.");
    }
};

// ART helper
GA.prototype.createBRDFsAndARTresponses = function() {
    this.createBRDFs();
    this.createARTresponses();
};
