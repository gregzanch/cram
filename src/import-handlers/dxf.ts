import DxfParser from 'dxf-parser';
import THREE, {BufferGeometry, BufferAttribute} from 'three';
import { emit } from '../messenger';
import Container from '../objects/container';
import Room from '../objects/room';
import Surface from '../objects/surface';
import {useMaterial} from '../store/material-store';


const firstHalf = <T extends any[]>(arr: T) => arr.slice(0, arr.length >> 1);


const makeBufferGeometry = (position: number[], normals?: number[], texCoords?: number[]) => {
  const buffer = new BufferGeometry();
  buffer.setAttribute("position", new BufferAttribute(new Float32Array(position), 3, false));
  if(normals) buffer.setAttribute("normals", new BufferAttribute(new Float32Array(normals), 3, false));
  if(texCoords) buffer.setAttribute("texCoords", new BufferAttribute(new Float32Array(texCoords), 3, false));
  return buffer;
}

export function dxf(data: string){
  const defaultMaterial = [...useMaterial.getState().materials.values()][0];
  const parsed = new DxfParser().parseSync(data) as Dxf;
  const layerMap = new Map<string, Container>();
  parsed.entities.filter(x=>x.type==="POLYLINE").forEach((polyline,i)=>{
    const material = polyline.materialObjectHandle;
    const layer = polyline.layer;
    if(!layerMap.has(layer)){
      layerMap.set(layer, new Container(layer));
    }

    const vertices = [] as number[][];
    const indices = [] as number[][];
    polyline.vertices.forEach(vertex=>{
      if(vertex["faceA"]){
        indices.push([vertex["faceA"], vertex["faceB"], vertex["faceC"]].map(Math.abs).map(x=>x-1));
      } else {
        vertices.push([vertex.x,vertex.y,vertex.z!]);
      }
    });

    let vertices_i = (indices.flat().reverse() as number[]).map(index=>vertices[index]).flat() as number[];
    const geometry = makeBufferGeometry((vertices_i));
    geometry.computeVertexNormals(); 
    geometry.setAttribute("normals", geometry.getAttribute("normal")); 
    
    const acousticMaterial = defaultMaterial;
    const surface = new Surface(`untitled-${i}`, {
      acousticMaterial,
      geometry,
    });
    // emit("ADD_SURFACE", surface);
    layerMap.get(layer)!.add(surface);
  });
  const room = new Room("new room", {
    surfaces: [...layerMap.values()]
  });

  return room;

}

export interface Dxf {
  header:   Header;
  tables:   Tables;
  blocks:   Blocks;
  entities: DXFEntity[];
}

export interface Blocks {
  "*Model_Space":  ModelSpace;
  "*Paper_Space":  ModelSpace;
  "*Paper_Space0": ModelSpace;
  [key: string]: ModelSpace;
}

export interface ModelSpace {
  handle:      string;
  ownerHandle: string;
  layer:       string;
  name:        string;
  position:    Extmax;
  name2:       string;
  xrefPath:    string;
  paperSpace?: boolean;
  entities?:   ModelSpaceEntity[];
}

export interface ModelSpaceEntity {
  type:                          EntityType;
  vertices:                      Vertex[];
  handle:                        string;
  ownerHandle:                   string;
  layer:                         string;
  materialObjectHandle?:         string;
  colorIndex:                    number;
  color:                         number;
  shape?:                        boolean;
  includesCurveFitVertices?:     boolean;
  includesSplineFitVertices?:    boolean;
  is3dPolyline?:                 boolean;
  is3dPolygonMesh?:              boolean;
  is3dPolygonMeshClosed?:        boolean;
  isPolyfaceMesh?:               boolean;
  hasContinuousLinetypePattern?: boolean;
  extendedData?:                 ExtendedData;
  visible?:                      boolean;
  lineType?:                     string;
  width?:                        number;
}

export interface ExtendedData {
  applicationName: ApplicationName;
}

export type ApplicationName = string;

export type EntityType = "LINE"|"LWPOLYLINE"|"POLYLINE";

