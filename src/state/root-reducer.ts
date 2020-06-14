import { useReducer } from "react";
import Themes, { Theme } from "../themes";

export function updateTheme(theme: Theme) {
  return <const>{
    type: "UPDATE_THEME",
    theme
  };
}


export const initialState = {
  theme: Themes.LightTheme
};

type State = typeof initialState;
type Action = ReturnType<typeof updateTheme>;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "UPDATE_THEME":
      return { ...state, theme: Object.assign({}, action.theme) };
    default:
      return state;
  }
}

export default function useRootReducer(state = initialState) {
  return useReducer(reducer, state);
}
