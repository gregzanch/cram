import React, { useState } from "react";

import {
	Button,
	Classes,
	Dialog,
	Intent,
	HTMLTable
} from "@blueprintjs/core";

import { messenger, emit, on } from '../messenger';
import { useAppStore } from '../store/app-store';
import { pickProps } from '../common/helpers';
import { mmm_dd_yyyy } from "../common/dayt"; 
import FileTypes from '../common/file-type';
import { DialogActions } from "@material-ui/core";



export const ACCEPTED_FILE_TYPES = [
    ""
]

export enum DROP_ALLOWED {
    NO = 0,
    IDK = 1,
    YES = 2
}

const backgroundColors = [
	"rgba(255,0,0,.2)",
	"rgba(0,0,0,0)",
	"rgba(0,255,0,.2)"
];

export interface FileWithCheckbox{
	file: File;
	checked: boolean;
}


const upload = (callback: (files?: File[]) => void) => {
  const input = (document.querySelector("#temp-file-import") as HTMLInputElement) || document.createElement("input");
  input.type = "file";
  input.setAttribute("style", "display: none;");
  input.setAttribute("id", "temp-file-import");
  document.body.appendChild(input);
  input.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target && target.files) {
      const files = Array.from(target.files) as File[];
      callback(files);
    }
    input.remove();
  });
  input.click();
}



export default function ImportDialog() {
	const [dropAllowed, setDropAllowed] = useState(DROP_ALLOWED.IDK);
	const [filelist, setFilelist] = useState([] as File[]);
  const { importDialogVisible, set } = useAppStore(store => pickProps(["importDialogVisible", "set"], store));

	return (
		<Dialog
			icon="import"
			title="Import"
			transitionDuration={0}
			style={{
				borderRadius: "2px",
				paddingBottom: "0",
				width: "auto",
				minWidth: "350px"
			}}
      isOpen={importDialogVisible}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      usePortal={true}
      onClose={() => set(store => { store.importDialogVisible = false })}
      >
			<div
				className={Classes.DIALOG_BODY}
				onDragLeave={() => setDropAllowed(DROP_ALLOWED.IDK)}
				onDragOver={(e: React.DragEvent<HTMLElement>) => {
					const { types, items } = e.dataTransfer;
					let yes = true;
					for (let i = 0; i < types.length; i++) {
            yes = yes && items[i].kind === "file";
          }
          setDropAllowed(yes ? DROP_ALLOWED.YES : DROP_ALLOWED.NO);
					e.stopPropagation();
					e.preventDefault();
				}}
				onDrop={(e: React.DragEvent<HTMLDivElement>) => {
					const { files } = e.dataTransfer;
					let filearray = Array.from(files);
					setFilelist(filearray);
					setDropAllowed(DROP_ALLOWED.IDK);
					e.preventDefault();
					e.stopPropagation();
				}}>
				<div
					style={{ backgroundColor: backgroundColors[dropAllowed] }}
					className={"drop-zone"}
					onClick={() =>
            upload((files)=>{
              setFilelist(files!);
              setDropAllowed(DROP_ALLOWED.IDK);
            })
          }>
					<div
						style={{
							color: "gray",
							fontSize: "12pt",
							width: "100%",
							textAlign: "center"
						}}>
						Drag files or click to browse
					</div>
				</div>
				{filelist.length > 0 ? (
					<HTMLTable
						className={[
							Classes.HTML_TABLE_BORDERED,
							Classes.HTML_TABLE_CONDENSED,
							Classes.HTML_TABLE_STRIPED
						].join(" ")}
						style={{
							width: "100%",
							textAlign: "center"
						}}>
						<thead>
							<tr>
								<th>.ico</th>
								<th>name</th>
								<th>last-modified</th>
							</tr>
						</thead>
						<tbody style={{}}>
							{filelist.map((file,i,a) => {
								return (
									<tr key={file.name + i} className={"table-hover"}>
										<td>
											<div
												className={
													"icon " +
														FileTypes.assoc[
															file.name
																.split(".")
																.slice(-1)[0]
														] ||
													FileTypes.ICONS.FILE
												}></div>
										</td>
										<td
											id={file.name}
											style={{
												marginLeft: "1em"
											}}>
											{file.name}
										</td>
										<td id={file.name + "lastModified"}>
											{mmm_dd_yyyy(file.lastModified)}
										</td>
										<td>
											{
												FileTypes.allowed[
															file.name
																.split(".")
														.slice(-1)[0]]
													? "✓"
													: "x"
											}	
										</td>
									</tr>
								);
							})}
						</tbody>
					</HTMLTable>
				) : (
					<div></div>
				)}
			</div>
			<DialogActions>
				<Button
					className={Classes.BUTTON}
					intent={Intent.PRIMARY}
					disabled={filelist.length == 0}
					text="Import"
					onClick={() => {
            messenger.postMessage("IMPORT_FILE", filelist);
						setFilelist([] as File[]);
						set(store => {
							store.importDialogVisible = false;
						});
					}}
				></Button>
			</DialogActions>
		</Dialog>
	);
}

declare global {
	interface EventTypes {
		SHOW_IMPORT_DIALOG: boolean;
	}
}

on("SHOW_IMPORT_DIALOG", (visible) => {
	useAppStore.getState().set(store => {
		store.importDialogVisible = visible;
	});
})


// export const SaveDialog = () => {


//   return (
//     <ImportDialog

//     />

//   );

// }

// export default SaveDialog;