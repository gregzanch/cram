const {cos} = Math;

export function scatteredEnergy(
  incomingEnergy: number,
  absorptionCoefficient: number,
  scatteringCoefficient: number,
  /**
   * fov angle of the receiver
   */
  gamma: number,
  /**
   * angle between the surface normal and the center of the receiver
   */
  theta: number,
  
) {
  return incomingEnergy
    * (1 - absorptionCoefficient)
    * scatteringCoefficient
    * (1 - cos(gamma / 2))
    * 2
    * cos(theta);
}