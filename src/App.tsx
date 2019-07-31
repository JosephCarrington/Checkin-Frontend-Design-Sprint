import React, { useState, useRef } from "react";
import "./App.css";

enum CurrentState {
  WAITING_FOR_RFID,
  ENTERING_RFID,
  SENDING_RFID,
  RECEIVED_RESPONSE_GOOD,
  RECEIVED_RESPONSE_BAD
}

const BOOP_SERVER_URL = "http://10.4.48.188:4000";
const RESET_TIMEOUT = 1000;

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
          break;
        default:
          const response = await result.json();
          setCurrentGuestPreviouslyCheckedIn(response.checkedIn);
          setCurrentMessage(response.message);
          setCurrentAppState(CurrentState.RECEIVED_RESPONSE_GOOD);
          setTimeout(() => reset(), RESET_TIMEOUT);
      }
    } catch (e) {
      debugger;
    }
  };

  const reset = () => {
    setCurrentAppState(CurrentState.WAITING_FOR_RFID);
    if (rfidInput && rfidInput.current) {
      rfidInput.current.value = "";
      rfidInput.current.focus();
    }
  };

  return (
    <div className="App">
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
        {currentAppState === CurrentState.WAITING_FOR_RFID && (
          <div className="waiting">Waiting for input</div>
        )}
        {currentAppState === CurrentState.ENTERING_RFID && (
          <div className="entering">Entering RFID</div>
        )}
        {currentAppState === CurrentState.SENDING_RFID && (
          <div className="sending">Sending RFID</div>
        )}
        {currentAppState === CurrentState.RECEIVED_RESPONSE_BAD && (
          <div className="bad">Couldn't find that wristband, sorry</div>
        )}
        {currentAppState === CurrentState.RECEIVED_RESPONSE_GOOD && (
          <div className="good">{currentMessage}</div>
        )}
      </div>
    </div>
  );
};

export default App;
