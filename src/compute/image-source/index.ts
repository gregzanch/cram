// function computeImageSources(source, previousReflector, maxOrder) 
//     for each surface in geometry do 
//         if (not previousReflector) or 
//         ((inFrontOf(surface, previousReflector)) and (surface.normal dot previousReflector.normal < 0)) 
//             newSource = reflect(source, surface) 
//             sources[nofSources++] = newSource 
//             if (maxOrder > 0) 
//                 computeImageSources(newSource, surface, maxOrder - 1) 