export interface Vertex {
  x:                     number;
  y:                     number;
  z?:                    number;
  type?:                 VertexType;
  handle?:               string;
  ownerHandle?:          string;
  layer?:                string;
  colorIndex?:           number;
  color?:                number;
  curveFittingVertex?:   boolean;
  curveFitTangent?:      boolean;
  splineVertex?:         boolean;
  splineControlPoint?:   boolean;
  threeDPolylineVertex?: boolean;
  threeDPolylineMesh?:   boolean;
  polyfaceMeshVertex?:   boolean;
  faceA?:                number;
  faceB?:                number;
  faceC?:                number;
}

export type VertexType = "VERTEX";

export interface Extmax {
  x: number;
  y: number;
  z: number;
}

export interface DXFEntity {
  type:                          EntityType;
  vertices:                      Vertex[];
  handle:                        string;
  ownerHandle:                   string;
  layer:                         string;
  materialObjectHandle:          string;
  colorIndex:                    number;
  color:                         number;
  shape?:                        boolean;
  includesCurveFitVertices?:     boolean;
  includesSplineFitVertices?:    boolean;
  is3dPolyline?:                 boolean;
  is3dPolygonMesh?:              boolean;
  is3dPolygonMeshClosed?:        boolean;
  isPolyfaceMesh?:               boolean;
  hasContinuousLinetypePattern?: boolean;
  extendedData?:                 ExtendedData;
  visible?:                      boolean;
}

