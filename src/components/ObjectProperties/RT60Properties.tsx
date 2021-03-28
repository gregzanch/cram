import React, { Fragment } from "react";
import TextInput from "../text-input/TextInput";
import NumberInput, { ObjectPropertyInputEvent } from ".";
import CheckboxInput from "../CheckboxInput";
import Source from "../../objects/source";
import GridRow from "../GridRow";
import GridRowSeperator from "../GridRowSeperator";
import {RT60} from "../../compute/rt";
import { Button } from "@blueprintjs/core";
import Select, { components } from "react-select";
import Messenger from "../../messenger";
import * as ac from '../../compute/acoustics';
import "./RT60Properties.css";

export interface RT60PropertiesProps {
  object: RT60;
  messenger: Messenger;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
  onPropertyValueChangeAsNumber: (
    id: string,
    prop: string,
    valueAsNumber: number
  ) => void;
  onPropertyValueChangeAsString: (
    id: string,
    prop: string,
    valueAsString: string
  ) => void;
  onButtonClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

const RT60PropertiesContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto auto",
  padding: ".25em",
  gridRowGap: ".25em",
  gridColumnGap: ".25em"
};

export default function RT60Properties(props: RT60PropertiesProps) {
  const XYZProps = {
    style: {
      width: "30%"
    },
    onChange: props.onPropertyChange
  };



  const customStyles = {
    indicatorsContainer: (provided, state) => ({
      ...provided,
      padding: 0
    }),
    clearIndicator: (provided, state) => ({
      ...provided,
      padding: 0
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      padding: 0
    }),
    control: (provided, state) => ({
      ...provided,
      minHeight: 0
    }),
    container: (provided, state) => ({
      ...provided,
      width: "100%"
    })
  };

  // console.log(sources, receivers);
  // const sabine = props.object.sabine(ac.whole_octave);
  return (
    <div>
      <div style={RT60PropertiesContainerStyle}>
        {props.object.hasOwnProperty("name") && (
          <GridRow label={"name"}>
            <TextInput
              name="name"
              value={props.object.name}
              onChange={props.onPropertyChange}
            />
          </GridRow>
        )}
        {/* <GridRow label={"sabine"}>
          <table>
            <thead>
              <tr>
                <th>Frequency</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {
                sabine[0].map((x,i) => (
                  <tr key={"sabine-row-"+i}>
                    <td>{x}</td>
                    <td>{sabine[1][i].toFixed(2)}</td>
                  </tr>
                ))
              }
            </tbody>
         </table>
        </GridRow> */}
      </div>
    </div>
  );
}
