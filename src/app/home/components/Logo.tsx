import Link from "next/link";
import React from "react";

export const Logo = () => {
  return (
    <div className="logo">
      <div className="logo-icon">
        <div className="logo-circle"></div>
        <div className="logo-arrow"></div>
      </div>
      <Link className="logo-text" href="/">
        PromptCue
      </Link>
    </div>
  );
};
