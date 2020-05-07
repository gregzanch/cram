import React, {useState} from "react";
import SliderInput from '../SliderInput';
import Messenger from "../../messenger";
import Renderer from "../../render/renderer";
import { clamp } from '../../common/clamp';

export interface RendererTabProps {
  messenger: Messenger;
}

export default function RendererTab(props: RendererTabProps) {
  const renderer = props.messenger.postMessage("GET_RENDERER")[0] as Renderer;
  const [fov, setFov] = useState(renderer.fov as number|string);
  return (
    <div>
      {/* <SliderInput id="fov" value={renderer.fov} onChange={(e: React.FormEvent<HTMLInputElement>)=>{renderer.fov = e.currentTarget.valueAsNumber}} min={1} max={90} step={0.001} /> */}
      <input type="range" id="fov" value={fov} onChange={(e: React.FormEvent<HTMLInputElement>) => {
        renderer.fov = e.currentTarget.valueAsNumber;
        renderer.camera.updateProjectionMatrix();
        setFov(e.currentTarget.valueAsNumber);
      }} min={1} max={90} step={0.001} />      
      <input type="number" id="fov" value={fov} onChange={(e: React.FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.valueAsNumber > 0 && e.currentTarget.valueAsNumber < 100) {
          renderer.fov = e.currentTarget.valueAsNumber;
          renderer.camera.updateProjectionMatrix();
        }
        setFov(e.currentTarget.valueAsNumber||"");
      }}/>
      
    </div>
  );
}