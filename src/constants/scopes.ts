export enum Scope {
  EDITOR = "EDITOR",
  NORMAL = "NORMAL",
  EDITOR_MOVING = "EDITOR_MOVING",
  KEY_BINDING_INPUT = "KEY_BINDING_INPUT",
}

declare global {
  type Scopes = keyof typeof Scope;
}



