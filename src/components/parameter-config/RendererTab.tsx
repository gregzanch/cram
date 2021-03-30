import React, {useCallback, useState} from "react";
import Slider, { SliderChangeEvent } from '../slider/Slider';
import Messenger, { emit } from "../../messenger";

import { clamp } from '../../common/clamp';
import PropertyRow from "./property-row/PropertyRow";
import Label from "../label/Label";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowButton from "./property-row/PropertyRowButton";
import PropertyRowCheckbox from "./property-row/PropertyRowCheckbox";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import { postMessage } from "../../messenger";
import Renderer, {renderer} from '../../render/renderer';
import debounce from "../../common/debounce";
import useToggle from "../hooks/use-toggle";

export interface RendererTabProps {}

type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

type ReadonlyKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
}[keyof T];

type WritableRendererProperties = WritableKeys<Renderer>

function useRendererProperty<T extends WritableRendererProperties>(property: T, updateFn?: (renderer: Renderer) => void) {
  const [state, setState] = useState(renderer[property]);
  const changeHandler = useCallback((value: Renderer[T]) => {
    renderer[property] = value;
    if(updateFn) updateFn(renderer);
    setState(value); 
  }, [property]);
  return [state, changeHandler] as [Renderer[T], (value: Renderer[T]) => void];
}


type RendererSliderProps = {
  label: string;
  tooltip: string;
  property: WritableRendererProperties;
  updateFn?: (renderer: Renderer) => void;
  min: number;
  max: number;
  step: number;

}


const updateProjectionMatrix = (renderer: Renderer) => renderer.camera.updateProjectionMatrix();


const RendererSlider = ({label, property, tooltip, updateFn, min, max, step}: RendererSliderProps) => {
  const [state, setState] = useRendererProperty(property, updateFn);
  return <Slider
    id={property}
    label={label}
    labelPosition="left"
    hasToolTip
    tooltipText={tooltip}
    min={min}
    max={max}
    step={step}
    value={state}
    onChange={({value})=>setState(value)}
  />
}

type RendererToggleButtonProps = {
  label: string, 
  tooltip: string, 
  property: WritableRendererProperties, 
  onText: string, 
  offText: string, 
  updateFn?: (renderer: Renderer) => void;
}

const RendererToggleButton = ({label, tooltip, property, onText, offText, updateFn}: RendererToggleButtonProps) => {
  const [state, setState] = useRendererProperty(property, updateFn);
  return (
    <PropertyRow>
      <PropertyRowLabel
        label={label}
        tooltip={tooltip}
      />
      <PropertyRowButton
        onClick={() => setState(!state)}
        label={state ? onText : offText}
      />
    </PropertyRow>
  )
}


type RendererCheckboxProps = {
  label: string;
  tooltip: string;
  property: WritableRendererProperties;
  updateFn?: (renderer: Renderer) => void;
}

const RendererCheckbox = ({label, tooltip, property, updateFn}: RendererCheckboxProps) => {
  const [state, setState] = useRendererProperty(property, updateFn)
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} tooltip={tooltip} />
      <PropertyRowCheckbox value={state} onChange={e=>setState(e.value)} />
    </PropertyRow>
  )
}

const CameraProperties = () => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Camera Properties" open={open} onOpenClose={toggle}>
      <RendererSlider
        property="fov"
        label="Field of View"
        tooltip="Sets the perspective camera's field of view"
        min={1}
        max={90}
        step={0.1}
        updateFn={updateProjectionMatrix}
      />
      <RendererSlider
        property="zoom"
        label="Zoom"
        tooltip="Sets the orthographic camera's zoom"
        min={0.001}
        max={10}
        step={0.001}
        updateFn={updateProjectionMatrix}
      />
      <RendererSlider
        property="near"
        label="Near"
        tooltip="Sets the camera's near clipping distance"
        min={0.1}
        max={50}
        step={0.01}
        updateFn={updateProjectionMatrix}
      />
      <RendererSlider
        property="far"
        label="Far"
        tooltip="Sets the camera's far clipping distance"
        min={1}
        max={2000}
        step={1}
        updateFn={updateProjectionMatrix}
      />
      <RendererToggleButton 
        property="isOrtho" 
        label="Camera Style" 
        tooltip="Toggles between perspective/orthographic" 
        onText="Orthographic" 
        offText="Perspective" 
        updateFn={()=>emit("TOGGLE_CAMERA_ORTHO")} 
      />
    </PropertyRowFolder>
  )
}



const EnvironmentProperties = () => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Environment Properties" open={open} onOpenClose={toggle}>
      <RendererSlider
        property="fogDensity"
        label="Fog Density"
        tooltip="Sets the scene's fog density"
        min={0.001}
        max={0.1}
        step={0.001}
        updateFn={() => renderer.needsToRender = true}
      />
      <RendererCheckbox property="gridVisible" label="Grid" tooltip="Toggles the grid visibility" />
      <RendererCheckbox property="axisVisible" label="Axis" tooltip="Toggles the axis visibility" />
    </PropertyRowFolder>

  )
}

const EditorProperties = () => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Editor Properties" open={open} onOpenClose={toggle}>
      <RendererCheckbox label="Cursor" tooltip="Toggles the cursor" property="cursorVisible" />
    </PropertyRowFolder>
  )
}

export default function RendererTab() {
  return (
    <div>
      <CameraProperties />
      <EnvironmentProperties />
      <EditorProperties />
    </div>
  );
}