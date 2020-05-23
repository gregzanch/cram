import React from 'react';
import { VariableSizeGrid as Grid } from "react-window";
import Messenger from "../../messenger";

export interface MaterialsPanelProps{
  messenger?: Messenger;
}

const columnWidths = [
  100,200,200,500,100,100,100,100,100,100
]

export default function MaterialsPanel(props: MaterialsPanelProps) {
  const materials = props.messenger?.postMessage("FETCH_ALL_MATERIALS")[0]
  
  const keys = Object.keys(materials[0]);

  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      {JSON.stringify(materials[rowIndex][keys[columnIndex]])}
    </div>
  );
  
  return (<Grid
    columnCount={5}
    columnWidth={index => columnWidths[index]}
    rowCount={500}
    rowHeight={index => 50}
    height={500}
    width={800}>
    {Cell}
  </Grid>);
}
