
const { EPS, angleEPS } = require('../../constants')
const Vertex = require('../../core/math/Vertex3')
const Vector2D = require('../../core/math/Vector2')
const Polygon = require('../../core/math/Polygon3')
const { fnNumberSort } = require('../../core/utils')
const { fromPoints, fromPointsNoCheck } = require('../../core/CAGFactories')
const { extrudePolygon3 } = require('../shape2/extrusionUtils')
const { isShape2 } = require('../../utils/typeChecks')
const { unionSub } = require('../../../api/ops-booleans/union')
const canonicalize = require('../../core/utils/canonicalize')
const retesselate = require('../../core/utils/retesellate')
const union = require('../../../api/ops-booleans/union')
const CAG = require('../../core/CAG')
const fromPolygons = require('../../shape3/fromPolygons')

/**
 * Create the expanded shell of the solid:
 * All faces are extruded to get a thickness of 2*radius
 * Cylinders are constructed around every side
 * Spheres are placed on every vertex
 * unionWithThis: if true, the resulting solid will be united with 'this' solid;
 * the result is a true expansion of the solid
 * If false, returns only the shell
 * @param  {Float} radius
 * @param  {Integer} resolution
 * @param  {Boolean} unionWithThis
 */
const expand = (_csg, radius, resolution, unionWithThis) => {
  // const {sphere} = require('./primitives3d') // FIXME: circular dependency !
  let geometry = retesselate(_csg)
  let result
  if (unionWithThis) {
    result = geometry
  } else {
    result = shape3.create()
  }

  // first extrude all polygons:
  geometry.polygons.map(function (polygon) {
    let extrudevector = polygon.plane.normal.unit().times(2 * radius)
    let translatedpolygon = polygon.translate(extrudevector.times(-0.5))
    let extrudedface = extrudePolygon3(translatedpolygon, extrudevector)
    result = unionSub(result, extrudedface, false, false)
  })

  // Make a list of all unique vertex pairs (i.e. all sides of the solid)
  // For each vertex pair we collect the following:
  //   v1: first coordinate
  //   v2: second coordinate
  //   planenormals: array of normal vectors of all planes touching this side
  let vertexpairs = {} // map of 'vertex pair tag' to {v1, v2, planenormals}
  geometry.polygons.map(function (polygon) {
    let numvertices = polygon.vertices.length
    let prevvertex = polygon.vertices[numvertices - 1]
    let prevvertextag = prevvertex.getTag()
    for (let i = 0; i < numvertices; i++) {
      let vertex = polygon.vertices[i]
      let vertextag = vertex.getTag()
      let vertextagpair
      if (vertextag < prevvertextag) {
        vertextagpair = vertextag + '-' + prevvertextag
      } else {
        vertextagpair = prevvertextag + '-' + vertextag
      }
      let obj
      if (vertextagpair in vertexpairs) {
        obj = vertexpairs[vertextagpair]
      } else {
        obj = {
          v1: prevvertex,
          v2: vertex,
          planenormals: []
        }
        vertexpairs[vertextagpair] = obj
      }
      obj.planenormals.push(polygon.plane.normal)

      prevvertextag = vertextag
      prevvertex = vertex
    }
  })

  // now construct a cylinder on every side
  // The cylinder is always an approximation of a true cylinder: it will have <resolution> polygons
  // around the sides. We will make sure though that the cylinder will have an edge at every
  // face that touches this side. This ensures that we will get a smooth fill even
  // if two edges are at, say, 10 degrees and the resolution is low.
  // Note: the result is not retesselated yet but it really should be!
  for (let vertextagpair in vertexpairs) {
    let vertexpair = vertexpairs[vertextagpair]
    let startpoint = vertexpair.v1.pos
    let endpoint = vertexpair.v2.pos
    // our x,y and z vectors:
    let zbase = endpoint.minus(startpoint).unit()
    let xbase = vertexpair.planenormals[0].unit()
    let ybase = xbase.cross(zbase)

    // make a list of angles that the cylinder should traverse:
    let angles = []

    // first of all equally spaced around the cylinder:
    for (let i = 0; i < resolution; i++) {
      angles.push(i * Math.PI * 2 / resolution)
    }

    // and also at every normal of all touching planes:
    for (let i = 0, iMax = vertexpair.planenormals.length; i < iMax; i++) {
      let planenormal = vertexpair.planenormals[i]
      let si = ybase.dot(planenormal)
      let co = xbase.dot(planenormal)
      let angle = Math.atan2(si, co)

      if (angle < 0) angle += Math.PI * 2
      angles.push(angle)
      angle = Math.atan2(-si, -co)
      if (angle < 0) angle += Math.PI * 2
      angles.push(angle)
    }

    // this will result in some duplicate angles but we will get rid of those later.
    // Sort:
    angles = angles.sort(fnNumberSort)

    // Now construct the cylinder by traversing all angles:
    let numangles = angles.length
    let prevp1
    let prevp2
    let startfacevertices = []
    let endfacevertices = []
    let polygons = []
    for (let i = -1; i < numangles; i++) {
      let angle = angles[(i < 0) ? (i + numangles) : i]
      let si = Math.sin(angle)
      let co = Math.cos(angle)
      let p = xbase.times(co * radius).plus(ybase.times(si * radius))
      let p1 = startpoint.plus(p)
      let p2 = endpoint.plus(p)
      let skip = false
      if (i >= 0) {
        if (p1.distanceTo(prevp1) < EPS) {
          skip = true
        }
      }
      if (!skip) {
        if (i >= 0) {
          startfacevertices.push(new Vertex(p1))
          endfacevertices.push(new Vertex(p2))
          let polygonvertices = [
            new Vertex(prevp2),
            new Vertex(p2),
            new Vertex(p1),
            new Vertex(prevp1)
          ]
          let polygon = new Polygon(polygonvertices)
          polygons.push(polygon)
        }
        prevp1 = p1
        prevp2 = p2
      }
    }
    endfacevertices.reverse()
    polygons.push(new Polygon(startfacevertices))
    polygons.push(new Polygon(endfacevertices))
    let cylinder = fromPolygons(polygons)
    result = unionSub(result, cylinder, false, false)
  }

  // make a list of all unique vertices
  // For each vertex we also collect the list of normals of the planes touching the vertices
  let vertexmap = {}
  geometry.polygons.map(function (polygon) {
    polygon.vertices.map(function (vertex) {
      let vertextag = vertex.getTag()
      let obj
      if (vertextag in vertexmap) {
        obj = vertexmap[vertextag]
      } else {
        obj = {
          pos: vertex.pos,
          normals: []
        }
        vertexmap[vertextag] = obj
      }
      obj.normals.push(polygon.plane.normal)
    })
  })

  // and build spheres at each vertex
  // We will try to set the x and z axis to the normals of 2 planes
  // This will ensure that our sphere tesselation somewhat matches 2 planes
  for (let vertextag in vertexmap) {
    let vertexobj = vertexmap[vertextag]
    // use the first normal to be the x axis of our sphere:
    let xaxis = vertexobj.normals[0].unit()
    // and find a suitable z axis. We will use the normal which is most perpendicular to the x axis:
    let bestzaxis = null
    let bestzaxisorthogonality = 0
    for (let i = 1; i < vertexobj.normals.length; i++) {
      let normal = vertexobj.normals[i].unit()
      let cross = xaxis.cross(normal)
      let crosslength = cross.length()
      if (crosslength > 0.05) {
        if (crosslength > bestzaxisorthogonality) {
          bestzaxisorthogonality = crosslength
          bestzaxis = normal
        }
      }
    }
    if (!bestzaxis) {
      bestzaxis = xaxis.randomNonParallelVector()
    }
    let yaxis = xaxis.cross(bestzaxis).unit()
    let zaxis = yaxis.cross(xaxis)
    let _sphere = CSG.sphere({
      center: vertexobj.pos,
      radius: radius,
      resolution: resolution,
      axes: [xaxis, yaxis, zaxis]
    })
    result = unionSub(result, _sphere, false, false)
  }

  return result
}

/*
const expandedShell = (input, radius, resolution, unionWithThis) => {
  return isShape2 ? expandedShellOfCAG(input, radius, resolution) : shape3.expand(input, radius, resolution, unionWithThis)
} */

module.exports = expand
