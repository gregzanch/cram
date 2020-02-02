import React, {useState} from "react";

import { uuid } from 'uuidv4';

import { mmm_dd_yyyy } from "../common/dayt"; 
import FileTypes from '../common/file-type';

import {
	AnchorButton,
	Button,
	Classes,
	Code,
	Dialog,
	H5,
	Intent,
	Switch,
	Tooltip,
	Card,
	Elevation,
	Colors,
	HTMLTable,
	Checkbox
} from "@blueprintjs/core";

import { makeStyles } from "@material-ui/core/styles";
import { DialogActions } from "@material-ui/core";

export interface IDialogExampleState {
	autoFocus: boolean;
	canEscapeKeyClose: boolean;
	canOutsideClickClose: boolean;
	enforceFocus: boolean;
	isOpen: boolean;
	usePortal: boolean;
}



export interface ImportDialogProps {
	autoFocus: boolean;
	canEscapeKeyClose: boolean;
	canOutsideClickClose: boolean;
	enforceFocus: boolean;
	isOpen: boolean;
	usePortal: boolean;
	data?: {
		themeName?: string;
	};
	onImport: (...args) => void;
	onClose: (event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void;
	onDrop: (...args) => void;
}

const useStyles = makeStyles({
    dropzone: {
        height: "100%",
        width: "100%",
        backgroundColor: "#000000"
    }
})

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

export default function ImportDialog(props: ImportDialogProps) {
    const classes = useStyles();
	const [dropAllowed, setDropAllowed] = useState(DROP_ALLOWED.IDK);
	const [filelist, setFilelist] = useState([] as File[]);
	return (
		<Dialog
			icon="import"
			// onClose={props.onClose}
			title="Import"
			transitionDuration={0}
			style={{
				borderRadius: "2px",
				paddingBottom: "0",
				width: "auto",
				minWidth: "350px"
			}}
			{...props}>
			<div
				className={Classes.DIALOG_BODY}
				onDragEnter={(e: React.DragEvent<HTMLElement>) => {
					const { types, files, items } = e.dataTransfer;
					let yes = true;
					for (let i = 0; i < types.length; i++) {
						const { kind, type } = items[i];
						if (kind !== "file") {
							yes = false;
						}
					}
					if (yes) {
						setDropAllowed(DROP_ALLOWED.YES);
					} else {
						setDropAllowed(DROP_ALLOWED.NO);
					}
				}}
				onDragLeave={e => {
					setDropAllowed(DROP_ALLOWED.IDK);
				}}
				onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
					const { types, files, items } = e.dataTransfer;
					let yes = true;
					for (let i = 0; i < types.length; i++) {
						const { kind, type } = items[i];
						if (kind !== "file") {
							yes = false;
						}
					}
					if (yes) {
						setDropAllowed(DROP_ALLOWED.YES);
					} else {
						setDropAllowed(DROP_ALLOWED.NO);
					}
					e.stopPropagation();
					e.preventDefault();
				}}
				onDrop={(e: React.DragEvent<HTMLDivElement>) => {
					const { types, files, items } = e.dataTransfer;
					let filearray = Array.from(files);
					setFilelist(filearray);
					setDropAllowed(DROP_ALLOWED.IDK);
					e.preventDefault();
					e.stopPropagation();
				}}>
				<div
					style={{
						backgroundColor: backgroundColors[dropAllowed]
					}}
					className={"drop-zone"}
					onClick={() => {
						const input = (document.querySelector("#temp-file-import") as HTMLInputElement) || document.createElement("input");
						input.type = "file";
						input.setAttribute("style", "display: none;");
						input.setAttribute("id", "temp-file-import");
						document.body.appendChild(input);
						input.addEventListener("change", (e: Event) => {
							const target: HTMLInputElement = e.target as HTMLInputElement;
							const filearray = [] as File[];
							if (target && target.files) {
								for (let i = 0; i < target.files.length; i++) {
									filearray.push(target.files[i]);
								}
								setFilelist(filearray);
								setDropAllowed(DROP_ALLOWED.IDK);
							}
						});
						input.addEventListener("blur", () => {
							input.remove();
						});
						input.click();
					}}>
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
									<tr key={uuid()} className={"table-hover"}>
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
						props.onImport(filelist);
						setFilelist([] as File[]);
					}}
				></Button>
			</DialogActions>
		</Dialog>
	);
}
