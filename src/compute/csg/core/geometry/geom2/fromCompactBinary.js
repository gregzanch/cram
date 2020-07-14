const fromSides = require('./fromSides')
const vec2 = require('../../math/vec2')

/** Reconstruct a Geom2 from the output of toCompactBinary().
 * @param {CompactBinary} bin - see toCompactBinary()
 * @returns {Geom2} new Geom2 object
 */
const fromCompactBinary = bin => {
  if (bin['class'] !== 'Geom2') throw new Error('Not a Geom2')
  let vertices = []
  let vertexData = bin.vertexData
  let numvertices = vertexData.length / 2
  let arrayindex = 0
  for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
    let x = vertexData[arrayindex++]
    let y = vertexData[arrayindex++]
    let pos = vec2.fromValues(x, y)
    let vertex = new Vertex2(pos)
    vertices.push(vertex)
  }
  let sides = []
  let numsides = bin.sideVertexIndices.length / 2
  arrayindex = 0
  for (let sideindex = 0; sideindex < numsides; sideindex++) {
    let vertexindex0 = bin.sideVertexIndices[arrayindex++]
    let vertexindex1 = bin.sideVertexIndices[arrayindex++]
    let side = new Side(vertices[vertexindex0], vertices[vertexindex1])
    sides.push(side)
  }
  let cag = fromSides(sides)
  cag.isCanonicalized = true
  return cag
}

module.exports = fromCompactBinary
