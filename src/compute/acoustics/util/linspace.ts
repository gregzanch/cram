export const linspace = (start: number, step: number, end: number): number[] => {
    const arr = [start];
    for (let i = 0; i < Math.floor((end - start) / step); i++){
        arr.push(arr[i]+step)
    }
    return arr;
}

