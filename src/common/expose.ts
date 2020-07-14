export function expose(item: any, target=window) {
    Object.assign(target, item);
}

export default expose;