import React from 'react';
import SettingsPanelBlock from './SettingsPanelBlock';
import Messenger from '../../messenger';
import SettingsPanelSetting from './SettingsPanelSetting';
import SettingsTextComponent from './SettingsTextComponent';
import './SettingsPanel.css';
import {KeyValuePair} from '../../common/key-value-pair';
import { Setting } from '../../common/setting';
import SettingsNumberComponent from './SettingsNumberComponent';
import SettingsColorComponent from './SettingsColorComponent';


export interface SettingsPanelProps{
  messenger: Messenger;
}

export class SettingsPanel extends React.Component<SettingsPanelProps, KeyValuePair<Setting<string|number|boolean>>>{
  constructor(props: SettingsPanelProps) {
    super(props);
    this.state = this.props.messenger.postMessage("FETCH_SETTINGS")[0] as KeyValuePair<Setting<string | number | boolean>>;
    this.handleTextComponentChange = this.handleTextComponentChange.bind(this);
    this.handleNumberComponentChange = this.handleNumberComponentChange.bind(this);
    this.handleColorComponentChange = this.handleColorComponentChange.bind(this);
    this.SettingInputComponent = this.SettingInputComponent.bind(this);
  }
  handleTextComponentChange(e: React.ChangeEvent<HTMLInputElement>, setting: Setting<string>) {
    this.setState({
      [setting.id]: setting.setStagedValue(e.target.value)
    })
  }
  handleNumberComponentChange(e: React.ChangeEvent<HTMLInputElement>, setting: Setting<number>) {
     this.setState({
       [setting.id]: setting.setStagedValue(e.target.valueAsNumber)
     });
  }
  
  handleColorComponentChange(e: React.ChangeEvent<HTMLInputElement>, setting: Setting<string>) {
     this.setState({
       [setting.id]: setting.setStagedValue(e.target.value)
     });
  }
  
  SettingInputComponent(x: Setting<any>) {
    switch (x.kind) {
      case "text": {
        return (
          <SettingsTextComponent setting={x} onChange={e => {
            this.handleTextComponentChange(e, x);
          }
        }/>)
      }
      case "number": {
        return (
          <SettingsNumberComponent setting={x} onChange={e => {
            this.handleNumberComponentChange(e, x);
          }
        }/>)
      }
      case "color": {
        return (
          <SettingsColorComponent setting={x} onChange={e => {
            this.handleColorComponentChange(e, x);
          }
        }/>)
      }
      default:
        return (<div></div>)
    }
  }
  render() {
    return (
      <SettingsPanelBlock title="General">
        {this.state && Object.keys(this.state).map(x => {
          const setting = this.state[x];
          return (
            <SettingsPanelSetting
              edited={setting.edited}
              key={setting.id}
              name={setting.name}
              description={setting.description}>
              {this.SettingInputComponent(setting)}
            </SettingsPanelSetting>
          );
        })}
      </SettingsPanelBlock>
    )
  }
}

