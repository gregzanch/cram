import {useState} from "react";

export const useToggle = (initialState: boolean) => {
  const [state, setState] = useState(initialState);
  return [state, () => void setState(!state)] as [boolean, () => void];
}

export default useToggle;