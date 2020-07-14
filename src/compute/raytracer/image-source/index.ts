// function computeImageSources(source, previousReflector, maxOrder) 
//     for each surface in geometry do 
//         if (not previousReflector) or 
//         ((inFrontOf(surface, previousReflector)) and (surface.normal dot previousReflector.normal < 0)) 
//             newSource = reflect(source, surface) 
//             sources[nofSources++] = newSource 
//             if (maxOrder > 0) 
//                 computeImageSources(newSource, surface, maxOrder - 1) 
// function constructImageSourcePath(is, listener) 
//     originalIs = is 
//     path[is.order + 1] = listener.location 
//     for order = originalIs.order to 1 do 
//         intersectionPoint = intersect(path[order + 1], is.location, is.reflector) 
//         if (not intersectionPoint) 
//             return NO_VALID_PATH 
//         path[order] = intersectionPoint 
//         is = is.parent 
//     path[0] = is.location     // The original sound source location, i.e. the root of the image source tree 
//     originalIs.path = path 
//     return OK 