import React, { useState } from 'react';
import { Dialog, Classes, Button, AnchorButton, Intent } from '@blueprintjs/core';
import { messenger, emit } from '../messenger';
import { useAppStore } from '../store/app-store';
import { pickProps } from '../common/helpers';




export const SaveDialog = () => {
  const { projectName, saveDialogVisible, set } = useAppStore(store => pickProps(["projectName", "saveDialogVisible", "set"], store));
  const [fileName, setFileName] = useState(projectName);

  return (
    <Dialog
      isOpen={saveDialogVisible}
      transitionDuration={100}
      title="Save Project"
    >
      <div className={Classes.DIALOG_BODY}>
        <input
          type="text"
          value={fileName}
          onChange={e=>setFileName(e.currentTarget.value)}
        ></input>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={() => set(store => { store.saveDialogVisible = false; }) }>
            Cancel
          </Button>
          <AnchorButton intent={Intent.SUCCESS} onClick={() => emit("SAVE", () => set(store => { store.saveDialogVisible = false; }) )}>
            Save
          </AnchorButton>
        </div>
      </div>
    </Dialog>
  );

}

export default SaveDialog;