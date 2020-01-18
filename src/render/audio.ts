import ADSREnvelope from "adsr-envelope";

export interface AudioRendererParams {
    
}


export class AudioRenderer {
    context: AudioContext;
    buffersource: AudioBufferSourceNode;
    gain: GainNode;
    imag: Float32Array;
    real: Float32Array;
    customWave: PeriodicWave;
    adsr: ADSREnvelope;
    frequencies: number[];
    osc?: OscillatorNode;
    constructor() {
        this.context = new AudioContext({ sampleRate: 44100 });
        this.buffersource = this.context.createBufferSource();
        this.buffersource.connect(this.context.destination);
        
                
        
        this.frequencies = getFrequencies();

		this.imag = new Float32Array(this.frequencies.slice(-1)[0]);
		this.frequencies.forEach((f, i) => {
			this.imag[f] = Math.exp(2 - i / 3) - (0.5 * i) / 2 ** 6 + 0.125;
		});
		this.real = new Float32Array(this.imag.length); 
		this.customWave = this.context.createPeriodicWave(this.real, this.imag);
        
        
        
        this.gain = this.context.createGain();
		this.gain.gain.value = 0.15;

          
        let attackTime = 0.000015;
        let decayTime = 0.0025;
        let sustainTime = 0.5;
        let gateTime = attackTime+decayTime+sustainTime;
        let sustainLevel = 0.8;
        let peakLevel = 1.0;
        let releaseTime = 8;
        let releaseCurve = "lin";
        
        this.adsr = new ADSREnvelope({
            attackTime,
            decayTime,
            gateTime,
            sustainLevel,
            releaseTime,
            peakLevel,
            releaseCurve
        });

        this.gain.connect(this.context.destination);
        
    }
    hit(startTime=this.context.currentTime, stopTime=this.context.currentTime+this.adsr.duration) {
        
        const osc = this.context.createOscillator();
        osc.setPeriodicWave(this.customWave);
        osc.frequency.value = 1;
        
        osc.connect(this.gain);
        osc.start(startTime);
        osc.stop(stopTime);
        this.adsr.clone().applyTo(this.gain.gain, this.context.currentTime);
        
        osc.addEventListener("ended", e => {
            osc.disconnect(this.gain);
        })
        
    }
    
    
    setWave(imag: Float32Array, real?: Float32Array) {
    }
    
    play() {
        
    }
}

function getFrequencies() {
    return [
			2,
			10,
			29,
			57,
			94,
			140,
			195,
			260,
			334,
			417,
			510,
			611,
			722,
			843,
			972,
			1111,
			1259,
			1416,
			1582,
			1758,
			1943,
			2137,
			2340,
			2553,
			2775,
			3006,
			3247,
			3496,
			3755,
			4023,
			4301,
			4587,
			4883,
			5188,
			5503,
			5826,
			6159,
			6501,
			6853,
			7213,
			7583,
			7962,
			8350,
			8748,
			9155,
			9571,
			9996,
			10431,
			10875,
			11328
		];
}