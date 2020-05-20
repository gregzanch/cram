import React, { useState } from "react";
import Messenger from "../../../messenger";
import FDTD_2D from "../../../compute/2d-fdtd";
import { clamp } from "../../../common/clamp";
import Slider, { SliderChangeEvent } from '../../slider/Slider';
import PropertyRow from "../property-row/PropertyRow";
import Label from "../../label/Label";
import PropertyRowLabel from "../property-row/property-row-label/PropertyRowLabel";
import PropertyRowButton from "../property-row/property-row-button/PropertyRowButton";
import PropertyRowCheckbox from "../property-row/property-row-checkbox/PropertyRowCheckbox";

export interface FDTD_2DTabProps {
  messenger: Messenger;
  solver: FDTD_2D;
}

export default function FDTD_2DTab(props: FDTD_2DTabProps) {
  const [colorBrightness, setColorBrightness] = useState(props.solver.uniforms['colorBrightness'].value);
  const [heightScale, setHeightScale] = useState(props.solver.mesh.scale.z);
  const [damping, setDamping] = useState(props.solver.heightmapVariable.material["uniforms"]['damping'].value);
  const [numPasses, setNumPasses] = useState(props.solver.numPasses);
  const [running, setRunning] = useState(props.solver.running);
  const [recording, setRecording] = useState(props.solver.recording);
  return (
    <div>
      <Slider
        id="colorBrightness"
        label="Color Brightness"
        labelPosition="left"
        tooltipText="Changes the color brightness"
        min={0}
        max={40}
        step={0.1}
        value={colorBrightness}
        onChange={(e: SliderChangeEvent) => {
          props.solver.uniforms["colorBrightness"].value = e.value;
          setColorBrightness(e.value);
        }}
      />
      <Slider
        id="damping"
        label="Damping"
        labelPosition="left"
        tooltipText="Damping Coefficient"
        min={0.7}
        max={1.0}
        step={0.001}
        value={damping}
        onChange={(e: SliderChangeEvent) => {
          props.solver.heightmapVariable.material["uniforms"]["damping"].value = e.value;
          setDamping(e.value);
        }}
      />
      <Slider
        id="heightScale"
        label="Height Scale"
        labelPosition="left"
        tooltipText="Height Scale"
        min={0}
        max={1}
        step={0.001}
        value={heightScale}
        onChange={(e: SliderChangeEvent) => {
          props.solver.mesh.scale.setZ((e.value == 0) ? 0.001 : e.value);
          setHeightScale(e.value);
        }}
      />
      <Slider
        id="numPasses"
        label="Passes"
        labelPosition="left"
        tooltipText="Number of passes per frame"
        min={1}
        max={30}
        step={1}
        value={numPasses}
        onChange={(e: SliderChangeEvent) => {
          props.solver.numPasses = e.value;
          setNumPasses(e.value);
        }}
      />
      <PropertyRow>
        <PropertyRowLabel label="Run/Stop" tooltip="Turns the simulation on/off" />
        <PropertyRowButton
          onClick={(e) => {
            if (props.solver.running) {
              props.solver.stop();
              setRunning(false);
            } else {
              props.solver.run();
              setRunning(true);
            }
          }}
          label={running ? "Stop" : "Run"}
        />
      </PropertyRow>
      <PropertyRow>
        <PropertyRowLabel label="Recording" tooltip="Starts/stops recording" />
        <PropertyRowButton
          onClick={(e) => {
            if (props.solver.recording) {
              props.solver.recording = false;
              setRecording(false);
            } else {
              props.solver.recording = true;
              setRecording(true);
            }
          }}
          label={recording ? "Stop" : "Record"}
        />
      </PropertyRow>
    </div>
  );
}
