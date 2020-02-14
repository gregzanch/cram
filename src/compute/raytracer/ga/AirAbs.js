//
// Air absorption
//
// (c) Lauri Savioja, 2016
//


"use strict";

var HUMIDITY = 0;
var FREQUENCY = 1;
var PLOT3D = 2;
// var TEMPERATURE = 2;
// var PRESSURE = 3;

var FRQ_SEARCH_LIMIT = 10;

function AirAbs(id) {
    this.id = id;
    console.log("Air absorption plot initialized!")
}

function airabs(f,pa,T,hrel) {
    var pr, Tr, T01, V, psat, h, frO, frN, alpha;

    pr = 101.325;  // reference pressure of one standard atmosphere
    Tr = 293.15;   // reference ambient temperature

    T01 = 273.16;   // triple-point isotherm temperature

    V = 10.79586 * (1 - (T01 / T)) - 5.02808 * log10(T / T01) + 1.50474 * (1E-4) * (1 - Math.pow(10, (-8.29692 * ((T / T01) - 1)))) + 0.42873 * (1E-3) * (-1 + Math.pow(10, (4.76955 * (1 - (T01 / T))))) - 2.2195983;

    psat = (pr) * Math.pow(10,V);

    h = hrel * (psat / pa);  // The original formula had pr involved but it was canceled out
    frO = (pa / pr) * (24 + ((4.04 * h * 1E+4) * (0.02 + h) / (0.391 + h)));

    frN = (pa / pr) * Math.sqrt(Tr / T) * (9 + 280 * h * Math.exp(-4.170 * (Math.pow((T / Tr),(-1 / 3)) - 1)));

    alpha = 8.686 * f * f * ((1.84 * (1E-11) * (pr / pa) * Math.sqrt(T / Tr)) + (Math.pow((T / Tr), (-5 / 2))) * (0.01275 * (Math.exp(-2239.1 / T)) * (frO / (frO * frO + f * f)) + 0.1068 * Math.exp(-3352 / T) * (frN / (frN * frN + f * f))));

    return alpha;
}


function recurseSearchAttenuationPoint(att, f, stepSize, hum, T, pa) {
    if (stepSize < FRQ_SEARCH_LIMIT)
        return f;
    else {
        var nextStepSize = stepSize/2;
        if (airabs(f, pa, T, hum) > att)
            return recurseSearchAttenuationPoint(att, f - nextStepSize, nextStepSize, hum, T, pa);
        else
            return recurseSearchAttenuationPoint(att, f + nextStepSize, nextStepSize, hum, T, pa)
    }
}

function search3dBpointNTP(dist, hum, T) {
    var att = 3/dist;
    return recurseSearchAttenuationPoint(att, 10000, 10000, hum, T, 101.325);
}

function linspace(start,stop,step) {
    var i;
    if (! step)
        step = 1;
    var array = [];
    var idx = 0;
    for (i=start; i<=stop; i += step) {
        array[idx] = i;
        idx += 1;
    }
    return array;
}

//
// Computes and draws everything
//
AirAbs.prototype.drawAll = function() {
    var frq, hum;
    var k, i;
    var dbPerM = [];
    var name;
    this.distance = -1;

    var div = document.getElementById(this.id);

    var T = Number(this.temperature) + 273.15;
    var p0 = Number(this.pressure) / 10;

    var layout = {
        title:'Attenuation of sound in air ',
        xaxis: {
            title: 'Frequency (Hz)'
        },
        yaxis: {
            title: 'dB / m',
            range: [-0.3, 0]
        },
        scene: {
            xaxis: {title: 'Frequency (Hz)'},
            yaxis: {title: 'Humidity (%)'},
            zaxis: {title: 'db/m', range: [-0.3, 0]}
        }
    };

    if (this.aaPlotMode == HUMIDITY) {
        layout.title = layout.title + "for different frequencies";
        layout.xaxis.title = 'Relative humidity (%)';
        frq = linspace(1000, 10000, 1000);
        hum = linspace(1, 100, 1);
        for (k=0; k<frq.length; k++) {
            dbPerM[k] = [];
            for (i = 0; i < hum.length; i++) {
                dbPerM[k][i] = this.distance * airabs(frq[k], p0, T, hum[i]);
            }
            name = Math.round(frq[k]/1000).toString() + "kHz";
            if (k==0)
                Plotly.newPlot(this.id, [{x: hum, y:dbPerM[k], name: name}], layout, {showLink: false});
            else
                Plotly.addTraces(div, {x: hum, y: dbPerM[k], name: name});
        }
    } else if (this.aaPlotMode == FREQUENCY) {
        layout.xaxis.type = 'log';
        layout.title = layout.title + "for different relative humidities";
        frq = linspace(200, 25000, 100);
        hum = linspace(10, 100, 10);
        for (k=0; k<hum.length; k++) {
            dbPerM[k] = [];
            for (i = 0; i < frq.length; i++) {
                dbPerM[k][i] = this.distance * airabs(frq[i], p0, T, hum[k]);
            }
            name = hum[k].toString() + "%";
            if (k==0)
                Plotly.newPlot(this.id, [{x: frq, y:dbPerM[k], name: name}], layout, {showLink: false});
            else
                Plotly.addTraces(div, {x: frq, y: dbPerM[k], name: name});
        }
    } else { // And here we come 3D plot!
        frq = linspace(20, 10000, 100);
        hum = linspace(5, 100, 1);
        for (k=0; k<hum.length; k++) {
            dbPerM[k] = [];
            for (i = 0; i < frq.length; i++) {
                dbPerM[k][i] = this.distance * airabs(frq[i], p0, T, hum[k]);
            }
        }
        Plotly.newPlot(this.id, [{x: frq, y: hum, z:dbPerM, type: 'surface'}], layout, {showLink: false});
    }

    updateInformationFields(this.informationFields);

    console.log("Nyt lasketaan ja piirretään.");
};

//
// Air absorption filter
//

var hannWindow = [];

function makeAAFilter(dist, N) {
    var i;
    var frqStep = (44100/2)/N;
    var frq = 0;
    var mag;
    var pa = 101.325;
    var T = 273.15+20;
    var hrel = 50;
    var magLin_r = [];
    var magLin_i = [];
    for (i=0;i<=N;i++) {
        mag = dist*airabs(frq, pa, T, hrel);
        magLin_r[i] = Math.pow(10,-mag/20);
        magLin_i[i] = 0;
        if ((i>0) && (i<N)) {
            magLin_r[2*N-i] = magLin_r[i];
            magLin_i[2*N-i] = -magLin_i[i];
        }
        frq += frqStep;
    }
    inverseTransform(magLin_r, magLin_i);
    var coeff = magLin_r;
    for (i=0;i<2*N;i++)
        coeff[i] = coeff[i] / (2*N);
    shiftAndWindow(coeff);
    return coeff;
}


function makeHannWindow(N) {
    if ((typeof hannWindow != 'undefined') && (hannWindow.length == N))
        return;
    else  {
        var i;
        for (i=0;i<N;i++) {
            hannWindow[i] = 0.5*(1-Math.cos(2*Math.PI*i/(N-1)));
        }
    }
}

function shiftAndWindow(s) {
    var N = s.length;
    var i;
    var tmp;

    makeHannWindow(N);
    for (i=0; i<(N/2); i++) {
        tmp = s[i];
        s[i] = hannWindow[i] * s[(N/2)+i];
        s[(N/2)+i] = hannWindow[(N/2)+i] * tmp;
    }
}
