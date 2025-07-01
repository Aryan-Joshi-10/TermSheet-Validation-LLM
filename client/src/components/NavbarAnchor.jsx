/* eslint-disable react/prop-types */
// import React from "react";
import { NavLink } from "react-router-dom";

export default function NavbarAnchor({ to, text, id, className, isActive }) {
  let classNames = [
    "block",
    "py-2",
    "px-6",
    "rounded",
    "bg-transparent",
    "md:p-0",
  ];

  if (className === "black") {
    classNames.push("text-black");
  } else {
    classNames.push("text-white");
  }

  if (isActive) {
    classNames.push("aria-current");
  }

  return (
    <li>
      <NavLink to={to} id={id} className={classNames.join(" ")}>
        {text}
      </NavLink>
    </li>
  );
}
