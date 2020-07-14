type EndCondition = (element: HTMLElement | null) => boolean|null;

export function reverseTraverse(endCondition: EndCondition) {
  return function (startElement: HTMLElement): (HTMLElement | null) {
    let elt = startElement;
    while (elt.parentElement && !endCondition(elt.parentElement)) {
      elt = elt.parentElement;
    }
    return elt.parentElement;
  }
}

export default reverseTraverse;