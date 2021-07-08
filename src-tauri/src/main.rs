#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

pub mod objects;

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use objects::scene::Scene;



#[tauri::command]
fn print_scene(scene: Scene) {
  println!("passed in {:#?}", scene);
}

pub fn create_custom_menu_item(name: &str) -> CustomMenuItem<String> {
  let name_string = String::from(name);
  CustomMenuItem::new(name_string.to_lowercase(), name_string)
}

fn main() {

  let file = Submenu::new(
    String::from("File"), 
    Menu::new()
      .add_item(create_custom_menu_item("New"))
      .add_item(create_custom_menu_item("Open"))
      .add_item(create_custom_menu_item("Save"))
      .add_native_item(MenuItem::Separator)
      .add_item(create_custom_menu_item("Import"))
  );

  let edit = Submenu::new(
    String::from("Edit"), 
    Menu::new()
      .add_item(create_custom_menu_item("Undo"))
      .add_item(create_custom_menu_item("Redo"))
      .add_native_item(MenuItem::Separator)
      .add_item(create_custom_menu_item("Duplicate"))
      .add_native_item(MenuItem::Separator)
      .add_item(create_custom_menu_item("Cut"))
      .add_item(create_custom_menu_item("Copy"))
      .add_item(create_custom_menu_item("Paste"))
  );

  let add = Submenu::new(
    String::from("Add"),
    Menu::new()
      .add_item(create_custom_menu_item("Source"))
      .add_item(create_custom_menu_item("Receiver"))
      .add_native_item(MenuItem::Separator)
      .add_item(create_custom_menu_item("Ray Tracer"))
      .add_item(create_custom_menu_item("Image Source"))
      .add_item(create_custom_menu_item("2D-FDTD"))
      .add_item(create_custom_menu_item("Statistical RT"))
      .add_item(create_custom_menu_item("Energy Decay"))
  );

  let view = Submenu::new(
    String::from("View"),
    Menu::new()
      .add_item(create_custom_menu_item("Clear Local Storage"))
      .add_item(create_custom_menu_item("Toggle Renderer Stats"))
      .add_item(create_custom_menu_item("Toggle Results Panel"))
  );

  let examples = Submenu::new(
    String::from("Examples"),
    Menu::new()
      .add_item(create_custom_menu_item("Shoebox"))
      .add_item(create_custom_menu_item("Concord"))
      .add_item(create_custom_menu_item("Auditorium"))
  );

  let menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_submenu(file)
    .add_submenu(edit)
    .add_submenu(add)
    .add_submenu(view)
    .add_submenu(examples);

  tauri::Builder::default()
    .menu(menu)
    .invoke_handler(tauri::generate_handler![print_scene])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
