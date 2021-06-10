export class Response {
  buffer: Float32Array;
  constructor(length: number){
    this.buffer = new Float32Array(length);
  }
  clear(start: number = 0, stop: number = this.buffer.length, value: number = 0){
    this.buffer.fill(value, start, stop);
  }
  extend(n: number){
    const newBuffer = new Float32Array(n);
    for(let i = 0; i<this.buffer.length; i++){
      newBuffer[i] = this.buffer[i];
    }
    this.buffer = newBuffer;
  }
  add(index: number, value: number){
    this.buffer[index] += value;
  }
  sum(){
    let sum = 0;
    for (let i=0; i<this.buffer.length; i++){
      sum += this.buffer[i];
    }
    return sum;
  }
  delayMultiplyAdd(source: Response, delay: number, multiplier: number){
    delay = Math.round(delay);
    const newLen = source.buffer.length + delay;
    if (newLen > this.buffer.length) {
        this.extend(newLen);
    }
    for (let i=0; i<source.buffer.length; i++) {
        this.buffer[i+delay] += (source.buffer[i] * multiplier);
    }
  }
}

export default Response;