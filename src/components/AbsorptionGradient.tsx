import chroma from 'chroma-js';

export type Absorption = {
  "63": number;
  "125": number;
  "250": number;
  "500": number;
  "1000": number;
  "2000": number;
  "4000": number;
  "8000": number;
};
export const scale = chroma
  .scale(["black", "navy", "red", "yellow", "white"])
  .mode("lch")
  .correctLightness(true);

export function absorptionGradient(absorption: Absorption | number[]) {
  if (absorption instanceof Array) {
    const colors = absorption.map((x, i) => {
      const percentage = (100 * (i + 1)) / 9;
      const col = scale(absorption[i]);
      return `${col} ${Math.round(percentage)}%`;
    }).join(',');
    return `linear-gradient(90deg, ${colors})`;
  }
  else {
    const colors = [63, 125, 250, 500, 1000, 2000, 4000, 8000]
      .map((x, i) => {
        const percentage = (100 * (i + 1)) / 9;
        const col = scale(absorption[String(x)]);
        return `${col} ${Math.round(percentage)}%`;
      })
      .join(",");
    return `linear-gradient(90deg, ${colors})`;
  }
}

export default absorptionGradient;