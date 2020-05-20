import React, {useState} from "react";
import Slider, { SliderChangeEvent } from '../../slider/Slider';
import Messenger from "../../../messenger";
import Renderer from "../../../render/renderer";
import { clamp } from '../../../common/clamp';
import PropertyRow from "../property-row/PropertyRow";
import Label from "../../label/Label";
import PropertyRowLabel from "../property-row/property-row-label/PropertyRowLabel";
import PropertyRowButton from "../property-row/property-row-button/PropertyRowButton";
import PropertyRowCheckbox from "../property-row/property-row-checkbox/PropertyRowCheckbox";

export interface RendererTabProps {
  messenger: Messenger;
}

export default function RendererTab(props: RendererTabProps) {
  const renderer = props.messenger.postMessage("GET_RENDERER")[0] as Renderer;
  const [fov, setFov] = useState(renderer.fov as number);
  const [zoom, setZoom] = useState(renderer.zoom as number);
  const [near, setNear] = useState(renderer.near as number);
  const [far, setFar] = useState(renderer.far as number);
  const [isOrtho, setIsOrtho] = useState(renderer.isOrtho);
  const [gridVisible, setGridVisible] = useState(renderer.gridVisible);
  const [axisVisible, setAxisVisible] = useState(renderer.axisVisible);
  return (
    <div>
      <Slider
        id="fov"
        label="Field of View"
        labelPosition="left"
        tooltipText="Sets the perspective camera's field of view"
        min={1}
        max={90}
        step={0.1}
        value={fov}
        onChange={(e: SliderChangeEvent) => {
          renderer.fov = e.value;
          renderer.camera.updateProjectionMatrix();
          setFov(e.value);
        }}
      />
      <Slider
        id="zoom"
        label="Zoom"
        labelPosition="left"
        tooltipText="Sets the orthographic camera's zoom"
        min={0.001}
        max={10}
        step={0.001}
        value={zoom}
        onChange={(e: SliderChangeEvent) => {
          renderer.zoom = e.value;
          renderer.camera.updateProjectionMatrix();
          setZoom(e.value);
        }}
      />
      <Slider
        id="near"
        label="Near"
        labelPosition="left"
        tooltipText="Sets the camera's near clipping distance"
        min={0.1}
        max={50}
        step={0.01}
        value={near}
        onChange={(e: SliderChangeEvent) => {
          renderer.near = e.value;
          renderer.camera.updateProjectionMatrix();
          setNear(e.value);
        }}
      />
      <Slider
        id="far"
        label="Far"
        labelPosition="left"
        tooltipText="Sets the camera's far clipping distance"
        min={1}
        max={2000}
        step={1}
        value={far}
        onChange={(e: SliderChangeEvent) => {
          renderer.far = e.value;
          renderer.camera.updateProjectionMatrix();
          setFar(e.value);
        }}
      />
      <PropertyRow>
        <PropertyRowLabel label="Camera Style" tooltip="Toggles between perspective and orthographic cameras" />
        <PropertyRowButton
          onClick={(e) => {
            setIsOrtho(!isOrtho);
            props.messenger.postMessage("TOGGLE_CAMERA_ORTHO");
          }}
          label={isOrtho ? "Orthographic" : "Perspective"}
        />
      </PropertyRow>

      <PropertyRow>
        <PropertyRowLabel label="Grid" tooltip="Toggles the grid" />
        <PropertyRowCheckbox
          onChange={(e) => {
            renderer.gridVisible = e.currentTarget.checked;
            setGridVisible(renderer.gridVisible);
          }}
          checked={gridVisible}
        />
      </PropertyRow>

      <PropertyRow>
        <PropertyRowLabel label="Axis" tooltip="Toggles the axis" />
        <PropertyRowCheckbox
          onChange={(e) => {
            renderer.axisVisible = e.currentTarget.checked;
            setAxisVisible(renderer.axisVisible);
          }}
          checked={axisVisible}
        />
      </PropertyRow>
    </div>
  );
}