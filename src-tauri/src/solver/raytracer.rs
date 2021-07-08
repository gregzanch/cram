
use crate::solver::Solver;

pub struct RayTracer {
    name: String,
}

impl Solver for RayTracer {
    fn new(name: String) -> Self {
        Self {
            name
        }
    }
}