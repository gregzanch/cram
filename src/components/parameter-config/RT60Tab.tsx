import React from 'react';
import { RT60 } from '../../compute/rt';
import Messenger from "../../messenger";
import { ObjectPropertyInputEvent } from "../ObjectProperties";
import RT60Properties from '../ObjectProperties/RT60Properties';

export interface RT60TabProps {
  solver: RT60;
  messenger: Messenger;
}

export interface RT60TabState {
  
}

export default class RT60Tab extends React.Component<RT60TabProps, RT60TabState> {
  constructor(props: RT60TabProps) {
    super(props);
    this.state = {
      
    }
    this.handleObjectPropertyChange = this.handleObjectPropertyChange.bind(this);
    this.handleObjectPropertyValueChangeAsNumber = this.handleObjectPropertyValueChangeAsNumber.bind(this);
    this.handleObjectPropertyValueChangeAsString = this.handleObjectPropertyValueChangeAsString.bind(this);
    this.handleObjectPropertyButtonClick = this.handleObjectPropertyButtonClick.bind(this);
  } 
  handleObjectPropertyChange(e: ObjectPropertyInputEvent) {
		const prop = e.name;
		switch (e.type) {
			case "checkbox":
				this.props.solver[prop] = e.value;
				break;
			case "text":
				this.props.solver[prop] = e.value;
				break;
			case "number":
				this.props.solver[prop] = Number(e.value);
				break;
      default:
				  this.props.solver[prop] = e.value;
				break;
    }
    this.forceUpdate();
    this.props.messenger.postMessage("RESULTS_SHOULD_UPDATE");
    this.props.messenger.postMessage("GUTTER_SHOULD_UPDATE");
	}
  handleObjectPropertyValueChangeAsNumber(
		id: string,
		prop: string,
		valueAsNumber: number
	) {
    this.props.solver[prop] = valueAsNumber;
    this.forceUpdate();
	}
	handleObjectPropertyValueChangeAsString(
		id: string,
		prop: string,
		valueAsString: string
	) {
    this.props.solver[prop] = valueAsString;
    this.forceUpdate();
  }
  handleObjectPropertyButtonClick(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    // switch (e.currentTarget.name) {
    //   default: break;
    // }
    this.forceUpdate();
  }
  render() {
    return (
      <RT60Properties
        messenger={this.props.messenger}
        object={this.props.solver}
        onPropertyChange={this.handleObjectPropertyChange}
        onPropertyValueChangeAsNumber={this.handleObjectPropertyValueChangeAsNumber}
        onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
        onButtonClick={this.handleObjectPropertyButtonClick}
      />
    );
  }
}