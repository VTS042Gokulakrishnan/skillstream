import React from "react";
import "./InstructionsModal.css";
import { Spin } from "antd";

const InstructionsModal = ({ onAgree, onCancel, loader }) => {
  return (
    <div className="instructions-modal-one">
      <div className="modal-content-one">
        <header className="modal-header-one">
          <h2>Interview Instructions & Rules</h2>
          <button className="close-button" onClick={onCancel}>
            ✕
          </button>
        </header>
        <main className="modal-body-one">
          <p>
            Welcome to the video assessment. Please review and agree to the
            following instructions:
          </p>
          <ul>
            <h2>Interview Instructions</h2>
            <p>1. Ensure your webcam and microphone are working.</p>
            <p>
              2. Make sure your screen recording permissions are enabled. You
              will be prompted to allow screen recording/ at the beginning of
              the interview. Please choose entire Window to capture correctly
            </p>

            <p>
              3.. You will have Next Question button for each question. Please
              answer each question thoroughly with your own time.
            </p>
            <p>
              4. The recording will capture both video and audio. Ensure your
              environment is quiet and well-lit.
            </p>
            <p>
              5. At the end of the interview, Please wait for the Answers to be
              Submitted .The recording will be automatically stopped and
              redirect to feedback page
            </p>
            <p>
              6.Please do not click the 'Stop Sharing' button during the
              interview.
            </p>
            <p>
              7.Make sure to enable system audio when sharing your entire
              screen. You will find a toggle button labeled "Share System Audio"
              at the bottom.
            </p>
          </ul>
        </main>
        <footer className="modal-footer-one">
          <button className="agree-button" onClick={onAgree} disabled={loader}>
            {loader ? "Loading..." : "I Agree"}
          </button>
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default InstructionsModal;
