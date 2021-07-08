use crate::geometry::{aabb_collision, Mesh, Ray};
use nalgebra::{Unit, Vector3};
use roots::find_roots_quadratic;
use roots::Roots;
use std::f32;

const SPHERE_EPS: f32 = 0.0001;
const CYLINDER_EPS: f32 = 0.0001;
const CONE_EPS: f32 = 0.001;
const CLOSE_EPS: f32 = 0.001;
const TRIANGLE_EPS: f32 = 0.0000001;

#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub enum Primitive {
    Sphere,
    Cube,
    Cylinder,
    Cone,
    Mesh(Mesh),
    None,
}

impl Primitive {
    pub fn collides(
        &self,
        ray: &Ray,
        t_value: &mut f32,
        normal: &mut Vector3<f32>,
        uv: &mut [f32; 2],
    ) -> bool {
        match self {
            Primitive::Sphere => sphere_collides(ray, t_value, normal),
            Primitive::Cylinder => cylinder_collides(ray, t_value, normal, uv),
            Primitive::Cone => cone_collides(ray, t_value, normal),
            Primitive::Cube => cube_collides(ray, t_value, normal),
            Primitive::Mesh(mesh) => mesh_collides(ray, mesh, t_value, normal, uv),
            _ => false,
        }
    }
}

fn close(a: f32, b: f32) -> bool {
    let diff = (a - b).abs();
    diff < CLOSE_EPS
}

fn cube_collides(ray: &Ray, t_value: &mut f32, normal: &mut Vector3<f32>) -> bool {
    let roots = aabb_collision(
        ray,
        &Vector3::new(0.0, 0.0, 0.0),
        &Vector3::new(1.0, 1.0, 1.0),
    );

    *t_value = match roots {
        Roots::Two([t1, _]) => t1,
        Roots::One([t1]) => t1,
        _ => return false,
    };

    let collision_point = ray.src + (*t_value * ray.dir);
    // decide which side the point is on
    if close(collision_point.x, 0.0) {
        *normal = Vector3::new(-1.0, 0.0, 0.0);
    } else if close(collision_point.x, 1.0) {
        *normal = Vector3::new(1.0, 0.0, 0.0);
    } else if close(collision_point.y, 0.0) {
        *normal = Vector3::new(0.0, -1.0, 0.0);
    } else if close(collision_point.y, 1.0) {
        *normal = Vector3::new(0.0, 1.0, 0.0);
    } else if close(collision_point.z, 0.0) {
        *normal = Vector3::new(0.0, 0.0, -1.0);
    } else {
        *normal = Vector3::new(0.0, 0.0, 1.0);
    }

    true
}

fn sphere_collides(ray: &Ray, t_value: &mut f32, normal: &mut Vector3<f32>) -> bool {
    // Check if circle collides with unit sphere
    let l = &ray.src.coords;
    let udir: Unit<Vector3<f32>> = ray.unit_dir();
    let dir = udir.as_ref();
    
    let a = dir.dot(dir);
    let b = 2.0f32 * l.dot(dir);
    let c = l.dot(l) - 1.0f32;

    let closest_root = match find_roots_quadratic(a, b, c) {
        Roots::One([r1]) => r1,
        Roots::Two([r1, _]) => r1,
        _ => return false,
    };

    if closest_root > SPHERE_EPS {
        *t_value = closest_root;
        *normal = (ray.src + (closest_root * ray.dir)).coords;
        true
    } else {
        false
    }
}

fn triangle_collides(
    ray: &Ray,
    triangle: &[Vector3<f32>; 3],
    t_value: &mut f32,
    normal: &mut Vector3<f32>,
) -> bool {
    let edge1 = triangle[1] - triangle[0];
    let edge2 = triangle[2] - triangle[0];

    let face_normal = edge1.cross(&edge2).normalize();

    let q = ray.dir.cross(&edge2);
    let a = edge1.dot(&q);

    if (a.abs() <= TRIANGLE_EPS) || face_normal.dot(&ray.dir) >= 0.0 {
        return false;
    }

    let s = (ray.src - triangle[0]).coords / a;
    let r = s.cross(&edge1);

    let x = s.dot(&q);
    let y = r.dot(&ray.dir);
    let z = 1.0f32 - x - y;

    if x < 0.0 || y < 0.0 || z < 0.0 {
        return false;
    }

    *t_value = edge2.dot(&r);

    if *t_value < TRIANGLE_EPS {
        return false;
    }

    *normal = face_normal;
    true
}

