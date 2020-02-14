//
// Responses, directional responses
//
// (c) Lauri Savioja, 2016
//

//
// Basic response that can be used for impulse response, time-energy-response, basic unit of a directional response, and so on ...
//

"use strict";

Response.prototype.clear = function(N0, N1, val) {
    var i;
    if (!N0)
        N0 = 0;
    if (!N1)
        N1 = this.values.length;
    if (!val)
        val = 0;
    for (i=N0;i<N1;i++)
        this.values[i] = val;
};

Response.prototype.extendToNsamples = function(N) {
    this.clear(this.len, N);
    this.len = N;
};

function Response(len) {
//    this.len = len;
    this.values = [];
    this.clear(0, len);
}

Response.prototype.add = function(idx, value) {
    this.values[idx] += value;
};

//
// Cumulative sum of a signal
//
Response.prototype.sum = function() {
    var i;
    var s=0;
    for (i=0;i<this.values.length;i++)
        s += this.values[i];
    return s;
};

Response.prototype.validate = function() {
    var j;
    for (j=0;j<this.values.length;j++)
        if (isNaN(this.values[j])) {
            console.log("Kiville meni.")
        }
};

//
// Delay src response, multiply it, and add to 'this'
//
Response.prototype.delayMultiplyAdd = function(src, delay, mult) {
    var i;
    var del = Math.round(delay);
    var newLen = src.values.length+del;
    if (newLen > this.values.length) {
//        console.log("Old len: " + this.values.length, ". New len: " + newLen + ". Delay: " + delay + "(" + del + ")");
        this.extendToNsamples(newLen);
//    var len = Math.min(Math.floor(this.len-delay), src.len);
    }
    for (i=0; i<src.values.length; i++) {
        this.values[i+del] += (src.values[i] * mult);
    }
//    this.validate();
};

Response.prototype.printNonZero = function(str) {
    var i;
    for (i=0;i<this.values.length; i++) {
        if (this.values[i] != 0)
            console.log(str+", "+i+". = " + this.values[i]);
    }
};

// ------------------------------------------------

//
// Response with sampling rate, extends the response length if required
// initialMaxDuration is in ms
//

SampledResponse.prototype.sampleToTime = function(N) {
    return (N*1000/this.fs);
};
SampledResponse.prototype.timeToSample = function(t) {
    return Math.floor((t*this.fs)/1000);
};

function SampledResponse(fs, initialMaxDuration) {
    this.fs = fs;
    this.maxDuration = initialMaxDuration;
    this.response = new Response(this.timeToSample(initialMaxDuration));
}

SampledResponse.prototype.add = function(time, value) {
    var idx = this.timeToSample(time);
    if (time>this.maxDuration) {
        this.response.extendToNsamples(idx+1);
        this.maxDuration = time;
    }
    this.response.add(idx, value);
};

SampledResponse.prototype.addArray = function(startIdx, valArray, scaler) {
    var lastSampleIdx = startIdx + valArray.length;
    if (lastSampleIdx>this.response.values.length) {
        this.response.extendToNsamples(lastSampleIdx);
    }
    var i;
    for (i=0; i<valArray.length; i++)
        this.response.add(startIdx+i, valArray[i] * scaler);
    this.maxDuration = this.sampleToTime(this.response.values.length);
};



SampledResponse.prototype.timeOfLastEvent = function() {
    var i;
    var r = this.response;
    for (i=r.len;i>=0;i--)
        if (r.values[i] != 0)
            return (this.sampleToTime(i));
    return 0.0;
};

SampledResponse.prototype.rangeOfValues = function() {
    var i;
    var minVal = 10E+20;
    var maxVal = -10E+20;
    var r=this.response;
    var v;
    for (i=0;i<r.values.length;i++) {
        v = r.values[i];
        if (v>maxVal)
            maxVal = v;
        if (v<minVal)
            minVal = v;
    }
    return {min: minVal, max: maxVal};
};

//
// Schroeder backward integration
//

