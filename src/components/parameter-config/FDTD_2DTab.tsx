import React, { useState } from "react";
import Messenger from "../../messenger";
import FDTD_2D from "../../compute/2d-fdtd";
import { clamp } from "../../common/clamp";
import Slider, { SliderChangeEvent } from '../slider/Slider';
import PropertyRow from "./property-row/PropertyRow";
import Label from "../label/Label";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowButton from "./property-row/PropertyRowButton";
import PropertyRowCheckbox from "./property-row/PropertyRowCheckbox";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import Source, { getSources } from "../../objects/source";
import Receiver, { getReceivers } from "../../objects/receiver";
import { useSolver } from "../../store";



export const FDTD_2DTab = ({uuid}: {uuid: string}) => {
  const sources = getSources();
  const receivers = getReceivers();

  const solver = useSolver(state=>state.solvers[uuid] as FDTD_2D)
  
  const [colorBrightness, setColorBrightness] = useState(solver.uniforms['colorBrightness'].value);
  const [heightScale, setHeightScale] = useState(solver.mesh.scale.z);
  const [damping, setDamping] = useState(solver.heightmapVariable.material["uniforms"]['damping'].value);
  const [numPasses, setNumPasses] = useState(solver.numPasses);
  const [running, setRunning] = useState(solver.running);
  const [recording, setRecording] = useState(solver.recording);
  const [wireframeVisible, setWireframeVisible] = useState(solver.getWireframeVisible());
  const [viewFolderOpen, setViewFolderOpen] = useState(false);
  const [simParamFolderOpen, setSimParamFolderOpen] = useState(false);
  const [sourcesFolderOpen, setSourcesFolderOpen] = useState(false);
  const [FDTDsourceKeys, setFDTDSourcesKeys] = useState(solver.sourceKeys);
  const notIncludedSources = sources.filter(src => !solver.sources[src.uuid]);
  
  const [receiverFolderOpen, setReceiverFolderOpen] = useState(false);
  const [FDTDreceiverKeys, setFDTDreceiverKeys] = useState(solver.receiverKeys);
  const notIncludedReceiver = receivers.filter((rec) => !solver.receiverKeys[rec.uuid]);

  return (
    <div>
      <PropertyRowFolder
        id="view"
        label="View"
        open={viewFolderOpen}
        onOpenClose={() => setViewFolderOpen(!viewFolderOpen)}
      >
        <Slider
          id="colorBrightness"
          label="Color Brightness"
          labelPosition="left"
          tooltipText="Changes the color brightness"
          min={0}
          max={40}
          step={0.1}
          value={colorBrightness}
          hasToolTip={viewFolderOpen}
          onChange={(e: SliderChangeEvent) => {
            solver.uniforms["colorBrightness"].value = e.value;
            setColorBrightness(e.value);
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
          hasToolTip={viewFolderOpen}
          value={heightScale}
          onChange={(e: SliderChangeEvent) => {
            solver.mesh.scale.setZ(e.value == 0 ? 0.001 : e.value);
            setHeightScale(e.value);
          }}
        />
        <PropertyRow>
          <PropertyRowLabel hasToolTip={viewFolderOpen} label="Wireframe" tooltip="Display mesh as wirefame" />
          <PropertyRowCheckbox
            onChange={(e) => {
              solver.setWireframeVisible(e.value);
              setWireframeVisible(e.value);
            }}
            value={wireframeVisible}
          />
        </PropertyRow>
      </PropertyRowFolder>
      <PropertyRowFolder
        id="sim-params"
        label="Simulation Parameters"
        open={simParamFolderOpen}
        onOpenClose={() => setSimParamFolderOpen(!simParamFolderOpen)}
      >
        <Slider
          id="damping"
          label="Damping"
          labelPosition="left"
          tooltipText="Damping Coefficient"
          min={0.7}
          max={1.0}
          step={0.001}
          hasToolTip={simParamFolderOpen}
          value={damping}
          onChange={(e: SliderChangeEvent) => {
            solver.heightmapVariable.material["uniforms"]["damping"].value = e.value;
            setDamping(e.value);
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
          hasToolTip={simParamFolderOpen}
          value={numPasses}
          onChange={(e: SliderChangeEvent) => {
            solver.numPasses = e.value;
            setNumPasses(e.value);
          }}
        />
      </PropertyRowFolder>

      <PropertyRowFolder
        id="sim-sources"
        label="Sources"
        open={sourcesFolderOpen}
        onOpenClose={() => setSourcesFolderOpen(!sourcesFolderOpen)}
      >
        <PropertyRow>
          <PropertyRowLabel hasToolTip={sourcesFolderOpen} label="Source" tooltip="All available sources" />
          <select
            value={0}
            name="sources"
            onChange={(e) => {
              console.log(e.currentTarget.value);
              const source = sources.filter((x) => x.uuid === e.currentTarget.value);
              source[0] && solver.addSource(source[0]);
              setFDTDSourcesKeys(solver.sourceKeys);
            }}
          >
            <option value={0}>Select Source</option>
            {notIncludedSources.map((src) => {
              return (
                <option key={src.uuid} value={src.uuid}>
                  {src.name}
                </option>
              );
            })}
          </select>
        </PropertyRow>
        {FDTDsourceKeys.map((sourcekey, i) => {
          return (
            <PropertyRow key={sourcekey}>
              <PropertyRowLabel
                hasToolTip={false}
                label={solver.sources[sourcekey] && solver.sources[sourcekey].name}
              />
              <PropertyRowButton
                label="Remove"
                onClick={(e) => {
                  setFDTDSourcesKeys(solver.sourceKeys.filter((x) => x !== sourcekey));
                  solver.removeSource(sourcekey);
                }}
              />
            </PropertyRow>
          );
        })}
      </PropertyRowFolder>
      <PropertyRowFolder
        id="sim-receivers"
        label="Receivers"
        open={receiverFolderOpen}
        onOpenClose={() => setReceiverFolderOpen(!receiverFolderOpen)}
      >
        <PropertyRow>
          <PropertyRowLabel hasToolTip={receiverFolderOpen} label="Receiver" tooltip="All available receivers" />
          <select
            value={0}
            name="receivers"
            onChange={(e) => {
              console.log(e.currentTarget.value);
              const receiver = receivers.filter((x) => x.uuid === e.currentTarget.value);
              receiver[0] && solver.addReceiver(receiver[0]);
              setFDTDSourcesKeys(solver.receiverKeys);
            }}
          >
            <option value={0}>Select Receiver</option>
            {notIncludedReceiver.map((rec) => {
              return (
                <option key={rec.uuid} value={rec.uuid}>
                  {rec.name}
                </option>
              );
            })}
          </select>
        </PropertyRow>
        {FDTDreceiverKeys.map((receiverkey, i) => {
          return (
            <PropertyRow key={receiverkey}>
              <PropertyRowLabel hasToolTip={false} label={solver.receivers[receiverkey].name} />
              <PropertyRowButton
                label="Remove"
                onClick={(e) => {
                  setFDTDreceiverKeys(solver.receiverKeys.filter((x) => x !== receiverkey));
                  solver.removeReceiver(receiverkey);
                }}
              />
            </PropertyRow>
          );
        })}
      </PropertyRowFolder>
      <PropertyRow>
        <PropertyRowLabel label="Run/Pause" tooltip="Runs or pauses the simulation" />
        <PropertyRowButton
          onClick={(e) => {
            if (solver.running) {
              solver.stop();
              setRunning(false);
            } else {
              solver.run();
              setRunning(true);
            }
          }}
          label={running ? "Pause" : "Run"}
        />
      </PropertyRow>
      <PropertyRow>
        <PropertyRowLabel label="Recording" tooltip="Starts/stops recording" />
        <PropertyRowButton
          onClick={(e) => {
            if (solver.recording) {
              solver.recording = false;
              setRecording(false);
            } else {
              solver.recording = true;
              setRecording(true);
            }
          }}
          label={recording ? "Stop" : "Record"}
        />
      </PropertyRow>
      <PropertyRow>
        <PropertyRowLabel label="Clear" tooltip="Clears the grid" />
        <PropertyRowButton onClick={solver.clear} label={"Clear"} />
      </PropertyRow>
    </div>
  );
}


export default FDTD_2DTab;