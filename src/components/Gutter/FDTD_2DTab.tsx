import React, { useState } from "react";
import SliderInput from "../SliderInput";
import Messenger from "../../messenger";
import FDTD_2D from "../../compute/2d-fdtd";
import { clamp } from "../../common/clamp";

export interface FDTD_2DTabProps {
  messenger: Messenger;
  solver: FDTD_2D;
}

export default function FDTD_2DTab(props: FDTD_2DTabProps) {
  const [colorBrightness, setColorBrightness] = useState(props.solver.uniforms['colorBrightness'].value);
  const [heightScale, setHeightScale] = useState(props.solver.uniforms['heightScale'].value);
  const [damping, setDamping] = useState(props.solver.heightmapVariable.material["uniforms"]['damping'].value);
  const [numPasses, setNumPasses] = useState(props.solver.numPasses);
  const [running, setRunning] = useState(props.solver.running);
  return (
    <div>
      <div className="slider_with_number-container">
        <span className="slider_with_number-label">colorBrightness</span>
        <input
          type="range"
          id="colorBrightness-slider"
          className="slider_with_number-slider"
          value={colorBrightness}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            props.solver.uniforms["colorBrightness"].value = e.currentTarget.valueAsNumber;
            setColorBrightness(e.currentTarget.valueAsNumber);
          }}
          min={0}
          max={40}
          step={0.1}
        />
        <input
          type="number"
          id="colorBrightness-number"
          className="slider_with_number-number"
          value={colorBrightness}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.valueAsNumber > 0 && e.currentTarget.valueAsNumber < 40) {
              props.solver.uniforms["colorBrightness"].value = e.currentTarget.valueAsNumber;
            }
            setColorBrightness(e.currentTarget.valueAsNumber || "");
          }}
        />
      </div>

      <div className="slider_with_number-container">
        <span className="slider_with_number-label">damping</span>
        <input
          type="range"
          id="damping-slider"
          className="slider_with_number-slider"
          value={damping}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            props.solver.heightmapVariable.material["uniforms"]["damping"].value = e.currentTarget.valueAsNumber;
            setDamping(e.currentTarget.valueAsNumber);
          }}
          min={0.7}
          max={1}
          step={0.001}
        />
        <input
          type="number"
          id="damping-number"
          className="slider_with_number-number"
          value={damping}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.valueAsNumber > 0.7 && e.currentTarget.valueAsNumber < 1) {
              props.solver.heightmapVariable.material["uniforms"]["damping"].value = e.currentTarget.valueAsNumber;
            }
            setDamping(e.currentTarget.valueAsNumber || "");
          }}
        />
      </div>

      <div className="slider_with_number-container">
        <span className="slider_with_number-label">height scale</span>
        <input
          type="range"
          id="heightScale-slider"
          className="slider_with_number-slider"
          value={heightScale}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            props.solver.uniforms["heightScale"].value = e.currentTarget.valueAsNumber;
            setHeightScale(e.currentTarget.valueAsNumber);
          }}
          min={0}
          max={1}
          step={0.001}
        />
        <input
          type="number"
          id="heightScale-number"
          className="slider_with_number-number"
          value={heightScale}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.valueAsNumber > 0 && e.currentTarget.valueAsNumber < 1) {
              props.solver.uniforms["heightScale"].value = e.currentTarget.valueAsNumber;
            }
            setHeightScale(e.currentTarget.valueAsNumber || "");
          }}
        />
      </div>

      <div className="slider_with_number-container">
        <span className="slider_with_number-label">Number of Passes</span>
        <input
          type="range"
          id="numPasses-slider"
          className="slider_with_number-slider"
          value={numPasses}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            props.solver.numPasses = e.currentTarget.valueAsNumber;
            setNumPasses(e.currentTarget.valueAsNumber);
          }}
          min={1}
          max={20}
          step={1}
        />
        <input
          type="number"
          id="numPasses-number"
          className="slider_with_number-number"
          value={numPasses}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (e.currentTarget.valueAsNumber > 1 && e.currentTarget.valueAsNumber < 20) {
              props.solver.numPasses = Math.round(e.currentTarget.valueAsNumber);
            }
            setHeightScale(Math.round(e.currentTarget.valueAsNumber) || "");
          }}
        />
      </div>
      <div className="run_start-button">
        <button
          onClick={(e) => {
            if (props.solver.running) {
              props.solver.stop();
              setRunning(false);
            }
            else {
              props.solver.run();
              setRunning(true);
            }
          }}>
          {running ? "Stop" : "Run"}
        </button>
      </div>
    </div>
  );
}
