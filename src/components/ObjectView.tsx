import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import Source from "../objects/source";
import Receiver from "../objects/receiver";

const useStyles = makeStyles({
	root: {
		height: 216,
		flexGrow: 1,
		maxWidth: 400
	}
});


export function GeometryTreeNode(props) {
	return <TreeItem nodeId={props.id}></TreeItem>;
}
export interface ObjectViewProps{
	geometry;
	sources: Source[],
	receivers: Receiver[]
}
export default function ObjectView(props) {
	const classes = useStyles();
	console.log(props);
	return (
		<TreeView
			className={classes.root}
			defaultCollapseIcon={<ExpandMoreIcon />}
			defaultExpandIcon={<ChevronRightIcon />}
		>
			<TreeItem nodeId="geometry" label="Geometry"></TreeItem>
			<TreeItem nodeId="sources" label="Sources">
				{props.sources.map((x: Source) => {
					return (
						<TreeItem
							nodeId={x.uuid}
							label={x.name}
							key={x.uuid}
							onClick={e => props.onClick(x, e)}></TreeItem>
					);
				})}
			</TreeItem>
			<TreeItem nodeId="receivers" label="Receivers">
				{props.receivers.map((x: Receiver) => {
					return (
						<TreeItem
							nodeId={x.uuid}
							label={x.name}
							key={x.uuid}
							onClick={(e)=>props.onClick(x,e)}></TreeItem>
					);
				})}
			</TreeItem>
		</TreeView>
	);
}
