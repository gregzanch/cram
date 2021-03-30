const { pow, round, sin, cos, PI: pi } = Math;

export function wayverb_filters(ω_lowest, ω_highest, Nbands, sampleRate, totalSamples) {

  const x = (ω_highest / ω_lowest) ** (1 / Nbands);
  const ω_edges = [...Array(Nbands)].map((_, i) => ω_lowest * (ω_highest / ω_lowest) ** ((i) / Nbands));
  const df = sampleRate / totalSamples;


  const w = (x - 1) / (x + 1);
  const o = 1;
  const filters = ω_edges.map((ω_edge)=> {
    const P = ω_edge * o * w;
    const phi = (p) => 0.5 * (p / P + 1);
    const g_lower = (p) => {
      return pow(sin(pi / 2 * phi(p)), 2);
    }
    const g_upper = (p) => {
      return pow(cos(pi / 2 * phi(p)), 2);
    }
    const arr = Array(round(P / df)).fill(0);
    const lower = arr.map((_, i) => g_lower(i));
    const upper = arr.map((_, i) => g_upper(i));
    const sum = lower.map((x,i)=>x+upper[i]);
    return {lower, upper, sum};
  });


  filters[0] //?

  return w;
}


wayverb_filters(125, 16000, 8, 44100, 9600);