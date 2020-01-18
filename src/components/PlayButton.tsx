import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlayCircle, faPauseCircle } from '@fortawesome/free-solid-svg-icons'


export interface PlayButtonProps{
	playing: boolean;
	onClick?: (e: React.MouseEvent) => void;
}

export default function PlayButton(props: PlayButtonProps) {
	const classes = [
		"play-button"
	];
	
	(props.playing) && classes.push("play-button-on");
	
	
	return (
		<FontAwesomeIcon
			className={classes.join(" ")}
			size="2x"
			icon={props.playing ? faPauseCircle : faPlayCircle}
			onClick={props.onClick || (() => {})}
		/>
	)
}