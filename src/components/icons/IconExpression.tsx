import React from "react";


export interface IconExpressionProps{
    style?: React.CSSProperties;
    fill?: string;
	width?:  string;
	className?: string;
    viewBox?: string;


}
const defultProps = {
	style: {},
	fill: "#000",
	width: "100%",
	className: "icon-expression",
	viewBox: "0 0 64 64",
};
export default function IconExpression(props: IconExpressionProps) {
    const {width, style,viewBox,className,fill} = Object.assign(defultProps, props);
    return (
		<svg
			width={width}
			style={style}
			height={width}
			viewBox={viewBox}
			className={`svg-icon ${className || ""}`}>
			<svg {...props}>
				<path
					d="M8.78 0c2.561 0 4.625.521 6.193 1.564 1.568 1.042 2.783 2.8 3.646 5.276L35.355 50.19c.522 1.329 1.071 2.254 1.646 2.775.6.495 1.359.743 2.273.743l1.49-.117.235 5.94c-.94.314-1.96.47-3.057.47-2.012 0-3.528-.234-4.547-.704-1.02-.495-1.934-1.303-2.744-2.423-.81-1.12-1.594-2.723-2.352-4.808l-9.015-23.179-11.21 30.45H0l15.444-40.222-3.763-9.186C11.08 8.47 10.426 7.44 9.72 6.84c-.68-.599-1.607-.899-2.783-.899l-1.842.079-.04-5.55C6.154.155 7.396 0 8.78 0z"
				/>
			</svg>
		</svg>
	);
}

