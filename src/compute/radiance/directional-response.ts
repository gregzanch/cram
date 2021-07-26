import { Response } from './response';
export class DirectionalResponse{
  /* number of directions */
  n: number;
  /* response in each direction */
  responses: Response[];

  /**
   * constructs a new DirectionalResponse
   * @param n number of directions
   * @param length length of the response
   */
  constructor(n: number, length: number) {
    this.n = n;
    this.responses = [];
    for (let i=0; i<n; i++) {
      this.responses[i] = new Response(length);
    }
  }
  clear(){
    this.responses.forEach(response=>response.clear());
  }

  sum(){
    return this.responses.reduce((a, b)=>a + b.sum(), 0);
  }

  delayMultiplyAdd(source: Response, delay: number, multPerDirection: number[], constScaler: number) {
    for (let i=0; i<this.n; i++) {
        this.responses[i].delayMultiplyAdd(source, delay, multPerDirection[i]*constScaler);
    }
  }
  accumulateFrom(source: DirectionalResponse) {
    for (let i=0; i<this.n; i++) {
      this.responses[i].buffer[0] = source.responses[i].sum();
    }
  }
}

