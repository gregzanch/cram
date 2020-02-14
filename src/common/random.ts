export default function random(min: number, max?: number) {
  const diff = max ? max - min : min;
  if (max) {
    return Math.random() * (max-min) + min;  
  }
  else {
    return Math.random() * min;
  }
}

export function randomInteger(min: number, max?: number) {
  return Math.round(random(min, max));
}