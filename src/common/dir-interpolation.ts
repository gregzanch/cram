export function dirinterp(desiredPhi: number, desiredTheta: number, dirPoint1: dirDataPoint, dirPoint2: dirDataPoint, dirPoint3: dirDataPoint, dirPoint4: dirDataPoint): number{
    
    //      P4      P3      ^ phi
    //          d           |
    //      P1      P2      |______> theta

    // MARHSALL LONG ARCHITECTURAL ACOUSTICS - PG 710

    let desiredDir; 
    let X = dirPoint2.theta - dirPoint1.theta; 
    let Y = dirPoint3.phi - dirPoint2.phi;
    
    let deltaX = desiredTheta - dirPoint1.theta; 
    let deltaY = desiredPhi - dirPoint1.phi; 
    
    desiredDir = (dirPoint1.directivity*((X-deltaX)/X)*(deltaY/Y)) + (dirPoint4.directivity*((deltaX/X)*(deltaY/Y))) + (dirPoint2.directivity*((X-deltaX)/(X))*((Y-deltaY)/(Y))) + (dirPoint3.directivity*(deltaX/X)*((Y-deltaY)/(Y)));

    return desiredDir; 
}

export interface dirDataPoint {
    phi: number,
    theta: number, 
    directivity: number, 
}