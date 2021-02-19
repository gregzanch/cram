export function cramangle2threejsangle(phiCRAM: number, thetaCRAM: number): number[]{

    // converts CRAM angle convention (in DEGREES) to ThreeJS angle convention (in RADIANS)
    // accounts for coordinate system and symbol convention shift 

    let thetaThreeJS: number = (360-phiCRAM)*(Math.PI/180); 
    let phiThreeJS: number = thetaCRAM*(Math.PI/180); 

    return [phiThreeJS, thetaThreeJS];


}