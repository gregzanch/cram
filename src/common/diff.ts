import _diff from 'fast-diff';

const translate = (n: number) => ["insert", "equal", "delete"][n + 1];

export default function diff(text1: string, text2: string, position?: number) { 
    let d = _diff(text1, text2, position);
    return d.map(x => [translate(x[0]), x[1]]);
}