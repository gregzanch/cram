import "./global-overlay.css";
import roundTo from "../../common/round-to";
import { uuid } from 'uuidv4';


export interface GlobalOverlayCell<T> {
  id: string;
  elt: HTMLElement,
  value: T,
  label: string;
  formatter: (value: T) => string;
}

export type GlobalOverlayCellOpts<T> = {
  id?: string;
  hidden?: boolean;
  formatter?: (value: T) => string;
}

export class GlobalOverlayCell<T>{
  constructor(label: string, value: T, opts: GlobalOverlayCellOpts<T>) {
    this.label = label;
    this.value = value;
    
    this.formatter = opts.formatter || ((value: T) => String(value));
    this.id = opts.id || label;
    this.elt = document.createElement('span');
    this.elt.setAttribute('class', "global_overlay-cell");
    const labelElt = document.createElement('span');
    labelElt.textContent = this.label + ":";
    labelElt.setAttribute("class", "global_overlay-label");
    this.elt.appendChild(labelElt);
    const valueElt = document.createElement('span');
    valueElt.textContent = this.formatter(this.value);
    valueElt.setAttribute("class", "global_overlay-value");
    this.elt.appendChild(valueElt);
    if (opts.hasOwnProperty('hidden')) {
      if (opts.hidden) {
        this.hide();
      }
    }
  }
  setValue(value: T) {
    this.value = value;
    this.valueElt.textContent = this.formatter(this.value);
  }
  show() {
    if (this.hidden) {
      this.elt.classList.remove("global_overlay-cell-hidden");
    }
  }
  hide() {
    if (!this.hidden) {
      this.elt.classList.add("global_overlay-cell-hidden");
    }
  }
  get hidden() {
    return this.elt.classList.contains("global_overlay-cell-hidden");
  }
  get labelElt() {
    return this.elt.children[0];
  }
  get valueElt() {
    return this.elt.children[1];
  }
}

export type AllowedType = number | string | boolean;

export class GlobalOverlay {
  elt: HTMLElement;
  parent: HTMLElement;
  cells: Map<string, GlobalOverlayCell<AllowedType>>;
  constructor(parent: HTMLElement) {
    this.cells = new Map<string, GlobalOverlayCell<AllowedType>>();
    this.elt = document.createElement("div");
    this.parent = parent || document.querySelector("#editor-container") || document.body;
    this.parent.appendChild(this.elt);
    this.elt.className = "canvas_overlay canvas_overlay-global_overlay";

    this.setCellValue = this.setCellValue.bind(this);

  }
  setCellValue(id: string, value: AllowedType) {
    if (this.cells.has(id)) {
      const cell = this.cells.get(id)!;
      cell.setValue(value);
    }
  }

  addCell(label: string, value: AllowedType, opts: GlobalOverlayCellOpts<AllowedType>) {
    const id = opts.id || uuid();
    if (!this.cells.has(id)) {
      const cell = new GlobalOverlayCell(label, value, opts);
      this.cells.set(id, cell);
      this.elt.appendChild(cell.elt);
      return cell;
    }
    else {
      console.warn(`GlobalOverlay already has cell with id ${id}`);
    }
  }
  
  removeCell(id: string) {
    if (this.cells.has(id)) {
      const cell = this.cells.get(id)!;
      this.elt.removeChild(cell.elt);
      this.cells.delete(id);
    }
  }
  
  show() {
    if (this.hidden) {
      this.elt.classList.remove("global_overlay-hidden");
    }
  }
  hide() {
    if (!this.hidden) {
      this.elt.classList.add("global_overlay-hidden");
    }
  }

  showCell(id: string) {
    if (this.cells.has(id)) {
      const cell = this.cells.get(id)!;
      cell.show();
    }
  }
  hideCell(id: string) {
    if (this.cells.has(id)) {
      const cell = this.cells.get(id)!;
      cell.hide();
    }
  }
  get hidden() {
    return this.elt.classList.contains("global_overlay-hidden");
  }
  set hidden(shouldHide: boolean) {
    if (shouldHide) {
      this.hide();
    }
  }
  get visible() {
    return !this.hidden;
  }
  set visible(shouldShow: boolean) {
    if (shouldShow) {
      this.show();
    }
  }
}