export interface Header {
  $ACADVER:             string;
  $ACADMAINTVER:        number;
  $DWGCODEPAGE:         string;
  $REQUIREDVERSIONS:    number;
  $INSBASE:             Extmax;
  $EXTMIN:              Extmax;
  $EXTMAX:              Extmax;
  $LIMMIN:              Limmax;
  $LIMMAX:              Limmax;
  $ORTHOMODE:           number;
  $REGENMODE:           number;
  $FILLMODE:            number;
  $QTEXTMODE:           number;
  $MIRRTEXT:            number;
  $LTSCALE:             number;
  $ATTMODE:             number;
  $TEXTSIZE:            number;
  $TRACEWID:            number;
  $TEXTSTYLE:           string;
  $CLAYER:              string;
  $CELTYPE:             string;
  $CECOLOR:             number;
  $CELTSCALE:           number;
  $DISPSILH:            number;
  $DIMSCALE:            number;
  $DIMASZ:              number;
  $DIMEXO:              number;
  $DIMDLI:              number;
  $DIMRND:              number;
  $DIMDLE:              number;
  $DIMEXE:              number;
  $DIMTP:               number;
  $DIMTM:               number;
  $DIMTXT:              number;
  $DIMCEN:              number;
  $DIMTSZ:              number;
  $DIMTOL:              number;
  $DIMLIM:              number;
  $DIMTIH:              number;
  $DIMTOH:              number;
  $DIMSE1:              number;
  $DIMSE2:              number;
  $DIMTAD:              number;
  $DIMZIN:              number;
  $DIMBLK:              string;
  $DIMASO:              number;
  $DIMSHO:              number;
  $DIMPOST:             string;
  $DIMAPOST:            string;
  $DIMALT:              number;
  $DIMALTD:             number;
  $DIMALTF:             number;
  $DIMLFAC:             number;
  $DIMTOFL:             number;
  $DIMTVP:              number;
  $DIMTIX:              number;
  $DIMSOXD:             number;
  $DIMSAH:              number;
  $DIMBLK1:             string;
  $DIMBLK2:             string;
  $DIMSTYLE:            string;
  $DIMCLRD:             number;
  $DIMCLRE:             number;
  $DIMCLRT:             number;
  $DIMTFAC:             number;
  $DIMGAP:              number;
  $DIMJUST:             number;
  $DIMSD1:              number;
  $DIMSD2:              number;
  $DIMTOLJ:             number;
  $DIMTZIN:             number;
  $DIMALTZ:             number;
  $DIMALTTZ:            number;
  $DIMUPT:              number;
  $DIMDEC:              number;
  $DIMTDEC:             number;
  $DIMALTU:             number;
  $DIMALTTD:            number;
  $DIMTXSTY:            string;
  $DIMAUNIT:            number;
  $DIMADEC:             number;
  $DIMALTRND:           number;
  $DIMAZIN:             number;
  $DIMDSEP:             number;
  $DIMATFIT:            number;
  $DIMFRAC:             number;
  $DIMLDRBLK:           string;
  $DIMLUNIT:            number;
  $DIMLWD:              number;
  $DIMLWE:              number;
  $DIMTMOVE:            number;
  $DIMFXL:              number;
  $DIMFXLON:            number;
  $DIMJOGANG:           number;
  $DIMTFILL:            number;
  $DIMTFILLCLR:         number;
  $DIMARCSYM:           number;
  $DIMLTYPE:            string;
  $DIMLTEX1:            string;
  $DIMLTEX2:            string;
  $DIMTXTDIRECTION:     number;
  $LUNITS:              number;
  $LUPREC:              number;
  $SKETCHINC:           number;
  $FILLETRAD:           number;
  $AUNITS:              number;
  $AUPREC:              number;
  $MENU:                string;
  $ELEVATION:           number;
  $PELEVATION:          number;
  $THICKNESS:           number;
  $LIMCHECK:            number;
  $CHAMFERA:            number;
  $CHAMFERB:            number;
  $CHAMFERC:            number;
  $CHAMFERD:            number;
  $SKPOLY:              number;
  $TDCREATE:            number;
  $TDUCREATE:           number;
  $TDUPDATE:            number;
  $TDUUPDATE:           number;
  $TDINDWG:             number;
  $TDUSRTIMER:          number;
  $USRTIMER:            number;
  $ANGBASE:             number;
  $ANGDIR:              number;
  $PDMODE:              number;
  $PDSIZE:              number;
  $PLINEWID:            number;
  $SPLFRAME:            number;
  $SPLINETYPE:          number;
  $SPLINESEGS:          number;
  $HANDSEED:            string;
  $SURFTAB1:            number;
  $SURFTAB2:            number;
  $SURFTYPE:            number;
  $SURFU:               number;
  $SURFV:               number;
  $UCSBASE:             string;
  $UCSNAME:             string;
  $UCSORG:              Extmax;
  $UCSXDIR:             Extmax;
  $UCSYDIR:             Extmax;
  $UCSORTHOREF:         string;
  $UCSORTHOVIEW:        number;
  $UCSORGTOP:           Extmax;
  $UCSORGBOTTOM:        Extmax;
  $UCSORGLEFT:          Extmax;
  $UCSORGRIGHT:         Extmax;
  $UCSORGFRONT:         Extmax;
  $UCSORGBACK:          Extmax;
  $PUCSBASE:            string;
  $PUCSNAME:            string;
  $PUCSORG:             Extmax;
  $PUCSXDIR:            Extmax;
  $PUCSYDIR:            Extmax;
  $PUCSORTHOREF:        string;
  $PUCSORTHOVIEW:       number;
  $PUCSORGTOP:          Extmax;
  $PUCSORGBOTTOM:       Extmax;
  $PUCSORGLEFT:         Extmax;
  $PUCSORGRIGHT:        Extmax;
  $PUCSORGFRONT:        Extmax;
  $PUCSORGBACK:         Extmax;
  $USERI1:              number;
  $USERI2:              number;
  $USERI3:              number;
  $USERI4:              number;
  $USERI5:              number;
  $USERR1:              number;
  $USERR2:              number;
  $USERR3:              number;
  $USERR4:              number;
  $USERR5:              number;
  $WORLDVIEW:           number;
  $SHADEDGE:            number;
  $SHADEDIF:            number;
  $TILEMODE:            number;
  $MAXACTVP:            number;
  $PINSBASE:            Extmax;
  $PLIMCHECK:           number;
  $PEXTMIN:             Extmax;
  $PEXTMAX:             Extmax;
  $PLIMMIN:             Limmax;
  $PLIMMAX:             Limmax;
  $UNITMODE:            number;
  $VISRETAIN:           number;
  $PLINEGEN:            number;
  $PSLTSCALE:           number;
  $TREEDEPTH:           number;
  $CMLSTYLE:            string;
  $CMLJUST:             number;
  $CMLSCALE:            number;
  $PROXYGRAPHICS:       number;
  $MEASUREMENT:         number;
  $CELWEIGHT:           number;
  $ENDCAPS:             number;
  $JOINSTYLE:           number;
  $LWDISPLAY:           boolean;
  $INSUNITS:            number;
  $HYPERLINKBASE:       string;
  $STYLESHEET:          string;
  $XEDIT:               boolean;
  $CEPSNTYPE:           number;
  $PSTYLEMODE:          boolean;
  $FINGERPRINTGUID:     string;
  $VERSIONGUID:         string;
  $EXTNAMES:            boolean;
  $PSVPSCALE:           number;
  $OLESTARTUP:          boolean;
  $SORTENTS:            number;
  $INDEXCTL:            number;
  $HIDETEXT:            number;
  $XCLIPFRAME:          number;
  $HALOGAP:             number;
  $OBSCOLOR:            number;
  $OBSLTYPE:            number;
  $INTERSECTIONDISPLAY: number;
  $INTERSECTIONCOLOR:   number;
  $DIMASSOC:            number;
  $PROJECTNAME:         string;
  $CAMERADISPLAY:       boolean;
  $LENSLENGTH:          number;
  $CAMERAHEIGHT:        number;
  $STEPSPERSEC:         number;
  $STEPSIZE:            number;
  $3DDWFPREC:           number;
  $PSOLWIDTH:           number;
  $PSOLHEIGHT:          number;
  $LOFTANG1:            number;
  $LOFTANG2:            number;
  $LOFTMAG1:            number;
  $LOFTMAG2:            number;
  $LOFTPARAM:           number;
  $LOFTNORMALS:         number;
  $LATITUDE:            number;
  $LONGITUDE:           number;
  $NORTHDIRECTION:      number;
  $TIMEZONE:            number;
  $LIGHTGLYPHDISPLAY:   number;
  $TILEMODELIGHTSYNCH:  number;
  $CMATERIAL:           string;
  $SOLIDHIST:           number;
  $SHOWHIST:            number;
  $DWFFRAME:            number;
  $DGNFRAME:            number;
  $REALWORLDSCALE:      boolean;
  $INTERFERECOLOR:      number;
  $CSHADOW:             number;
  $SHADOWPLANELOCATION: number;
}

