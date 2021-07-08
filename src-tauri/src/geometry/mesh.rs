use nalgebra::Vector3;
use nalgebra::vector;
use std::error::Error;
use std::f32;
use std::fs::File;
use std::io::prelude::*;
use std::io::BufReader;
use std::iter::Iterator;

#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub struct Mesh {
    pub vertices: Vec<Vector3<f32>>,
    // Each face represents three indexes in the vertices vec
    pub faces: Vec<[usize; 3]>,

    // Track a bounding box to improve performance
    pub aabb_corner: Vector3<f32>,
    pub aabb_size: Vector3<f32>,
}

// Generate a bounding box for a set of vertices
fn generate_bounding_box(vertices: &[Vector3<f32>]) -> (Vector3<f32>, Vector3<f32>) {
    let mut min = vector![f32::MAX, f32::MAX, f32::MAX];
    let mut max = vector![f32::MIN, f32::MIN, f32::MIN];

    for vertex in vertices {
        if vertex.x < min.x {
            min.x = vertex.x;
        }
        if vertex.x > max.x {
            max.x = vertex.x;
        }
        if vertex.y < min.y {
            min.y = vertex.y;
        }
        if vertex.y > max.y {
            max.y = vertex.y;
        }
        if vertex.z < min.z {
            min.z = vertex.z;
        }
        if vertex.z > max.z {
            max.z = vertex.z;
        }
    }

    (min, max - min)
}

impl Mesh {
    // Load a mesh from a file
    pub fn from_file(file_name: &str) -> Result<Mesh, Box<Error>> {
        let mut vertices = vec![];
        let mut faces = vec![];
        let file_reader = BufReader::new(File::open(file_name)?);

        for l in file_reader.lines() {
            let line = l?;
            let mut parts = line.split_whitespace();
            let first = parts.next();
            if first.is_some() {
                match first.unwrap() {
                    "v" => {
                        let x: f32 = parts.next().ok_or("Incorrect file format")?.parse()?;
                        let y: f32 = parts.next().ok_or("Incorrect file format")?.parse()?;
                        let z: f32 = parts.next().ok_or("Incorrect file format")?.parse()?;
                        vertices.push(vector![x, y, z]);
                    }
                    "f" => {
                        let av: Vec<&str> = parts
                            .next()
                            .ok_or("Incorrect file format")?
                            .split("/")
                            .collect();
                        let bv: Vec<&str> = parts
                            .next()
                            .ok_or("Incorrect file format")?
                            .split("/")
                            .collect();
                        let cv: Vec<&str> = parts
                            .next()
                            .ok_or("Incorrect file format")?
                            .split("/")
                            .collect();
                        let a: usize = av[0].parse()?;
                        let b: usize = bv[0].parse()?;
                        let c: usize = cv[0].parse()?;
                        faces.push([a - 1, b - 1, c - 1]);
                    }
                    // Ignore all other lines
                    _ => {}
                }
            }
        }

        let (aabb_corner, aabb_size) = generate_bounding_box(&vertices);
        Ok(Mesh {
            vertices,
            faces,
            aabb_corner,
            aabb_size,
        })
    }
}
