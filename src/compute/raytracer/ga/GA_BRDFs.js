//
// Acoustic Bidirectional Reflectance Distribution Function (BRDF) handling
//
// (c) Lauri Savioja, 2016
//

class BRDF {
  constructor(nofSlots) {
    let j;

    this.nofSlots = nofSlots;
    this.coeffs = [];
    for (j = 0; j < nofSlots; j++) this.coeffs[j] = [];
  }

  set(abs, diff) {
    const reflectedEnergy = 1 - abs;
    const specularEnergy = reflectedEnergy * (1 - diff);
    const diffusedEnergy = reflectedEnergy - specularEnergy;
    const diffusedEnergyPerSlot = diffusedEnergy / this.nofSlots; // Other than the specular direction
    let incoming;
    let outgoing;
    let specular;
    for (incoming = 0; incoming < this.nofSlots; incoming++)
      for (outgoing = 0; outgoing < this.nofSlots; outgoing++) {
        this.coeffs[incoming][outgoing] = diffusedEnergyPerSlot;
        specular = this.nofSlots - incoming - 1;
        if (outgoing == specular)
          this.coeffs[incoming][outgoing] += specularEnergy;
      }
  }

  randomize() {
    let incoming;
    let outgoing;
    let sum;
    for (incoming = 0; incoming < this.nofSlots; incoming++) {
      sum = 0;
      for (outgoing = 0; outgoing < this.nofSlots; outgoing++) {
        this.coeffs[incoming][outgoing] = Math.random();
        sum += this.coeffs[incoming][outgoing];
      }
      for (outgoing = 0; outgoing < this.nofSlots; outgoing++)
        this.coeffs[incoming][outgoing] = this.coeffs[incoming][outgoing] / sum;
    }
  }
}

GA.prototype.createBRDFs = function() {
  let i;
  this.BRDFs = [];
  for (i = 0; i < this.normals.length; i++) {
    this.BRDFs[i] = new BRDF(this.nofBRDFsectors);
    this.BRDFs[i].set(this.absorptionCoeffs[i], this.diffusionCoeffs[i]);
  }
};

GA.prototype.randomBRDF = function() {
  this.BRDFs[activeSurface].randomize();
  this.drawAll();
};

