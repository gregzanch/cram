// Example code that deserializes and serializes the model.
// extern crate serde;
// #[macro_use]
// extern crate serde_derive;
// extern crate serde_json;
//
// use generated_module::[object Object3D];
//
// fn main() {
//     let json = r#"{"answer": 42}"#;
//     let model: [object Object3D] = serde_json::from_str(&json).unwrap();
// }

use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Scene {
    #[serde(rename = "metadata")]
    pub metadata: Metadata,

    #[serde(rename = "geometries")]
    pub geometries: Vec<BufferGeometry>,

    #[serde(rename = "materials")]
    pub materials: Vec<Material>,

    #[serde(rename = "object")]
    pub object: Object3D,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BufferGeometry {
    #[serde(rename = "uuid")]
    pub uuid: String,

    #[serde(rename = "type")]
    pub geometry_type: GeometryType,

    #[serde(rename = "data")]
    pub data: Data,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Data {
    #[serde(rename = "attributes")]
    pub attributes: Attributes,

    #[serde(rename = "index")]
    pub index: Index,

    #[serde(rename = "boundingSphere")]
    pub bounding_sphere: BoundingSphere,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Attributes {
    #[serde(rename = "position")]
    pub position: Normal,

    #[serde(rename = "normal")]
    pub normal: Normal,

    #[serde(rename = "uv")]
    pub uv: Normal,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Normal {
    #[serde(rename = "itemSize")]
    pub item_size: i64,

    #[serde(rename = "type")]
    pub normal_type: NormalType,

    #[serde(rename = "array")]
    pub array: Vec<f64>,

    #[serde(rename = "normalized")]
    pub normalized: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BoundingSphere {
    #[serde(rename = "center")]
    pub center: Vec<f64>,

    #[serde(rename = "radius")]
    pub radius: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Index {
    #[serde(rename = "type")]
    pub index_type: IndexType,

    #[serde(rename = "array")]
    pub array: Vec<i64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Material {
    #[serde(rename = "uuid")]
    pub uuid: String,

    #[serde(rename = "type")]
    pub material_type: MaterialType,

    #[serde(rename = "name")]
    pub name: String,

    #[serde(rename = "color")]
    pub color: i64,

    #[serde(rename = "roughness")]
    pub roughness: f64,

    #[serde(rename = "metalness")]
    pub metalness: f32,

    #[serde(rename = "emissive")]
    pub emissive: f32,

    #[serde(rename = "side")]
    pub side: i64,

    #[serde(rename = "depthFunc")]
    pub depth_func: i64,

    #[serde(rename = "depthTest")]
    pub depth_test: bool,

    #[serde(rename = "depthWrite")]
    pub depth_write: bool,

    #[serde(rename = "stencilWrite")]
    pub stencil_write: bool,

    #[serde(rename = "stencilWriteMask")]
    pub stencil_write_mask: i64,

    #[serde(rename = "stencilFunc")]
    pub stencil_func: i64,

    #[serde(rename = "stencilRef")]
    pub stencil_ref: i64,

    #[serde(rename = "stencilFuncMask")]
    pub stencil_func_mask: i64,

    #[serde(rename = "stencilFail")]
    pub stencil_fail: i64,

    #[serde(rename = "stencilZFail")]
    pub stencil_z_fail: i64,

    #[serde(rename = "stencilZPass")]
    pub stencil_z_pass: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Metadata {
    #[serde(rename = "version")]
    pub version: f64,

    #[serde(rename = "type")]
    pub metadata_type: String,

    #[serde(rename = "generator")]
    pub generator: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Object3D {
    #[serde(rename = "uuid")]
    pub uuid: String,

    #[serde(rename = "type")]
    pub object_type: String,

    #[serde(rename = "name")]
    pub name: String,

    #[serde(rename = "userData")]
    pub user_data: Option<ObjectUserData>,

    #[serde(rename = "layers")]
    pub layers: i64,

    #[serde(rename = "matrix")]
    pub matrix: Vec<f32>,

    #[serde(rename = "children")]
    pub children: Option<Vec<Object3D>>,

    #[serde(rename = "geometry")]
    pub geometry: Option<String>,

    #[serde(rename = "material")]
    pub material: Option<String>,
}



#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ObjectUserData {
    #[serde(rename = "glTF2ExportSettings")]
    pub gl_tf2_export_settings: Option<GlTf2ExportSettings>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GlTf2ExportSettings {
    #[serde(rename = "export_animations")]
    pub export_animations: Option<i64>,

    #[serde(rename = "export_apply")]
    pub export_apply: Option<i64>,

    #[serde(rename = "export_extras")]
    pub export_extras: Option<i64>,

    #[serde(rename = "export_format")]
    pub export_format: Option<String>,

    #[serde(rename = "export_morph")]
    pub export_morph: Option<i64>,

    #[serde(rename = "export_skins")]
    pub export_skins: Option<i64>,

    #[serde(rename = "export_yup")]
    pub export_yup: Option<i64>,

    #[serde(rename = "use_selection")]
    pub use_selection: Option<i64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum NormalType {
    #[serde(rename = "Float32Array")]
    Float32Array,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum IndexType {
    #[serde(rename = "Uint16Array")]
    Uint16Array,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum GeometryType {
    #[serde(rename = "BufferGeometry")]
    BufferGeometry,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum MaterialType {
    #[serde(rename = "MeshStandardMaterial")]
    MeshStandardMaterial,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ChildType {
    #[serde(rename = "Mesh")]
    Mesh,
}
