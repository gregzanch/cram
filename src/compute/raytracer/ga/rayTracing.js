"use strict";

var rayTracing_room;

function rayTracing_init() {
    var geom = [];
    var objects = [];
    var materialIDs = [];
    var labels = [];
     geom[0] = new Vec2(89, 63);
     materialIDs[0] = HARD;
     labels[0] = "Source";
     geom[1] = new Vec2(66, 69);
     materialIDs[1] = HARD;
     labels[1] = "Receiver";
     geom[2] = new Vec2(13, 50);
     materialIDs[2] = DIFFUSE;
     labels[2] = "";
     geom[3] = new Vec2(17, 66);
     materialIDs[3] = AUDIENCE;
     labels[3] = "A";
     geom[4] = new Vec2(83, 76);
     materialIDs[4] = HARD;
     labels[4] = "";
     geom[5] = new Vec2(83, 69);
     materialIDs[5] = HARD;
     labels[5] = "S";
     geom[6] = new Vec2(99, 69);
     materialIDs[6] = HARD;
     labels[6] = "FW";
     geom[7] = new Vec2(99, 40);
     materialIDs[7] = HARD;
     labels[7] = "C";
     geom[8] = new Vec2(7, 23);
     materialIDs[8] = SEMIDIFFUSE;
     labels[8] = "";
     geom[9] = new Vec2(7, 36);
     materialIDs[9] = ABS05;
     labels[9] = "B";
     geom[10] = new Vec2(33, 46);
     materialIDs[10] = ABS05;
     labels[10] = "";
     geom[11] = new Vec2(33, 53);
     materialIDs[11] = ABS05;
     labels[11] = "";
     geom[12] = new Vec2(13, 50);
     materialIDs[12] = HARD;
     labels[12] = "";
     geom[13] = new Vec2(33, 43);
     materialIDs[13] = HARD;
     labels[13] = "Source";
     geom[14] = new Vec2(66, 50);
     materialIDs[14] = HARD;
     labels[14] = "Receiver";
     geom[15] = new Vec2(0, 17);
     materialIDs[15] = HARD;
     labels[15] = "L";
     geom[16] = new Vec2(0, 83);
     materialIDs[16] = HARD;
     labels[16] = "B";
     geom[17] = new Vec2(99, 83);
     materialIDs[17] = HARD;
     labels[17] = "R";
     geom[18] = new Vec2(99, 17);
     materialIDs[18] = HARD;
     labels[18] = "T";
     geom[19] = new Vec2(0, 17);
     materialIDs[19] = HARD;
     labels[19] = "";
     objects[0] = [];
     objects[0][0] = {start: 2, end: 12};
     objects[1] = [];
     objects[1][0] = {start: 15, end: 19};
    rayTracing_room = new GA('rayTracing_room_canvas', geom, objects, materialIDs, labels, 1);

    rayTracing_room.fs = 44100;
    rayTracing_room.rlParams = new RealLifeParams();
    rayTracing_room.maxDuration = 4000;
    rayTracing_room.maxOrder = 100;
    rayTracing_room.aspectRatio = 1.25;
    rayTracing_room.geometryCanChange = false;
     rayTracing_room.timeSliderSliderID = "rayTracing_timeSliderSlider";
     rayTracing_room.timeSlider = 0;
     rayTracing_room.receiverRadiusSliderID = "rayTracing_receiverRadiusSlider";
     rayTracing_room.receiverRadius = 5;
     rayTracing_room.diffusionCoeffsSliderID = "rayTracing_diffusionCoeffsSlider";
     rayTracing_room.nofRays = 15;
     rayTracing_room.rayVisualizationOrder = 1;
    rayTracing_room.visualize[FULL_RAYS] = 1;
    rayTracing_room.visualize[RAY_SEGMENTS] = 1;
    rayTracing_room.simulationModes[CREATE_RAYS] = 1;
    rayTracing_room.rayVisualization = ALL_RAYS;
    rayTracing_room.informationFields = [];
    rayTracing_room.disabledButtons = [];
    rayTracing_room.geometrySelectionId = "rayTracing_geometrySelection"
    rayTracing_room.verticesToInternalCoordinates();
    rayTracing_room.prepareGeometry(0);
    rayTracing_room.initiateColors(10);
    rayTracing_room.computeAll();
    rayTracing_room.drawAll();
}

function rayTracing_timeSliderSliderEvent(ev) {
    rayTracing_room.timeSlider = ev.value;
    rayTracing_room.drawAll();
}

function rayTracing_receiverRadiusSliderEvent(ev) {
    rayTracing_room.receiverRadius = ev.value;
    rayTracing_room.checkAudibilities();
    rayTracing_room.drawAll();
}

function rayTracing_diffusionCoeffsSliderEvent(ev) {
    rayTracing_room.diffusionCoeffs[1] = ev.value;
    rayTracing_room.resetAndReflectRays();
    rayTracing_room.drawAll();
}

function rayTracing_nofRaysValueChangedEvent(ev) {
    rayTracing_room.nofRays = ev.value;
    rayTracing_room.computeAll();
    rayTracing_room.drawAll();
}

function rayTracing_rayVisualizationOrderValueChangedEvent(ev) {
    rayTracing_room.rayVisualizationOrder = ev.value;
    rayTracing_room.computeAll();
    rayTracing_room.drawAll();
}

function rayTracing_visualizeArrayToggleEvent(ev, id) {
    var elementID = "rayTracing_visualizeCheckBoxArray_" + id;
    var cbox = document.getElementById(elementID);
    cbox.value = ((+cbox.value) + 1) % 2;
    var limits = id.split("-");
    var first = eval(limits[0]);
    var last = first;
    if (limits.length>1) last = eval(limits[1]);
    var i;
    for(i=first;i<=last;i++) rayTracing_room.visualize[i] = cbox.value;
    rayTracing_room.drawAll();
}

function rayTracing_simulationModesArrayToggleEvent(ev, id) {
    var elementID = "rayTracing_simulationModesCheckBoxArray_" + id;
    var cbox = document.getElementById(elementID);
    cbox.value = ((+cbox.value) + 1) % 2;
    var limits = id.split("-");
    var first = eval(limits[0]);
    var last = first;
    if (limits.length>1) last = eval(limits[1]);
    var i;
    for(i=first;i<=last;i++) rayTracing_room.simulationModes[i] = cbox.value;
    rayTracing_room.computeAll();
    rayTracing_room.drawAll();
}

function rayTracing_rayVisualizationRadioBoxSetEvent(ev, id) {
    var elementID = "rayTracing_rayVisualizationRadioBoxArray"
    var cbox = document.getElementById(elementID);
    rayTracing_room.rayVisualization = id;
    rayTracing_room.drawAll();
}

function rayTracing_rayByRayButtonPressedEvent(ev) {
    var elementID = "rayTracing_rayByRayButton"
    var buttonElement = document.getElementById(elementID);
    rayTracing_room.rayByRayAnimation();
}

