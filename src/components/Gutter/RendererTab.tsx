import React, {useState} from "react";
import SliderInput from '../slider-input/SliderInput';
import Messenger from "../../messenger";
import Renderer from "../../render/renderer";
import { clamp } from '../../common/clamp';

export interface RendererTabProps {
  messenger: Messenger;
}

export default function RendererTab(props: RendererTabProps) {
  const renderer = props.messenger.postMessage("GET_RENDERER")[0] as Renderer;
  const [fov, setFov] = useState(renderer.fov as number|string);
  const [zoom, setZoom] = useState(renderer.zoom as number | string);
  const [isOrtho, setIsOrtho] = useState(renderer.isOrtho);
  const [gridVisible, setGridVisible] = useState(renderer.gridVisible);
  const [axesVisible, setAxesVisible] = useState(renderer.axesVisible);
  return (
    <div>
      {/* <SliderInput id="fov" value={renderer.fov} onChange={(e: React.FormEvent<HTMLInputElement>)=>{renderer.fov = e.currentTarget.valueAsNumber}} min={1} max={90} step={0.001} /> */}
      <div className="slider_with_number-container">
        <span className="slider_with_number-label">FOV</span>
        <input
          type="range"
          id="fov-slider"
          className="slider_with_number-slider"
          value={fov}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            renderer.fov = e.currentTarget.valueAsNumber;
            renderer.camera.updateProjectionMatrix();
            setFov(e.currentTarget.valueAsNumber);
          }}
          min={1}
          max={90}
          step={0.001}
        />
        <input
          type="number"
          id="fov-number"
          className="slider_with_number-number"
          value={fov}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.valueAsNumber > 0 && e.currentTarget.valueAsNumber < 100) {
              renderer.fov = e.currentTarget.valueAsNumber;
              renderer.camera.updateProjectionMatrix();
            }
            setFov(e.currentTarget.valueAsNumber || "");
          }}
        />
      </div>
      <div className="slider_with_number-container">
        <span className="slider_with_number-label">Zoom</span>
        <input
          type="range"
          id="zoom-slider"
          className="slider_with_number-slider"
          value={zoom}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            renderer.camera.zoom = e.currentTarget.valueAsNumber;
            renderer.camera.updateProjectionMatrix();
            setZoom(e.currentTarget.valueAsNumber);
          }}
          min={0.0001}
          max={10}
          step={0.001}
        />
        <input
          type="number"
          id="zoom-number"
          value={zoom}
          className="slider_with_number-number"
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.valueAsNumber > 0.0001 && e.currentTarget.valueAsNumber < 10) {
              renderer.camera.zoom = e.currentTarget.valueAsNumber;
              renderer.camera.updateProjectionMatrix();
            }
            setZoom(e.currentTarget.valueAsNumber || "");
          }}
        />
      </div>
      <div className="ortho-button">
        <button
          onClick={(e) => {
            setIsOrtho(!isOrtho);
            props.messenger.postMessage("TOGGLE_CAMERA_ORTHO");
          }}>
          {isOrtho ? "Perspective" : "Orthographic"}
        </button>
      </div>
      <div className="orientation-buttons">
        <button onClick={(e) => props.messenger.postMessage("LOOK_ALONG_AXIS", "+x")}>+X</button>
        <button onClick={(e) => props.messenger.postMessage("LOOK_ALONG_AXIS", "-x")}>-X</button>
        <button onClick={(e) => props.messenger.postMessage("LOOK_ALONG_AXIS", "+y")}>+Y</button>
        <button onClick={(e) => props.messenger.postMessage("LOOK_ALONG_AXIS", "-y")}>-Y</button>
        <button onClick={(e) => props.messenger.postMessage("LOOK_ALONG_AXIS", "+z")}>+Z</button>
        <button onClick={(e) => props.messenger.postMessage("LOOK_ALONG_AXIS", "-z")}>-Z</button>
      </div>
      <div className="grid-checkbox">
        <span>Grid</span>
        <input
          type="checkbox"
          onChange={(e) => {
            const checked = e.currentTarget.checked;
            renderer.gridVisible = checked;
            setGridVisible(renderer.gridVisible);
          }}
          checked={gridVisible}
        />
      </div>
      <div className="axes-checkbox">
        <span>Axes</span>
        <input
          type="checkbox"
          onChange={(e) => {
            const checked = e.currentTarget.checked;
            renderer.axesVisible = checked;
            setAxesVisible(renderer.axesVisible);
          }}
          checked={axesVisible}
        />
      </div>
    </div>
  );
}