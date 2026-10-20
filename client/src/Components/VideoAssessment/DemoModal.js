import React, { useState } from "react";
import axios from "axios";
import { Server } from "App";
import toast, { Toaster } from "react-hot-toast";

const DemoModal = ({ isModalOpen, setIsModalOpen, selectedCandidate }) => {
  console.log(selectedCandidate);
  
  const [interviewType, setInterviewType] = useState(""); // coding or video
  const [selectedOption, setSelectedOption] = useState(""); // with/without instruction
  const [level, setLevel] = useState(""); // easy/medium/hard (for coding interview)
  const [isCodingRound, setIsCodingRound] = useState(null); // only for video interview
  const [formData, setFormData] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const [showType4, setShowType4] = useState(false);
  const [showType5, setShowType5] = useState(false);
  const [error, setError] = useState("");
  const [emailLoader, setEmailLoader] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setInterviewType("");
    setSelectedOption("");
    setLevel("");
    setIsCodingRound(null);
    setFormData({
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: "",
    });
    setShowType4(false);
    setShowType5(false);
    setError("");
  };

  const handleOptionChange = (e) => setSelectedOption(e.target.value);
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddMore = () => {
    if (!showType4) setShowType4(true);
    else if (!showType5) setShowType5(true);
  };

  const convertObjectToArray = (obj) =>
    Object.values(obj).filter((value) => value !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const instructions = convertObjectToArray(formData);

    if (selectedOption === "with-instruction" && instructions.length < 3) {
      setError("At least three instructions required");
      return;
    }

    try {
      setEmailLoader(true);

      let payload = {
        ...selectedCandidate,
        instructions,
        region: "United States",
      };

      let endpoint = "";

      if (interviewType === "video") {
        payload.isCodingRound = isCodingRound;
        endpoint = `${Server}/api/v1/videoInterview/sendEmail/${selectedCandidate.userId}/${selectedCandidate.jobId}/${selectedCandidate.candidateId}`;
      } else if (interviewType === "coding") {
        payload.level = level;
        endpoint = `${Server}/api/v1/videoInterview/coding/sendEmail/${selectedCandidate.userId}/${selectedCandidate.jobId}/${selectedCandidate.candidateId}`;
      }

      await axios.post(endpoint, payload);

      toast.success("Email Invite Sent");
      setEmailLoader(false);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Error in sending Interview Invite");
      setEmailLoader(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={styles.modalContainer}>
        <button style={styles.closeButton} onClick={closeModal}>
          &times;
        </button>
        <h2 style={{ textAlign: "center" }}>Interview Invitation</h2>

        {/* Step 1: Interview type */}
        <label style={{ paddingTop: "20px" }}>Interview Type</label>
        <select
          style={styles.dropdown}
          value={interviewType}
          onChange={(e) => {
            setInterviewType(e.target.value);
            setSelectedOption("");
          }}
        >
          <option value="">-- Choose Interview Type --</option>
          <option
            value="video"
            disabled={selectedCandidate.interviewStatus === "Completed"}
          >
            Video Interview
          </option>
          <option
            value="coding"
            disabled={selectedCandidate.CodingInterviewStatus === "Completed"}
          >
            Coding Interview
          </option>
        </select>
        {/* Extra for Coding Interview */}
        {interviewType === "coding" && (
          <>
            <label style={{ paddingTop: "20px" }}>
              Select Difficulty Level
            </label>
            <select
              style={styles.dropdown}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">-- Choose Level --</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </>
        )}
        {interviewType && (
          <>
            {/* Step 2: Instruction or not */}
            <label style={{ paddingTop: "20px" }}>
              Select Instruction Option
            </label>
            <select
              style={styles.dropdown}
              value={selectedOption}
              onChange={handleOptionChange}
            >
              <option value="">-- Choose an Option --</option>
              <option value="with-instruction">
                Continue With Instruction
              </option>
              <option value="without-instruction">
                Continue Without Instruction
              </option>
            </select>
          </>
        )}

        {/* Extra for Video Interview */}
        {interviewType === "video" && (
          <>
            <label style={{ paddingTop: "20px" }}>Select Coding Round</label>
            <select
              style={styles.dropdown}
              value={isCodingRound ?? ""}
              onChange={(e) =>
                setIsCodingRound(
                  e.target.value === "true"
                    ? true
                    : e.target.value === "false"
                    ? false
                    : null
                )
              }
            >
              <option value="">-- Choose an Option --</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </>
        )}

        {/* Instruction form */}
        {selectedOption === "with-instruction" && (
          <form
            style={{
              ...styles.inputGroup,
              ...(showType4 && styles.scrollableContainer),
            }}
            onSubmit={handleSubmit}
          >
            {["question1", "question2", "question3"].map((q, idx) => (
              <div key={q}>
                <label style={styles.label}>Instruction {idx + 1}:</label>
                <input
                  type="text"
                  name={q}
                  style={styles.inputField}
                  value={formData[q]}
                  onChange={handleInputChange}
                  placeholder={`Enter Instruction ${idx + 1}`}
                />
              </div>
            ))}

            {showType4 && (
              <>
                <label style={styles.label}>Instruction 4:</label>
                <input
                  type="text"
                  name="question4"
                  style={styles.inputField}
                  value={formData.question4}
                  onChange={handleInputChange}
                  placeholder="Enter Instruction 4"
                />
              </>
            )}
            {showType5 && (
              <>
                <label style={styles.label}>Instruction 5:</label>
                <input
                  type="text"
                  name="question5"
                  style={styles.inputField}
                  value={formData.question5}
                  onChange={handleInputChange}
                  placeholder="Enter Instruction 5"
                />
              </>
            )}
            {!showType5 && (
              <button
                type="button"
                style={styles.addButton}
                onClick={handleAddMore}
              >
                + Add More
              </button>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button
              type="submit"
              disabled={emailLoader}
              style={{
                ...styles.submitButton,
                ...(emailLoader && styles.disabledButton),
              }}
            >
              {emailLoader ? "Sending..." : "Send Invite With Instruction"}
            </button>
          </form>
        )}

        {selectedOption === "without-instruction" && (
          <div style={styles.skipAssessment}>
            <button
              onClick={handleSubmit}
              disabled={emailLoader}
              style={{
                ...styles.skipButton,
                ...(emailLoader && styles.disabledButton),
              }}
            >
              {emailLoader ? "Sending..." : "Send Invite Without Instruction"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  dropdown: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  inputGroup: { marginTop: "20px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  inputField: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  addButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  submitButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  skipAssessment: { marginTop: "20px", textAlign: "center" },
  skipButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  scrollableContainer: { maxHeight: "300px", overflowY: "auto" },
};

export default DemoModal;

{
  /*import React, { useState, useEffect } from "react";
import axios from "axios";
import { Server } from "App";
import { Spin } from "antd";
import toast, { Toaster } from "react-hot-toast";

const DemoModal = ({ isModalOpen, setIsModalOpen, selectedCandidate }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [formData, setFormData] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const [showType4, setShowType4] = useState(false);
  const [showType5, setShowType5] = useState(false);
  const [error, setError] = useState("");
  const [emailLoader, setEmailLoader] = useState(false);
  const [interviewType, setInterviewType] = useState(null);
  const [isCoding, setIsCoding] = useState(null);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(isModalOpen);
  };
  // console.log(selectedCandidate);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOption(""); // Reset the selected option when closing the modal
    setFormData({
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: "",
    }); // Reset the form data
    setShowType4(false);
    setShowType5(false);
    setInterviewType("");
    setIsCoding();
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // console.log(convertObjectToArray());

  const handleAddMore = () => {
    if (!showType4) {
      setShowType4(true);
    } else if (!showType5) {
      setShowType5(true);
    }
  };
  const convertObjectToArray = (array) => {
    return Object.values(array).filter((value) => value !== "");
  };
  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    const instructions = convertObjectToArray(formData);
    // console.log(instructions);

    try {
      if (selectedOption === "with-instruction" && instructions.length < 3) {
        // console.log(error);
        setError("Atleast three instructions required");
      } else {
        setEmailLoader(true);
        let payload = {
          ...selectedCandidate,
          instructions,
          region: "United States",
          // interviewType: interviewType,
          isCodingRound: isCoding,
        };
        console.log(payload);
        // console.log(
        //   `${Server}/api/v1/videoInterview/sendEmail/${selectedCandidate.userId}/${selectedCandidate.jobId}/${selectedCandidate.candidateId}`
        // );
        const { data } = await axios.post(
          `${Server}/api/v1/videoInterview/sendEmail/${selectedCandidate.userId}/${selectedCandidate.jobId}/${selectedCandidate.candidateId}`,
          payload
        );
        // // console.log(data);
        toast.success("Email Invite Sent");
        setEmailLoader(false);
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      // console.log(err);
      toast.error("Error in sending Interview Invite");
    }
    // console.log(formData);
  };

  if (!isModalOpen) {
    return (
      <div style={styles.appContainer}>
        <button style={styles.openButton} onClick={openModal}>
          Open Modal
        </button>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={styles.modalContainer}>
        <button style={styles.closeButton} onClick={closeModal}>
          &times;
        </button>
        <h2 style={{ textAlign: "center" }}>Interview Invitation</h2>

        {/*  <label style={{ paddingTop: "20px" }}>Interview Type</label>
        <select
          style={styles.dropdown}
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
        >
          <option value="">-- Choose Interview Type --</option>
          <option value="Coding Interview">Coding Interview</option>
          <option value="Technical Interview">Technical Interview</option>
        </select>

        <label style={{ paddingTop: "20px" }}>Select Instruction Option</label>
        <select
          style={styles.dropdown}
          value={selectedOption}
          onChange={handleOptionChange}
        >
          <option value="">-- Choose an Option --</option>
          <option value="with-instruction">Continue With Instruction</option>
          <option value="without-instruction">
            Continue Without Instruction
          </option>
        </select>

        <label style={{ paddingTop: "20px" }}>Select Coding Round</label>
        <select
          style={styles.dropdown}
          value={isCoding}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "true") setIsCoding(true);
            else if (value === "false") setIsCoding(false);
            else setIsCoding(null);
          }}
        >
          <option value="">-- Choose an Option --</option>
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
        {/* {selectedOption === "with-instruction" && (
          <form style={styles.inputGroup} onSubmit={handleSubmit}>
        {selectedOption === "with-instruction" && (
          <form
            style={{
              ...styles.inputGroup,
              ...(showType4 && styles.scrollableContainer), // Add scroll style if 4+ inputs
            }}
            onSubmit={handleSubmit}
          >
            <label style={styles.label} htmlFor="question1">
              Instruction 1:
            </label>
            <input
              type="text"
              name="question1"
              id="question1"
              style={styles.inputField}
              value={formData.type1}
              onChange={handleInputChange}
              placeholder="Enter Instruction 1"
            />

            <label style={styles.label} htmlFor="question2">
              Instruction 2:
            </label>
            <input
              type="text"
              name="question2"
              id="question2"
              style={styles.inputField}
              value={formData.type2}
              onChange={handleInputChange}
              placeholder="Enter Instruction 2"
            />

            <label style={styles.label} htmlFor="question3">
              Instruction 3:
            </label>
            <input
              type="text"
              name="question3"
              id="question3"
              style={styles.inputField}
              value={formData.type3}
              onChange={handleInputChange}
              placeholder="Enter Instruction 3"
            />

            {showType4 && (
              <>
                <label style={styles.label} htmlFor="question4">
                  Instruction 4:
                </label>
                <input
                  type="text"
                  name="question4"
                  id="question4"
                  style={styles.inputField}
                  value={formData.type4}
                  onChange={handleInputChange}
                  placeholder="Enter Instruction 4"
                />
              </>
            )}
            {error?.length != 0 ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : null}
            {showType5 && (
              <>
                <label style={styles.label} htmlFor="question5">
                  Instruction 5:
                </label>
                <input
                  type="text"
                  name="question5"
                  id="type5"
                  style={styles.inputField}
                  value={formData.type5}
                  onChange={handleInputChange}
                  placeholder="Enter Instruction 5"
                />
              </>
            )}

            {!showType5 && (
              <button
                type="button"
                style={styles.addButton}
                onClick={handleAddMore}
              >
                + Add More
              </button>
            )}

            <button
              type="submit"
              // style={styles.submitButton}
              disabled={emailLoader}
              style={{
                ...styles.submitButton,
                ...styles.skipButton,
                ...(emailLoader && {
                  backgroundColor: "#ccc",
                  color: "#666",
                  cursor: "not-allowed",
                  opacity: 0.6,
                }),
              }}
            >
              {emailLoader ? "Sending..." : "Send Invite With Instruction"}
            </button>
          </form>
        )}

        {selectedOption === "without-instruction" && (
          <div style={styles.skipAssessment}>
            <button
              // style={styles.skipButton}
              onClick={handleSubmit}
              disabled={emailLoader}
              style={{
                ...styles.skipButton,
                ...(emailLoader && {
                  backgroundColor: "#ccc",
                  color: "#666",
                  cursor: "not-allowed",
                  opacity: 0.6,
                }),
              }}
            >
              {emailLoader ? "Sending..." : "Send Invite Without Instruction"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline CSS styles
const styles = {
  appContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  openButton: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    position: "relative",
    animation: "slide-down 0.3s ease",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  dropdown: {
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  inputGroup: {
    marginTop: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  submitButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  addButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  skipAssessment: {
    marginTop: "20px",
    textAlign: "center",
  },
  skipButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  scrollableContainer: {
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "5px",
  },
};

export default DemoModal;*/
}
