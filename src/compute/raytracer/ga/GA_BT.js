//
// Beam-tracing
//
// (c) Lauri Savioja, 2016
//

GA.prototype.geometricBeamClippingAnimation = function(buttonElement) {
  if (!this.animation || this.animation.currentDraw == 0)
    this.makeFullBeamClippingAnimation();
  if (!this.animation.buttonElement) {
    this.animation.buttonElement = buttonElement;
    this.animation.buttonTitle = buttonElement.value;
  }
  this.drawAll();
  this.animation.draw();
  if (this.animation.currentDraw > 0) buttonElement.value = "Next step";
};

GA.prototype.makeFullBeamClippingAnimation = function() {
  let e;
  let OK = true;
  let origBeam;
  let clipperBeam;
  this.animation = new GA_animation(this);

  e = new GA_animationEvent();
  if (!this.sourceInFrontOfReflector(this.sources[0], 0)) {
    e.addReflector(0, this);
    e.annotate("Move the source upwards, please!");
    OK = false;
  } else {
    origBeam = this.newBeam(this.sources[0].loc, 0);
    e.addBeam(origBeam, this);
    e.addReflector(0, this);
    e.annotate("The original beam");
  }
  this.animation.addEvent(e);

  if (OK) {
    let clipper;
    for (clipper = 1; clipper < this.startVertices.length; clipper++) {
      e = new GA_animationEvent();

      if (!this.sourceInFrontOfReflector(this.sources[0], clipper)) {
        e.addReflector(clipper, this);
        e.annotate("Surface not facing the source.");
      } else {
        // OK for clipping!
        clipperBeam = this.newBeam(this.sources[0].loc, clipper);
        e.addBeam(clipperBeam, this, "#e00000");
        e.addReflector(clipper, this);
        e.annotate("Beam of the occluder");
        this.animation.addEvent(e);

        e = new GA_animationEvent();
        e.addBeam(origBeam, this);
        e.addBeam(clipperBeam, this, "#e00000");

        clipperBeam.intersect(origBeam, true);
        clipperBeam.computeLimitsFromAngles(
          this.startVertices[0],
          this.lineDirs[0]
        );

        e.addBeam(clipperBeam, this, "#000000", 5, [10, 10]);
        e.annotate("Intersection of the two beams");
        this.animation.addEvent(e);

        e = new GA_animationEvent();
        origBeam.substractLineSegment(
          this.startVertices[clipper],
          this.endVertices[clipper]
        );
        if (origBeam.angle > 0) {
          origBeam.computeLimitsFromAngles(
            this.startVertices[0],
            this.lineDirs[0]
          );

          e.addBeam(origBeam, this);
          e.annotate("Original beam after clipping");
        } else {
          e.annotate("Nothing left of the original beam!");
          OK = false;
        }
      }
      this.animation.addEvent(e);
    }

    if (OK) {
      e = new GA_animationEvent();

      e.addBeam(origBeam, this, "#00b000", 1, [3, 10]);
      origBeam.reflectSector(this.lineNormDirs[0], this.centers[0]);
      e.addBeam(origBeam, this);
      e.annotate("Final clipped beam after reflection!");
      this.animation.addEvent(e);
    }
  }
};
