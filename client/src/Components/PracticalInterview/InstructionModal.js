import React from "react";
import Modal from "react-modal";

const InstructionsModal = ({ show, onClose, onConfirm, startLoader }) => {
  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "600px",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
      }}
    >
      <h2>Interview Instructions</h2>
      <p>1. Ensure your webcam and microphone are working.</p>
      <p>
        2. Make sure your screen recording permissions are enabled. You will be
        prompted to allow screen recording at the beginning of the interview.
      </p>
      <p>
        3. You will have 30 seconds to answer each question. Please answer each
        question thoroughly within the allotted time.
      </p>
      <p>
        4. The interview will start with a screen recording. The recording will
        capture both video and audio. Ensure your environment is quiet and
        well-lit.
      </p>
      <p>
        5. At the end of the interview, the recording will automatically stop
        and you will be able to review and download the video.
      </p>
      <p>
        6. Once you click "Start," the timer will begin, and you will be
        prompted with the first question.
      </p>
      <p>
        7. Follow the prompts for each question, and ensure to respond within
        the given time. You can click "Start Recording" to begin recording
        before starting the interview.
      </p>
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <button
          onClick={onConfirm}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s ease, transform 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {startLoader ? "Starting Interview" : "Start"}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ccc",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "10px",
            transition: "background-color 0.3s ease, transform 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#aaa")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ccc")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default InstructionsModal;
