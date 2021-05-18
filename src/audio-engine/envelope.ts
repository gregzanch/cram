

import * as fft from '../compute/acoustics/fft/_fft';

export function max_width_factor(r: [number, number], step: number) {

    const base = Math.pow(Math.max(r[0], r[1]) / Math.min(r[0], r[1]), step);
    return (base - 1) / (base + 1);
}

export function width_factor(r: [number, number], bands: number, overlap: number) {
    if (overlap < 0 || 1 < overlap) {
        throw new Error("Overlap must be in the range 0-1.");
    }
    return max_width_factor(r, 1.0 / bands) * overlap;
}

////////////////////////////////////////////////////////////////////////////////

/// p = relative frequency
/// P = relative width
/// l = steepness

export function band_edge_impl(p: number, P: number, l: number) {
    return l != 0 ? Math.sin(Math.PI * band_edge_impl(p, P, l - 1) / 2)
                  : (((p / P) + 1) / 2);
}

export function lower_band_edge(p: number, P: number, l: number) {
    if (P < 0) {
        throw new Error("P must be greater or equal to 0.");
    }
    if (P == 0) {
        return 0 <= p ? 1.0 : 0.0;
    }
    return Math.pow(Math.sin(Math.PI * band_edge_impl(p, P, l) / 2), 2.0);
}

export function upper_band_edge(p: number, P: number, l: number) {
    if (P < 0) {
        throw new Error("P must be greater or equal to 0.");
    }
    if (P == 0) {
        return p < 0 ? 1.0 : 0.0;
    }
    return Math.pow(Math.cos(Math.PI * band_edge_impl(p, P, l) / 2), 2.0);
}

export function band_edge_frequency(band: number, bands: number, r: [number, number]) {
    const r0 = Math.min(r[0], r[1]);
    const r1 = Math.max(r[0], r[1]);
    return r0 * Math.pow(r1 / r0, band / bands);
}

export function band_centre_frequency(band: number, bands: number, r: [number, number]) {
    return band_edge_frequency(band * 2 + 1, bands * 2, r);
}

export function compute_bandpass_magnitude(frequency: number,
                                  r: [number, number],
                                  width_factor: number,
                                  l: number) {
    if (width_factor < 0 || 1 < width_factor) {
        throw new Error("Width_factor must be between 0 and 1.");
    }

    return compute_lopass_magnitude(frequency, Math.max(r[0], r[1]), width_factor, l) *
           compute_hipass_magnitude(frequency, Math.min(r[0], r[1]), width_factor, l);
}

export function compute_lopass_magnitude(frequency: number,
                                edge: number,
                                width_factor: number,
                                l: number) {
    if (width_factor < 0 || 1 < width_factor) {
        throw new Error("Width_factor must be between 0 and 1.");
    }

    const absolute_width = edge * width_factor;
    if (frequency < edge - absolute_width) {
        return 1;
    }
    if (frequency < edge + absolute_width) {
        return upper_band_edge(frequency - edge, absolute_width, l);
    }
    return 0;
}

export function compute_hipass_magnitude(frequency: number,
                                edge: number,
                                width_factor: number,
                                l: number) {
    if (width_factor < 0 || 1 < width_factor) {
        throw new Error("Width_factor must be between 0 and 1.");
    }

    const absolute_width = edge * width_factor;
    if (frequency < edge - absolute_width) {
        return 0;
    }
    if (frequency < edge + absolute_width) {
        return lower_band_edge(frequency - edge, absolute_width, l);
    }
    return 1;
}


function diracDelta(length: number = 8192, offset: number = 0){
    const samples = new Float32Array(Array(length).fill(0)); 
    samples[offset] = 1;
    return samples;
  }

const range = (n: number) => [...Array(n)].map((_,i)=>i);


/**
 * Perfect reconstruction filter for banded signals
 * @param samples banded signals
 * @returns 
 */
export function filterSignals(samples: Float32Array[]) {

    const bands = samples.length;
    const samplerate = 48000;
    const minf = 63;
    const maxf = 16000;
    const band_edges = range(bands+1).map(band => band_edge_frequency(band, bands, [minf, maxf])) 
    const lower_edges = band_edges.slice(0,-1);
    const upper_edges = band_edges.slice(1);
    
    const wf = width_factor([minf, maxf], bands, 1.0);
    const frequencies = range(samples[0].length).map(x=>x*samplerate/samples[0].length) 
    const filters = [] as any[];
    for(let i = 0; i<bands; i++){
        const filter = frequencies.map(f=>compute_bandpass_magnitude(f, [lower_edges[i], upper_edges[i]], wf, 0));
        const reflectedFilter = [
            ...filter.slice(0,filter.length>>1), 
            ...filter.slice(0,Math.floor(filter.length/2)).reverse(),
        ];
        // filters.push(reflectedFilter)
        filters.push(filter)
    }

    const filteredSamples = [] as any[];
    for(let i = 0; i<samples.length; i++){
        const real = new Float32Array(samples[i]);
        const imag = fft.newArrayOfZeros(samples[i].length)
        fft.transform(real, imag);

        for(let j = 0; j<real.length; j++){
            real[j]*=filters[i][j];
            imag[j]*=filters[i][j];
        }

        fft.inverseTransform(real, imag);
        filteredSamples.push(real);
    }

    return filteredSamples;
}






