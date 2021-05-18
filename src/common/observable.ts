

type Destructor = () => void;
type Watcher<T> = (value: T, previousValue: T) => void;

export class Observable<T = any> {
  public constructor(private v: T){}
  private watchers = new Set<Watcher<T>>();
  public get value(): T {
    return this.v;
  }
  public set value(value: T) {
    const old = this.v;
    this.v = value;
    this.watchers.forEach((watcher) => watcher(this.v, old))
  }

  public watch(callback: Watcher<T>): Destructor {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  public toJSON(): string {
    return JSON.stringify(this.v);
  }

  public toString(): string {
    return String(this.v);
  }
}

const ensureArray = <T>(value: T|T[]) => value instanceof Array ? value : [value];

export default function observe<T = any>(value: T, watchers?: Watcher<T>[] | Watcher<T>){
  const observable = new Observable(value); 
  watchers && ensureArray(watchers).forEach(watcher => observable.watch(watcher));
  return observable;
}

