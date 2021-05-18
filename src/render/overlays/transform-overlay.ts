import "./transform-overlay.css";
import roundTo from '../../common/round-to';

const createCell = (name: string, initialValue: number = 0) => {
  const elt = document.createElement("td");
  elt.id = "transform_overlay-" + name;
  elt.className = "transform_overlay-cell";
  elt.textContent = initialValue.toString();
  return elt;
};

export class TransformOverlay {
  dx!: number;
  dy!: number;
  dz!: number;
  elt: HTMLElement;
  parent: HTMLElement;
  cells: Map<string, HTMLElement>;
  constructor(selector: string) {
    this.cells = new Map<string, HTMLElement>();
    this.elt = document.createElement('div');
    this.parent = document.querySelector(selector) || document.querySelector("#editor-container") || document.body;
    this.parent.appendChild(this.elt);
    this.elt.className = "canvas_overlay canvas_overlay-transform_overlay hidden";
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    
    const diffrow = document.createElement('tr');
    const diffrowlabel = document.createElement("td");
    diffrowlabel.className = "transform_overlay-cell-label";
    diffrowlabel.innerText = "Δ";
    diffrow.appendChild(diffrowlabel);

    this.cells.set("dx", createCell("dx", 0));
    this.cells.set("dy", createCell("dy", 0));
    this.cells.set("dz", createCell("dz", 0));
    
    this.cells.forEach((elt, key) => {
      diffrow.appendChild(elt);
    });
    
    tbody.appendChild(diffrow);
    
    table.appendChild(tbody);
    
    this.elt.appendChild(table);
    
    this.setValues = this.setValues.bind(this);
    this.updateHTML = this.updateHTML.bind(this);
    
    this.setValues(0, 0, 0);
    
  }
  setValues(dx: number, dy: number, dz: number) {
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    
    this.updateHTML();
  }
  updateHTML() {
    this.cells.forEach((elt, key) => {
      elt.textContent = roundTo(this[key] || 0, 4).toString();
    })
  }
  show() {
    if (this.hidden) {
      this.elt.classList.remove('hidden');
    }
  }
  hide() {
    if (!this.hidden) {
      this.elt.classList.add('hidden');
    }
  }
  get hidden() {
    return this.elt.classList.contains("hidden");
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