import React from "react";
import Clock from "react-live-clock";
import MW_LOGO from "./images/mw_logo.png";
import "./Header.css";

function Header() {
  return (
    <div className="Header">
      <div className="Header-logo-group">
        <img className="Header-logo" src={MW_LOGO} alt="Meow Wolf" />
        <span className="Header-location">House of Eternal Return</span>
      </div>
      <div className="Header-time-group">
        <span className="Header-time-title">Current time</span>
        <Clock
          className="Header-time-clock"
          format="h:mm A"
          ticking={true}
          interval={10}
        />
        <Clock
          className="Header-time-date"
          format="MMMM D"
          ticking={true}
          interval={10}
        />
      </div>
    </div>
  );
}

export default Header;
