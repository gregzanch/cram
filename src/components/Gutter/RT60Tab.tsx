import React from 'react';
import { RT60 } from '../../compute/rt';
import "./RT60Tab.css"

export interface RT60TabProps {
  solver: RT60
}

export interface RT60TabState {
  
}

export default class RT60Tab extends React.Component<RT60TabProps, RT60TabState> {
  constructor(props: RT60TabProps) {
    super(props);
    this.state = {
      
    }
  }  
  render() {
    return (
      <div>
        {this.props.solver.name}
      </div>
    )
  }
}