export interface Limmax {
  x: number;
  y: number;
}

export interface Tables {
  viewPort: TablesViewPort;
  lineType: LineType;
  layer:    Layer;
}

export interface Layer {
  handle:      string;
  ownerHandle: string;
  layers:      Layers;
}

export interface Layers {
  [key: string]: {
    name:       string;
    frozen:     boolean;
    visible:    boolean;
    colorIndex: number;
    color:      number;
  };
}



export interface LineType {
  handle:      string;
  ownerHandle: string;
  lineTypes:   LineTypes;
}

export interface LineTypes {
  ByBlock:    ByBlock;
  ByLayer:    ByBlock;
  Continuous: ByBlock;
}

export interface ByBlock {
  name:          string;
  description:   string;
  patternLength: number;
}

export interface TablesViewPort {
  handle:      string;
  ownerHandle: string;
  viewPorts:   ViewPortElement[];
}

export interface ViewPortElement {
  ownerHandle:             string;
  name:                    string;
  lowerLeftCorner:         Limmax;
  upperRightCorner:        Limmax;
  center:                  Limmax;
  snapBasePoint:           Limmax;
  snapSpacing:             Limmax;
  gridSpacing:             Limmax;
  viewDirectionFromTarget: Extmax;
  viewTarget:              Extmax;
  lensLength:              number;
  frontClippingPlane:      number;
  backClippingPlane:       number;
  snapRotationAngle:       number;
  viewTwistAngle:          number;
  renderMode:              number;
  ucsOrigin:               Extmax;
  ucsXAxis:                Extmax;
  ucsYAxis:                Extmax;
  orthographicType:        number;
  defaultLightingOn:       boolean;
  ambientColor:            number;
}
