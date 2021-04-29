import examples, { Example } from ".";
import { on, emit } from "../messenger";
import { SaveState } from "../store";


declare global {
  interface EventTypes {
    OPEN_EXAMPLE: Example
  }
}

on("OPEN_EXAMPLE", (example) => {
  const json = examples[example] as SaveState;
  emit("NEW", (success) => {
    if(success){
      emit("RESTORE", { json });
    }
  })
})