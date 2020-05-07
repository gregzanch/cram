export default class Timer {
  private t1: number;
  dt: number;
  time: number;
  progress: number;
  length: number;
  onFinish: (...args) => void
  constructor(length: number, onFinish?: (...args) => void) {
    this.length = length;
    this.progress = 0;
    this.time = 0;
    this.dt = 0;
    this.t1 = 0;
    this.onFinish = onFinish || (() => { });
  }
  start() {
    this.t1 = Date.now();
  }
  tick() {
    const t2 = Date.now()
    this.dt = t2 - this.t1;
    this.time += this.dt;
    this.progress = this.time / this.length;
    this.t1 = t2;
    if (this.progress > 1.0) {
      this.progress = 1.0;
      this.onFinish(this);
    };
    return this.progress;
  }
}
