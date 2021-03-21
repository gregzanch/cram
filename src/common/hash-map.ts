import hash from 'object-hash';

export class HashMap<T> {
  private map: Map<string, T> = new Map();
  constructor(values?: T[]){
    if(values){
      values.forEach(value => this.map.set(hash(value), value));
    }
  }
  get = this.map.get;
  keys = this.map.keys;
  values = this.map.values;
  entries = this.map.entries;
  forEach = this.map.forEach;
  add(value: T){
    this.map.set(hash(value), value);
  }
  clear(){
    this.map.clear();
  }
  delete(value: T){
    this.map.delete(hash(value));
  }
  has(value: T){
    this.map.has(hash(value));
  }
  get size(){
    return this.map.size
  }
}

export default HashMap;