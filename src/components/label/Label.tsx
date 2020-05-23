import React from "react";
import "./Label.css";
import { uuid } from "uuidv4";

const joinClasses = (args: string[]) => args.join(" ").trim();

export interface LabelProps {
  children?: React.ReactNode;
  tooltipText?: string;
  hasTooltip?: boolean;
  tooltipWidth?: number;
  style?: React.CSSProperties;
}

export default function Label(props: LabelProps) {
  const tooltipClassName = props.hasTooltip ? "tooltip" : "";
  const containerProps = {
    className: tooltipClassName,
    style: props.style || {},
    id: uuid()
  };
  
  return (
    <div {...containerProps}>
      <div className="tooltip-label"
        onMouseOverCapture={(e) => {
          const elt = e.currentTarget.parentElement && e.currentTarget.parentElement.querySelector(".tooltiptext");
          const arrow = e.currentTarget.parentElement && e.currentTarget.parentElement.querySelector(".tooltip-text-arrow");
          if (elt && arrow) {
            const rect = elt && (elt.getClientRects() as DOMRectList);
            const tooltipWidth = rect![0].width;
            const tooltipHeight = rect![0].height;
            // console.log([pos.left, pos.top], [elt?.clientWidth, elt?.clientHeight], [rect?.x, rect?.y, rect?.top, rect?.left]);
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const labelRect = e.currentTarget.getClientRects() as DOMRectList;
            const labelWidth = labelRect[0].width;
            const labelHeight = labelRect[0].height;
            const labelX = labelRect[0].x;
            const labelY = labelRect[0].y;
            let yfrac = labelY / window.innerHeight;
            let left = labelX - tooltipWidth - 8;
            let top = labelY - (tooltipHeight * yfrac) / 2;
            arrow && arrow.setAttribute("style", `top: ${(yfrac + 0.5) * 50}%`);

            let textAlign = "right";
            if (labelX < window.innerWidth / 2) {
              textAlign = "left";
            }
            elt && elt.setAttribute("style", `top: ${top}px; left: ${left}px; text-align: ${textAlign}; opacity: 1`);
          }
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseLeave={e => {
          const elt = e.currentTarget.parentElement && e.currentTarget.parentElement.querySelector(".tooltiptext");
          if (elt) {
            elt.setAttribute("style", "visibility: hidden; opacity: 0");
          }
        }}
      >
        {props.children}
      </div>
      {props.hasTooltip && (
        <span className="tooltiptext">
          {props.tooltipText}
          <span className="tooltip-text-arrow" />
        </span>
      )}
    </div>
  );
}


  // // whenever we hover over a menu item that has a submenu
  // $("li.parent").on("mouseover", function () {
  //   var $menuItem = $(this),
  //     $submenuWrapper = $("> .wrapper", $menuItem);

  //   // grab the menu item's position relative to its positioned parent
  //   var menuItemPos = $menuItem.position();

  //   // place the submenu in the correct position relevant to the menu item
  //   $submenuWrapper.css({
  //     top: menuItemPos.top,
  //     left: menuItemPos.left + Math.round($menuItem.outerWidth() * 0.75)
  //   });
  // });
