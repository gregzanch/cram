import * as React from "react";

import { Intent } from "@blueprintjs/core";
import {
  Column,
  ColumnHeaderCell,
  EditableCell,
  EditableName,
  Table
} from "@blueprintjs/table";
import Messenger from "../../messenger";

export interface ParametersPanelProps {
  messenger: Messenger
}

export interface ParametersPanelState {
  columnNames: string[];
  sparseCellData: { [key: string]: string };
  sparseCellIntent: { [key: string]: Intent };
  sparseColumnIntents: Intent[];
  [key: string]: any;
}

export class ParametersPanel extends React.PureComponent<ParametersPanelProps, ParametersPanelState> {
  public static dataKey = (rowIndex: number, columnIndex: number) => {
    return `${rowIndex}-${columnIndex}`;
  };

  public state: ParametersPanelState = {
    columnNames: ["Please", "Rename", "Me"],
    sparseCellData: {
      "1-1": "editable",
      "3-1": "validation 123"
    },
    sparseCellIntent: {
      "3-1": Intent.DANGER
    },
    sparseColumnIntents: []
  };

  public render() {
    const columns = this.state.columnNames.map((_: string, index: number) => {
      return (
        <Column
          key={index}
          cellRenderer={this.renderCell}
          columnHeaderCellRenderer={this.renderColumnHeader}
        />
      );
    });
    return (
        <Table numRows={7}>{columns}</Table>
    );
  }

  public renderCell = (rowIndex: number, columnIndex: number) => {
    const dataKey = ParametersPanel.dataKey(rowIndex, columnIndex);
    const value = this.state.sparseCellData[dataKey];
    return (
      <EditableCell
        value={value == null ? "" : value}
        intent={this.state.sparseCellIntent[dataKey]}
        onCancel={this.cellValidator(rowIndex, columnIndex)}
        onChange={this.cellValidator(rowIndex, columnIndex)}
        onConfirm={this.cellSetter(rowIndex, columnIndex)}
      />
    );
  };

  public renderColumnHeader = (columnIndex: number) => {
    const nameRenderer = (name: string) => {
      return (
        <EditableName
          name={name}
          intent={this.state.sparseColumnIntents[columnIndex]}
          onChange={this.nameValidator(columnIndex)}
          onCancel={this.nameValidator(columnIndex)}
          onConfirm={this.nameSetter(columnIndex)}
        />
      );
    };
    return (
      <ColumnHeaderCell
        name={this.state.columnNames[columnIndex]}
        nameRenderer={nameRenderer}
      />
    );
  };

  private isValidValue(value: string) {
    return /^[a-zA-Z]*$/.test(value);
  }

  private nameValidator = (index: number) => {
    return (name: string) => {
      const intent = this.isValidValue(name) ? null : Intent.DANGER;
      this.setArrayState("sparseColumnIntents", index, intent);
      this.setArrayState("columnNames", index, name);
    };
  };

  private nameSetter = (index: number) => {
    return (name: string) => {
      this.setArrayState("columnNames", index, name);
    };
  };

  private cellValidator = (rowIndex: number, columnIndex: number) => {
    const dataKey = ParametersPanel.dataKey(rowIndex, columnIndex);
    return (value: string) => {
      const intent = this.isValidValue(value) ? null : Intent.DANGER;
      this.setSparseState("sparseCellIntent", dataKey, intent);
      this.setSparseState("sparseCellData", dataKey, value);
    };
  };

  private cellSetter = (rowIndex: number, columnIndex: number) => {
    const dataKey = ParametersPanel.dataKey(rowIndex, columnIndex);
    return (value: string) => {
      const intent = this.isValidValue(value) ? null : Intent.DANGER;
      this.setSparseState("sparseCellData", dataKey, value);
      this.setSparseState("sparseCellIntent", dataKey, intent);
    };
  };

  private setArrayState<T>(key: string, index: number, value: T) {
    const values = (this.state as any)[key].slice() as T[];
    values[index] = value;
    this.setState({ [key]: values });
  }

  private setSparseState<T>(stateKey: string, dataKey: string, value: T) {
    const stateData = (this.state as any)[stateKey] as { [key: string]: T };
    const values = { ...stateData, [dataKey]: value };
    this.setState({ [stateKey]: values });
  }
}
