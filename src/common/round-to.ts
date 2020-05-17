export default function roundTo(v: number, n: number = 0){
  const mult = 10 ** n;
  return Math.round(v * mult) / mult;
}