fn cone_collides(ray: &Ray, t_value: &mut f32, normal: &mut Vector3<f32>) -> bool {
    let src = &ray.src;
    let dir = &ray.dir;

    let a = (dir.x * dir.x) + (dir.z * dir.z) - (dir.y * dir.y);
    let b = 2.0f32 * ((src.x * dir.x) + (src.z * dir.z) - (src.y * dir.y));
    let c = (src.x * src.x) + (src.z * src.z) - (src.y * src.y);

    let closest_root = match find_roots_quadratic(a, b, c) {
        Roots::One([r1]) => {
            let i_1 = ray.src + (r1 * ray.dir);
            if i_1.y >= 0.0 && i_1.y <= 1.0 {
                r1
            } else {
                return false;
            }
        }
        Roots::Two([r1, _r2]) => {
            let i_1 = ray.src + (r1 * ray.dir);
            if i_1.y >= 0.0 && i_1.y <= 1.0 {
                r1
            } else {
                return false;
            }
        }
        _ => return false,
    };

    if closest_root > CONE_EPS {
        let _intersection_point = ray.src + (closest_root * ray.dir);
        *t_value = closest_root;
        *normal = Vector3::new(0.0f32, 0.0f32, 1.0f32);
        true
    } else {
        false
    }
}

fn cylinder_collides(
    ray: &Ray,
    t_value: &mut f32,
    normal: &mut Vector3<f32>,
    uv: &mut [f32; 2],
) -> bool {
    let src = &ray.src;
    let dir = &ray.dir;

    let a = (dir.x * dir.x) + (dir.z * dir.z);
    let b = 2.0f32 * ((src.x * dir.x) + (src.z * dir.z));
    let c = (src.x * src.x) + (src.z * src.z) - 1.0f32;

    let mut intercept_cap = false;
    // closest cap
    let mut cap_normal = Vector3::new(0.0, 1.0, 0.0);
    let closest_root = match find_roots_quadratic(a, b, c) {
        Roots::One([r1]) => {
            let i_1 = ray.src + (r1 * ray.dir);
            if i_1.y >= 0.0 && i_1.y <= 1.0 {
                r1
            } else {
                return false;
            }
        }
        Roots::Two([r1, r2]) => {
            let i_1 = ray.src + (r1 * ray.dir);
            let i_2 = ray.src + (r2 * ray.dir);
            // Although r1 <= r2, no guarantees about y1 and y2
            let y1 = i_1.y;
            let y2 = i_2.y;

            if (y1 < 0.0 && y2 < 0.0) || (y1 > 1.0 && y2 > 1.0) {
                // Pass over or under the cylinder
                return false;
            } else if y1 >= 0.0 && y1 <= 1.0 {
                // First intercept hits the cylinder
                r1
            } else if y1 < 0.0 {
                // Hit the bottom cap
                cap_normal = Vector3::new(0.0, -1.0, 0.0);
                intercept_cap = true;
                -src.y / dir.y
            } else if y1 > 1.0 {
                // Hit the top cap
                intercept_cap = true;
                (1.0 - src.y) / dir.y
            } else {
                // Hit both caps
                // TODO
                return false;
            }
        }
        _ => return false,
    };

    if closest_root > CYLINDER_EPS {
        let intersection_point = ray.src + (closest_root * ray.dir);
        *t_value = closest_root;
        if intercept_cap {
            uv[0] = 0.0f32;
            uv[1] = 0.0f32;
            *normal = cap_normal;
        } else {
            *normal = Vector3::new(intersection_point.x, 0.0f32, intersection_point.z);
            let u = normal.x.atan2(normal.z) / f32::consts::PI + 2.0; //atan2(n.x, n.z) / (2*pi) + 0.5;
            let v = intersection_point.y; //atan2(n.x, n.z) / (2*pi) + 0.5;
                                          // println!("u: {}, v: {}", u, v);
            (*uv)[0] = u;
            (*uv)[1] = v;
        }
        true
    } else {
        false
    }
}

fn mesh_collides(
    ray: &Ray,
    mesh: &Mesh,
    t_value: &mut f32,
    normal: &mut Vector3<f32>,
    uv: &mut [f32; 2],
) -> bool {
    if aabb_collision(ray, &mesh.aabb_corner, &mesh.aabb_size) == Roots::No([]) {
        return false;
    }

    let mut smallest_t = f32::MAX;
    let mut smallest_normal = Vector3::new(0.0f32, 0.0f32, 0.0f32);
    let mut triangle = [smallest_normal, smallest_normal, smallest_normal];

    for face in mesh.faces.iter() {
        triangle[0] = mesh.vertices[face[0]];
        triangle[1] = mesh.vertices[face[1]];
        triangle[2] = mesh.vertices[face[2]];

        if triangle_collides(ray, &triangle, t_value, normal) {
            if *t_value < smallest_t {
                smallest_t = *t_value;
                smallest_normal = *normal;
            }
        }
    }

    if smallest_t < f32::MAX {
        let intersect = ray.src + (smallest_t * ray.dir);
        if intersect.x < 0.0 {
            uv[0] = 1.0 - intersect.x;
        } else {
            uv[0] = intersect.x;
        }
        uv[1] = intersect.z;
    }

    *normal = smallest_normal;
    *t_value = smallest_t;
    smallest_t < f32::MAX
}