SampledResponse.prototype.SchroederBackwardIntegration = function() {
    var cumulation = [];
    var i;

    cumulation[0] = this.response.values[0];
    for (i=1; i<this.response.values.length; i++) {
        cumulation[i] = cumulation[i-1] + this.response.values[i];
    }
    var total = cumulation[cumulation.length-1];
    var sch = new SampledResponse(this.fs, this.maxDuration);
    for (i=0; i<cumulation.length; i++) {
        sch.response.values[i] = 10*log10((total - cumulation[i]) / total);
    }
    return sch;
};

//
// Draw response
//

var plotDivID;
var plotRealTime;
var plotRayType;
var plotIR;
var plotResponseType;

function realDrawResponse() {
    var maxTime = plotIR.maxDuration;
    var timeStep = maxTime/plotIR.response.values.length;
    var time = linspace(0,maxTime,timeStep);
    var layout;
    var yRange;
    if (plotResponseType == IMPULSE_RESPONSE) {
        layout = {
            title: 'Impulse response',
            xaxis: {
                title: 'Time (ms)',
                range: [0, maxTime * 1.1]
            },
            yaxis: {
                title: 'Amplitude',
                range: [-1, 1]
            },
            showlegend: false
        }
    } else if (plotResponseType == ETC_CURVE) {
        yRange = plotIR.rangeOfValues();
        layout = {
            title: 'Energy-time curve',
            xaxis: {
                title: 'Time (ms)',
                range: [0, maxTime * 1.1]
            },
            yaxis: {
                title: 'Energy (linear)',
                range: yRange
            },
            showlegend: false
        }
    } else if (plotResponseType == SCHROEDER_PLOT) {
//        yRange = plotIR.rangeOfValues();
        layout = {
            title: 'Schroeder plot',
            xaxis: {
                title: 'Time (ms)',
                range: [0, maxTime * 1.1]
            },
            yaxis: {
                title: 'Energy decay (dB)',
                range: [-60,0]
            },
            showlegend: false
        }
    } else
        console.log("Sorry, you have been fooled, no such plot exists!");

    layout.height = 300;
    layout.margin = {
        l: 60,
        r: 20,
        b: 40,
        t: 30,
        pad: 1
    };

    Plotly.newPlot(plotDivID, [{x: time, y:plotIR.response.values}], layout);

    var ones=new Response(2);
    ones.clear(0, 1, 1);
    var x = [plotRealTime, plotRealTime];
    Plotly.addTraces(plotDivID, {x: x, y: ones, line: { color: 'red'}});
}

// Makes all the drawing and returns the internal time of the last time for tuning of the time slider
SampledResponse.prototype.drawResponse = function(divID, currentTime, responseType) {
    plotDivID = divID;
    plotRealTime = currentTime;
    plotResponseType = responseType;
    plotIR = this;

    realDrawResponse();
};


// ------------------------------------------------

//
// And now the directional response
//
function DirectionalResponse(nofDirections, len) {
    this.nofDirections = nofDirections;
    var i;
    this.responseToDirection = [];
    for (i=0;i<nofDirections;i++) {
        this.responseToDirection[i] = new Response(len);
    }
}

DirectionalResponse.prototype.clear = function() {
    var i;
    for (i=0; i<this.nofDirections; i++)
        this.responseToDirection[i].clear();
};

DirectionalResponse.prototype.sum = function() {
    var i;
    var s=0;
    for (i=0; i<this.nofDirections; i++)
        s += this.responseToDirection[i].sum();
    return s;
};

DirectionalResponse.prototype.delayMultiplyAdd = function(src, delay, multPerDirection, constScaler) {
    var i;
    for (i=0; i<this.nofDirections; i++) {
        this.responseToDirection[i].delayMultiplyAdd(src, delay, multPerDirection[i]*constScaler);
    }
};

DirectionalResponse.prototype.accumulateFrom = function(src) {
    var i;
    for (i=0; i<this.nofDirections; i++) {
        this.responseToDirection[i].values[0] = src.responseToDirection[i].sum();
    }
};

DirectionalResponse.prototype.printNonZero = function(str) {
    var i;
    for (i=0; i<this.nofDirections; i++) {
        this.responseToDirection[i].printNonZero(str+", dir: "+i)
    }
};





