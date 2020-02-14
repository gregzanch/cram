import React from 'react';
import { Cell, Column, Table } from "@blueprintjs/table";

export interface Stat{
  name: string;
  value: number | string;
}


export interface StatsProps {
  data: Stat[];
}

export default function Stats(props: StatsProps) {
  const valueCellRenderer = (i: number) => {
    return <Cell>{props.data[i].value}</Cell>;
  };
  const nameCellRenderer = (i: number) => {
    return <Cell>{props.data[i].name}</Cell>;
  };
  return (
    <div className="stats">
      <Table numRows={props.data.length}>
        <Column name="Property" cellRenderer={nameCellRenderer}></Column>
        <Column name="Value" cellRenderer={valueCellRenderer}></Column>
      </Table>
    </div>
  );
}