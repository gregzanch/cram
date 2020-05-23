import { useReducer } from "react";
export default function useForceUpdate(): () => void {
  //@ts-ignore
  return useReducer(() => ({}), undefined)[1] as () => void;
}
