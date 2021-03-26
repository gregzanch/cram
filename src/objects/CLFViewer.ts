

export class CLFViewer{
    clfViewerOverlayElement: HTMLElement;

    constructor(){
        this.clfViewerOverlayElement = document.querySelector("#clfviewer-overlay") || document.createElement("div");
        this.clfViewerOverlayElement.style.backgroundColor = "#FFFFFF";
    }

    hidePlot() {
        if (!this.clfViewerOverlayElement.classList.contains("clf_viewer_overlay-hidden")) {
          this.clfViewerOverlayElement.classList.add("clf_viewer_overlay-hidden");
        }
      }
    
      showPlot() {
        if (this.clfViewerOverlayElement.classList.contains("rlf_viewer_overlay-hidden")) {
            this.clfViewerOverlayElement.classList.remove("clf_viewer_overlay-hidden");
        }
    }


}