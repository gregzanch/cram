pub mod raytracer;

pub trait Solver {
  fn new(name: String) -> Self;
}
