import React from "react";
import { Dialog, Classes, Button, Intent } from "@blueprintjs/core";

export interface OpenWarningProps {
  isOpen: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onDiscard: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onSave: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}


function OpenWarning(props: OpenWarningProps) {
  return (
    <Dialog
      isOpen={props.isOpen}
      transitionDuration={100}
    >
      <div className={Classes.DIALOG_BODY}>
        <p>This project has unsaved changes</p>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            onClick={props.onDiscard}
            intent={Intent.WARNING}
            className={Classes.positionClass("left")}
            text="Discard Changes"
          />
          <Button onClick={props.onCancel} text="Cancel" />
          <Button intent={Intent.SUCCESS} onClick={props.onSave} text="Save"/>
        </div>
      </div>
    </Dialog>
  );
}

export { OpenWarning };

export default OpenWarning;
