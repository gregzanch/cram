export default function randBetween(low: number, high: number) {
  return low + Math.random() * (high - low);
}