// modified from https://github.com/mrdoob/stats.js/

import "./Stats.css";

export interface StatsPanelProps {
  fg: string;
  bg: string;
  unit?: string;
  textColor?: string;
  width?: number;
  height?: number;
  padding?: number;
  fontSize?: number;
}

class StatsPanel {
  name: string;
  fg: string;
  bg: string;
  textColor: string;
  dom: HTMLCanvasElement;
  width: number;
  height: number;
  padding: number;
  fontSize: number;
  context: CanvasRenderingContext2D;
  pixelRatio: number;
  min: number;
  max: number;
  unit: string;
  dimmensions: {
    WIDTH: number;
    HEIGHT: number;
    TEXT_X: number;
    TEXT_Y: number;
    GRAPH_X: number;
    GRAPH_Y: number;
    GRAPH_WIDTH: number;
    GRAPH_HEIGHT: number;
  };
  canvas: HTMLCanvasElement;
  constructor(name: string, props: StatsPanelProps) {
    this.name = name;
    this.unit = props.unit || "";
    this.fg = props.fg;
    this.bg = props.bg;
    this.textColor = props.textColor || this.fg;
    this.min = Infinity;
    this.max = 0;
    
    this.pixelRatio = Math.round(window.devicePixelRatio || 1);

    this.width = props.width || 80;
    this.height = props.height || 48;
    this.fontSize = props.fontSize || 9;
    this.padding = 3;

    this.dimmensions = {
      WIDTH: this.width * this.pixelRatio,
      HEIGHT: this.height * this.pixelRatio,
      TEXT_X: this.padding * this.pixelRatio,
      TEXT_Y: this.padding * this.pixelRatio,
      GRAPH_X: this.padding * this.pixelRatio,
      GRAPH_Y: (this.fontSize + 2 * this.padding) * this.pixelRatio,
      GRAPH_WIDTH: (this.width - 2 * this.padding) * this.pixelRatio,
      GRAPH_HEIGHT: (this.height - (3 * this.padding + this.fontSize)) * this.pixelRatio
    }

    this.canvas = document.createElement("canvas")!;
    this.canvas.width = this.dimmensions.WIDTH;
    this.canvas.height = this.dimmensions.HEIGHT;
    this.canvas.setAttribute("class", "renderer-stats-panel");
    this.canvas.style.cssText = `width:${this.width}px;height:${this.height}px`;

    this.dom = this.canvas;

    this.context = this.canvas.getContext("2d")!;
    this.context.font = "regular " + this.fontSize * this.pixelRatio + "px Helvetica,Arial,sans-serif";
    this.context.textBaseline = "top";

    this.context.fillStyle = this.bg;
    this.context.fillRect(0, 0, this.dimmensions.WIDTH, this.dimmensions.HEIGHT);

    this.context.fillStyle = this.textColor;
    this.context.fillText(name, this.dimmensions.TEXT_X, this.dimmensions.TEXT_Y);

    this.context.fillStyle = this.fg;
    this.context.fillRect(this.dimmensions.GRAPH_X, this.dimmensions.GRAPH_Y, this.dimmensions.GRAPH_WIDTH, this.dimmensions.GRAPH_HEIGHT);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(this.dimmensions.GRAPH_X, this.dimmensions.GRAPH_Y, this.dimmensions.GRAPH_WIDTH, this.dimmensions.GRAPH_HEIGHT);
  }
  update(value: number, maxValue: number) {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, this.dimmensions.WIDTH, this.dimmensions.GRAPH_Y);
    this.context.fillStyle = this.textColor;
    this.context.fillText(
      `${this.name}: ${Math.round(value)} ${this.unit} [${Math.round(this.min)}-${Math.round(this.max)}]`,
      this.dimmensions.TEXT_X,
      this.dimmensions.TEXT_Y
    );

    this.context.fillStyle = this.fg;
    this.context.drawImage(
      this.canvas,
      this.dimmensions.GRAPH_X + this.pixelRatio,
      this.dimmensions.GRAPH_Y,
      this.dimmensions.GRAPH_WIDTH - this.pixelRatio,
      this.dimmensions.GRAPH_HEIGHT,
      this.dimmensions.GRAPH_X,
      this.dimmensions.GRAPH_Y,
      this.dimmensions.GRAPH_WIDTH - this.pixelRatio,
      this.dimmensions.GRAPH_HEIGHT
    );

    this.context.fillRect(this.dimmensions.GRAPH_X + this.dimmensions.GRAPH_WIDTH - this.pixelRatio, this.dimmensions.GRAPH_Y, this.pixelRatio, this.dimmensions.GRAPH_HEIGHT);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(
      this.dimmensions.GRAPH_X + this.dimmensions.GRAPH_WIDTH - this.pixelRatio,
      this.dimmensions.GRAPH_Y,
      this.pixelRatio,
      Math.round((1 - value / maxValue) * this.dimmensions.GRAPH_HEIGHT)
    );
  }
}




