import React from 'react';
import { Dialog, Classes, Button, AnchorButton, Intent } from '@blueprintjs/core';
import Messenger from '../state/messenger';
import { Actions } from '../state/actions';

export interface SaveEvent {
  filename: string;
}

export interface SaveDialogProps { 
  messenger: Messenger;
  filename: string;
  isOpen: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onSave: (e: SaveEvent) => void;
}
export interface SaveDialogState {
  filename: string;
}

class SaveDialog extends React.Component<SaveDialogProps, SaveDialogState>{
  constructor(props: SaveDialogProps) {
    super(props);
    this.state = {
      filename: props.filename,
    }
  }
  render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        transitionDuration={100}
        title="Save Project"
        onOpened={(e) => {
          this.setState({
            filename: this.props.messenger.postMessage(Actions.GET_PROJECT_NAME)!
          })
        }}
        // icon="floppy-disk"
      >
        <div className={Classes.DIALOG_BODY}>
          <input
            type="text"
            value={this.state.filename}
            onChange={(e) => {
              this.setState({ filename: e.currentTarget.value });
            }}
          ></input>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              onClick={(e) => {
                this.setState({ filename: this.props.filename }, this.props.onCancel);
              }}
            >
              Cancel
            </Button>
            <AnchorButton intent={Intent.SUCCESS} onClick={() => this.props.onSave({ filename: this.state.filename })}>
              Save
            </AnchorButton>
          </div>
        </div>
      </Dialog>
    );
  }
}

export {
  SaveDialog
};

export default SaveDialog;