import React, { useState, useRef } from "react";

import Header from "./Header.js";
import CharterLogo from "./images/CharterLogo.svg";
import "./App.css";

enum CurrentState {
  WAITING_FOR_RFID,
  ENTERING_RFID,
  SENDING_RFID,
  RECEIVED_RESPONSE_GOOD,
  RECEIVED_RESPONSE_BAD
}

const BOOP_SERVER_URL = "http://10.4.48.193:4000";
const RESET_TIMEOUT = 5000;

const App: React.FC = () => {
  const [currentRFID, setCurrentRFID] = useState("");
  const [currentAppState, setCurrentAppState] = useState(
    CurrentState.WAITING_FOR_RFID
  );
  const [currentMessage, setCurrentMessage] = useState("");
  const [
    currentGuestPreviouslyCheckedIn,
    setCurrentGuestPreviouslyCheckedIn
  ] = useState(false);
  let rfidInput = useRef<HTMLInputElement>(null);

  const handleInput = (action: React.FormEvent<HTMLInputElement>) => {
    setCurrentRFID(action.currentTarget.value);
    setCurrentAppState(CurrentState.ENTERING_RFID);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentAppState(CurrentState.SENDING_RFID);
    try {
      const result = await fetch(`${BOOP_SERVER_URL}/checkin`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coolSecret: "Snaggy2Dope!",
          rfid: currentRFID
        })
      });
      switch (result.status) {
        case 404:
          setCurrentAppState(CurrentState.RECEIVED_RESPONSE_BAD);
          setTimeout(() => reset(), RESET_TIMEOUT);
          break;
        default:
          const response = await result.json();
          setCurrentGuestPreviouslyCheckedIn(response.checkedIn);
          setCurrentMessage(response.message);
          setCurrentAppState(CurrentState.RECEIVED_RESPONSE_GOOD);
          setTimeout(() => reset(), RESET_TIMEOUT);
      }
    } catch (e) {}
  };

  const reset = () => {
    setCurrentAppState(CurrentState.WAITING_FOR_RFID);
    if (rfidInput && rfidInput.current) {
      rfidInput.current.value = "";
      rfidInput.current.focus();
    }
  };

  let appClasses = "App";
  if (currentAppState === CurrentState.RECEIVED_RESPONSE_GOOD) {
    appClasses += " good-bg";
  }
  if (currentAppState === CurrentState.RECEIVED_RESPONSE_BAD) {
    appClasses += " bad-bg";
  }
  return (
    <div className={appClasses}>
      <Header />
      <form onSubmit={handleSubmit} style={{ position: "absolute" }}>
        <input
          autoFocus
          type="text"
          onChange={handleInput}
          value={currentRFID}
          ref={rfidInput}
        />
      </form>
      <div className="appState">
        {(currentAppState === CurrentState.WAITING_FOR_RFID ||
          currentAppState === CurrentState.ENTERING_RFID ||
          currentAppState === CurrentState.SENDING_RFID) && (
          <div className="waiting">
            <div className="blurb">
              Scan your wristband
              <br />
              for entry into the
              <br />
              Multiverse
            </div>
            <div className="status">
              <div className="logo">
                <img src={CharterLogo} className="charter-logo" alt="" />
              </div>
              {currentAppState === CurrentState.WAITING_FOR_RFID && "Ready"}
              {(currentAppState === CurrentState.ENTERING_RFID ||
                currentAppState === CurrentState.SENDING_RFID) &&
                "Analyzing"}
            </div>
          </div>
        )}
        {currentAppState === CurrentState.RECEIVED_RESPONSE_BAD && (
          <div className="bad">
            UNAUTHORIZED ACCESS
            <br />
            DETECTED
            <div className="bad-blurb">
              Please see Guest Services for assistance.
            </div>
          </div>
        )}
        {currentAppState === CurrentState.RECEIVED_RESPONSE_GOOD && (
          <div
            className="good"
            dangerouslySetInnerHTML={{ __html: currentMessage }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