class Stats {
  REVISION: number;
  currentPanelIndex: number;
  container: HTMLElement;
  fpsPanel: StatsPanel;
  fpsPanelValue: number;
  memPanel?: StatsPanel;
  memPanelValue?: number;
  msPanel: StatsPanel;
  msPanelValue: number;
  beginTime: number;
  prevTime: number;
  frames: number;
  auxPanelUpdatePeriod: number;
  _displayStyle: number;
  DISPLAY_STYLES: {
    NONE: number;
    SINGLE: number;
    STACKED_X: number;
    STACKED_Y: number;
  };
  constructor() {
    this.DISPLAY_STYLES = { NONE: 0, SINGLE: 1, STACKED_X: 2, STACKED_Y: 3 };
    this.REVISION = 16;

    this.currentPanelIndex = 0;
    this.container = document.createElement("div")!;
    this.container.setAttribute("class", "renderer-stats-container");
    this.clickHandler = this.clickHandler.bind(this);
    this.container.addEventListener("click", this.clickHandler, false);

    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;

    const panelSharedProps = {
      fg: "#808080",
      bg: "#FCFCFC",
      textColor: "#182026",
      fontSize: 9,
      height: 48,
      width: 160,
      padding: 3
    };

    this.auxPanelUpdatePeriod = 500;

    this.fpsPanel = this.addPanel(new StatsPanel("Frame Rate", { ...panelSharedProps, unit: "Hz" }));
    this.fpsPanelValue = 0;
    this.msPanel = this.addPanel(new StatsPanel("Frame Time", { ...panelSharedProps, unit: "ms" }));
    this.msPanelValue = 0;
    if (self.performance && self.performance["memory"]) {
      this.memPanel = this.addPanel(new StatsPanel("Heap", { ...panelSharedProps, unit: "MB" }));
      this.memPanelValue = 0;
    }

    this.showSinglePanel(this.currentPanelIndex);

    this._displayStyle = this.DISPLAY_STYLES.STACKED_Y;
    this.displayStyle = this._displayStyle;
  }
  addPanel(panel: StatsPanel) {
    this.container.appendChild(panel.dom);
    return panel;
  }
  showSinglePanel(id: number) {
    for (let i = 0; i < this.container.children.length; i++) {
      if (i == id) {
        (this.container.children[i] as HTMLCanvasElement).classList.remove("renderer-stats-panel-hidden");
      }
      else {
        (this.container.children[i] as HTMLCanvasElement).classList.add("renderer-stats-panel-hidden");
      }
    }

    this.currentPanelIndex = id;
  }
  showAllPanels() {
    for (let i = 0; i < this.container.children.length; i++) {
      (this.container.children[i] as HTMLCanvasElement).classList.remove("renderer-stats-panel-hidden");
    }
  }
  set displayStyle(displayStyle: number) {
    switch (displayStyle) {
      case this.DISPLAY_STYLES.NONE:
        {
          this.hide();
          this._displayStyle = displayStyle;
        }
        break;
      case this.DISPLAY_STYLES.SINGLE:
        {
          this.unhide();
          this.container.classList.remove("renderer-stats-container-stacked-x");
          this.container.classList.remove("renderer-stats-container-stacked-y");
          this.showSinglePanel(this.currentPanelIndex);
          this._displayStyle = displayStyle;
        }
        break;
      case this.DISPLAY_STYLES.STACKED_X:
        {
          this.unhide();
          this.container.classList.remove("renderer-stats-container-stacked-y");
          this.container.classList.add("renderer-stats-container-stacked-x");
          this.showAllPanels();
          this._displayStyle = displayStyle;
        }
        break;
      case this.DISPLAY_STYLES.STACKED_Y:
        {
          this.unhide();
          this.container.classList.remove("renderer-stats-container-stacked-x");
          this.container.classList.add("renderer-stats-container-stacked-y");
          this.showAllPanels();
          this._displayStyle = displayStyle;
        }
        break;
      default:
        break;
    }
  }
  get displayStyle() {
    return this._displayStyle;
  }
  get hidden() {
    return this.container.classList.contains("renderer-stats-container-hidden");
  }
  hide() {
    if (!this.hidden) {
      this.container.classList.add("renderer-stats-container-hidden");
    }
  }
  unhide() {
    if (this.hidden) {
      this.container.classList.remove("renderer-stats-container-hidden");
    }
  }
  clickHandler(event: MouseEvent) {
    event.preventDefault();
    if (event.shiftKey) {
      const displayStyle = (this._displayStyle + 1) % Object.keys(this.DISPLAY_STYLES).length;
      this.displayStyle = displayStyle == this.DISPLAY_STYLES.NONE ? displayStyle + 1 : displayStyle;
    }
    else {
      if (this.displayStyle == this.DISPLAY_STYLES.SINGLE) {
        this.showSinglePanel((this.currentPanelIndex + 1) % this.container.children.length);
      }
    }
  }
  begin() {
    this.beginTime = (performance || Date).now();
  }
  end() {
    this.frames++;

    let time = (performance || Date).now();

    this.msPanelValue = time - this.beginTime;
    this.msPanel.update(this.msPanelValue, 200);

    if (time >= this.prevTime + this.auxPanelUpdatePeriod) {
      this.fpsPanelValue = (this.frames * 1000) / (time - this.prevTime);
      this.fpsPanel.update(this.fpsPanelValue, 100);

      this.prevTime = time;
      this.frames = 0;

      if (this.memPanel) {
        let memory = performance["memory"];
        this.memPanelValue = memory.usedJSHeapSize / 1048576;
        this.memPanel.update(this.memPanelValue, memory.jsHeapSizeLimit / 1048576);
      }
    }

    return time;
  }
  update() {
    this.beginTime = this.end();
  }
  get domElement() {
    return this.container;
  }
  set domElement(element: HTMLElement) {
    this.container = element;
  }
}

export {
  Stats,
  StatsPanel
}

export default Stats;
