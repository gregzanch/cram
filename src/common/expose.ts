export default function expose(item: any, target=window) {
    Object.assign(target, item);
}