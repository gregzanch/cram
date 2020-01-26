import React, { ReactElement } from "react";
import {
	makeStyles,
	createStyles
} from "@material-ui/core/styles";


import { SvgIcon } from '@material-ui/core';

import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

import TimelineIcon from '@material-ui/icons/Timeline';
import HomeIcon from '@material-ui/icons/Home';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import TreeItem from "@material-ui/lab/TreeItem";
import Source from "../objects/source";
import Receiver from "../objects/receiver";

import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";
import Surface from "../objects/surface";



function NodesIcon(props) {
	return (
		<SvgIcon {...props}>
		 <svg width="24" height="24" viewBox="-4 -4 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 12C4 13.1046 3.10457 14 2 14C0.89543 14 0 13.1046 0 12C0 10.8954 0.89543 10 2 10C3.10457 10 4 10.8954 4 12Z" fill="black"/>
			<path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="black"/>
			<path d="M9 2C9 3.10457 8.10457 4 7 4C5.89543 4 5 3.10457 5 2C5 0.89543 5.89543 0 7 0C8.10457 0 9 0.89543 9 2Z" fill="black"/>
			<path d="M7 2L2 12H12L7 2Z" stroke="black"/>
			</svg>

		</SvgIcon>
	);
}

function RayTracerIcon(props) {
	return (
		<TimelineIcon {...props}/>
	)
}

function RoomIcon(props) {
	return (
		<SvgIcon {...props}>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 31 32">
    <polygon points="6.473 10.456 15.492 5.332 24.524 10.455 15.485 15.865 6.473 10.456" fill="#ebebeb"/>
    <polygon points="6.473 10.456 15.489 15.866 15.492 26.635 6.472 21.259 6.473 10.456" fill="#90908f"/>
    <polygon points="24.524 10.455 24.528 21.305 15.492 26.635 15.492 15.866 24.524 10.455" fill="#c6c7c8"/>
    <path d="M24.49414,9.897l-8.5-4.83105a1.00013,1.00013,0,0,0-.98828,0l-8.5,4.83105A1.00006,1.00006,0,0,0,6,10.76642V20.99231a.99993.99993,0,0,0,.48816.85907L14.989,26.91681a1,1,0,0,0,1.021.00159l8.49915-5.02747A1.0001,1.0001,0,0,0,25,21.03027V10.76642A1.00006,1.00006,0,0,0,24.49414,9.897ZM15.5,5.93555l8.17548,4.6466L15.501,15.419l-8.14533-4.8545ZM7,20.99219V11.51678l8,4.76691V25.76Zm9,4.77118V16.28473l8-4.73181v9.47735Z" fill="#535353"/>
</svg>



		</SvgIcon>
	)
}

export function GeometryTreeNode(props) {
	return <TreeItem nodeId={props.id}></TreeItem>;
}
export interface ObjectViewProps {
	containers: KeyValuePair<Container>;
}


const useStyles = makeStyles(
	createStyles({
		root: {
			height: 264,
			flexGrow: 1,
			maxWidth: 400
		}
	})
);


interface TreeItemLabelProps{
	label: React.ReactNode,
	meta?: React.ReactNode
}

export function TreeItemLabel(props: TreeItemLabelProps) {
	return (
		<div className="tree-item-label-container">
			<div className="tree-item-label-label">
				{props.label}
			</div>
			<div className="tree-item-label-meta">{props.meta||""}</div>
		</div>
	)
}


export default function ObjectView(props) {
	function mapchildren(container: Container | THREE.Object3D) {
		if (container["kind"]) {
			switch (container["kind"]) {
				case "surface":
					return (<TreeItem
						defaultChecked
						icon={<NodesIcon />}
						draggable={true}
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Surface"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					/>);
				case "source":
					return (<TreeItem
						draggable={true}
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Source"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					/>);
				case "receiver":
					return (<TreeItem
						draggable={true}
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Receiver"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					/>);
				case "room":
					return (<TreeItem
						draggable={true}
						nodeId={container.uuid}
						icon={<RoomIcon fontSize="small"/>}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Room"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					>{container.children.map(x => mapchildren(x))}</TreeItem>);
				default:
					return (<TreeItem
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={container["kind"]||container.type}/>}
						key={container.uuid}
						draggable={true}
						onClick={e => props.onClick(container, e)}>
						{container.children.map(x => mapchildren(x))}
					</TreeItem>);
			}
		}
		return (<TreeItem
			nodeId={container.uuid}
			label={<TreeItemLabel label={container.name || "untitled"} meta={container.type}/>}
			key={container.uuid}
			draggable={true}
			onClick={e => props.onClick(container, e)}>
			{container.children.map(x => mapchildren(x))}
		</TreeItem>);
	}
	

	const classes = useStyles();
	return (
		<TreeView
			className={classes.root}
			defaultCollapseIcon={<ExpandMoreIcon />}
			defaultExpandIcon={<ChevronRightIcon />}
		>
			<TreeItem nodeId="computation" label={<TreeItemLabel label={<div style={{fontWeight: 400}}>Compute</div>}/>}>
				<TreeItem
					nodeId="ray-tracer"
					label={<TreeItemLabel label={"raytracer"} meta={"RayTracer"} />} />
			</TreeItem>
			<TreeItem nodeId="containers" label={<TreeItemLabel label={<div style={{fontWeight: 400}}>Objects</div>}/>}>
				{Object.keys(props.containers).map((x: string) => mapchildren(props.containers[x]))}
			</TreeItem>
		</TreeView>
	);
}
