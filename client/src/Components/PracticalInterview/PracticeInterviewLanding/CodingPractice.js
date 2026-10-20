import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
// import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import practiceApi from "../practiceApi";
import logo2 from "../../../assets/logo-white-new.png";
import logo from "../../../assets/images/loader.png";
import "../../VideoAssessment/codeEditor.css";
import NewLogo from "../../../assets/logo-twos.png";
import { Server } from "App";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { use } from "react";
import jsPDF from "jspdf";
import { Tooltip } from "antd";
import { jwtDecode } from "jwt-decode";

export default function CodingPractice() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.state?.practiceSessionId) navigate("/practiceInterview", { replace: true });
  }, [location.state, navigate]);
  const { jobTitle, resume_text, job_description_text, level, practiceSessionId } = location.state || {};
  const [step, setStep] = useState(0); // 0=Instruction,1=Camera Access,2=Recording,3=Coding,4=Finish
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [jobData, setJobData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qLoader, setQloader] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordedChunks = useRef([]);
  const mediaRecorderRef = useRef(null);
  const webcamRef = useRef(null);
  const cameraStreamRef = useRef(null); // store camera stream persistently
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCodeEmpty = code.trim() === "";
  const [empemail, setEmpEmail] = useState(null);
  const [cameraStream, setCameraStream] = useState(null); // for camera preview
  const [candidateEmail, setCandidateEmail] = useState(null);
  let userId = localStorage.getItem("UserId");

  // const questions = [
  //   "Write a function add(a,b) that returns the sum of two numbers.",
  //   "Write a function to reverse a string.",
  //   "Write a function to check if a number is prime.",
  // ];
  const hasFetched = useRef(false);

  useEffect(() => {
    let token = localStorage.getItem("token");
    const { email } = jwtDecode(token);
    console.log(email);

    setCandidateEmail(email);
    // console.log(jobTitle, resume_text, job_description_text, level);candidateEmail
  }, []);
  // console.log(jobData);

  // ----- CAMERA ACCESS -----
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      cameraStreamRef.current = stream;
      // if (webcamRef.current) {
      //   webcamRef.current.srcObject = stream;
      // }
      setStep(2); // go to screen recording step
    } catch (err) {
      alert("Camera/Mic permission denied: " + err.message);
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (webcamRef.current && cameraStreamRef.current) {
      webcamRef.current.srcObject = cameraStreamRef.current;
    }
  }, [step]);
  // ----- SCREEN RECORDING -----
  const startRecording = async () => {
    let screenStream;
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor", // Prefer entire screen
        },
        audio: true,
      });

      // Mix mic audio into screen recording if needed
      let combinedStream = screenStream;
      if (cameraStreamRef.current) {
        const audioTrack = cameraStreamRef.current.getAudioTracks()[0];
        if (audioTrack) combinedStream.addTrack(audioTrack);
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });
      // setMediaRecorder(recorder);
      mediaRecorderRef.current = recorder;
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };
      mediaRecorderRef.current.start();
      setQloader(true);
      const payload = {
        resume_text: resume_text,
        job_description_text: job_description_text,
        level: level,
        instructions: [],
      };

      const { data } = await practiceApi.post(`/genrate/coding/question`, payload, { headers: { "X-Practice-Session": practiceSessionId } });
      // console.log(data);
      // console.log(data.data);
      if (data.data.status === "error") {
        alert("Error in loading the question");
        setStep(0); // success page
      } else {
        setQuestions(data.data.questions);
        // mediaRecorderRef.current.onstop = saveRecording;
        setQloader(false);
      }
      setStep(3); // move to coding step
    } catch (err) {
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      screenStream?.getTracks().forEach((track) => track.stop());
      setQloader(false);
      alert(err.response?.data?.message || "Unable to start your interview. Please return to Practice Assessment and try again.");
      if (err.response) navigate("/practiceInterview");
    }
  };

  const saveRecording = () => {
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coding-round.webm";
    a.click();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
  };

  // ----- CODE EXECUTION -----
  const runCode = async () => {
    try {
      setIsRunning(true);
      const { data } = await axios.post(
        `https://skillstream-backend-1.onrender.com/api/v1/codingInterview/code/execute`,
        { language, code }
      );
      setOutput(String(data?.output ?? "No output"));
      setIsRunning(false);
      return data?.output ?? "No output";
    } catch (err) {
      setOutput("Error: " + err.message);
      setIsRunning(false);
    }
  };
  const submitInterview = async (finalAnswers) => {
    // stopRecording();
    if (mediaRecorderRef.current) {
      // Wrap in a Promise to wait until onstop is done
      await new Promise((resolve) => {
        mediaRecorderRef.current.onstop = () => {
          resolve();
        };
        mediaRecorderRef.current.stop();
      });
    }
    setQloader(true);
    // console.log(finalAnswers);

    // Separate arrays
    const questionsArr = finalAnswers.map((item) => item.question);
    const answersArr = finalAnswers.map((item) => item.code);
    const outputsArr = finalAnswers.map((item) => item.output);
    // console.log("generatePdf");
    // ✅ Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Coding Interview Report", 10, 10);

    let y = 20; // starting Y position

    finalAnswers.forEach((item, index) => {
      doc.setFontSize(12);

      // Question
      const questionLines = doc.splitTextToSize(
        `Q${index + 1}: ${item.question}`,
        180
      );
      doc.text(questionLines, 10, y);
      y += questionLines.length * 7; // increase Y based on number of lines

      // Answer
      const answerLines = doc.splitTextToSize(`Answer: ${item.code}`, 180);
      doc.text(answerLines, 10, y);
      y += answerLines.length * 7;

      // Output
      const outputLines = doc.splitTextToSize(`Output: ${item.output}`, 180);
      doc.text(outputLines, 10, y);
      y += outputLines.length * 7 + 5; // add extra spacing between Q&As
    });
    // console.log("generated Pdf");

    const pdfBlob = doc.output("blob");
    // build video blob
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const file = new File([blob], "video.webm", { type: "video/webm" });

    const formData = new FormData();
    formData.append("video", file);
    formData.append("pdf", pdfBlob, "interview-report.pdf"); // attach PDF
    formData.append("questions", JSON.stringify(questionsArr));
    formData.append("answers", JSON.stringify(answersArr));
    formData.append("outputs", JSON.stringify(outputsArr));
    formData.append("candidateEmail", candidateEmail);
    formData.append("jobTitle", jobTitle);
    formData.append("region", "United States");

    // userId, candidateId: id, jobId
    try {
      console.log("submitting details");
      await practiceApi.post(`/coding/update/details/${userId}`, formData, { headers: { "X-Practice-Session": practiceSessionId } });
      setQloader(false);
      setStep(5); // success page
      // setTimeout(() => {
      //   window.location.reload();
      // }, 150000);
    } catch (err) {
      setQloader(false);
      alert("Submit failed: " + err.message);
    }
  };

  // ----- NEXT QUESTION -----
  const nextQuestion = async () => {
    if (code.trim() === "") return; // Do nothing if code is empty

    setIsSubmitting(true);

    try {
      // ✅ Always ensure we have a valid output before proceeding
      let result = output.trim();
      if (!result) {
        result = await runCode(); // Wait until runCode finishes and returns output
      }

      const newAnswer = {
        question: questions[currentQ].question,
        code,
        output: result, // ✅ use the result returned by runCode, not stale state
      };
      console.log(newAnswer);
      setAnswers((prev) => [...prev, newAnswer]);

      if (currentQ < questions.length - 1) {
        // ✅ Move to next question only after output is ready
        setCurrentQ((prev) => prev + 1);
        setCode("");
        setOutput("");
        setIsSubmitting(false);
      } else {
        const Q_A = answers.concat(newAnswer);
        await submitInterview(Q_A); // Wait for full submit
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error in nextQuestion:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vh-100 d-flex flex-column bg-dark text-light">
      {/* ✅ Persistent Header */}
      <header className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
        <img src={logo2} alt="Company Logo" style={{ height: "40px" }} />
        {step === 0 && (
          <button className="btn btn-primary px-4" onClick={() => setStep(1)}>
            {step === 0 ? "Start" : "Next"}
          </button>
        )}
      </header>
      {qLoader ? (
        <div className="logo-container">
          <img src={logo} alt="S Logo Loader" className="heartbeat w-24 h-24" />
          <div className="text-white mt-4">
            {step === 0
              ? "Uploading..."
              : step === 2
              ? "Fetching Questions"
              : step === 3
              ? "Submitting"
              : "Loading..."}
          </div>
        </div>
      ) : (
        <div className="flex-fill d-flex flex-column">
          {/* Step 0 – Instructions */}
          {step === "Completed" && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill text-center px-3">
              <h3 className="fw-bold text-success mb-3">
                Interview Already Completed
              </h3>
              <p className="text-secondary mb-4 w-75 text-white">
                You have already completed this interview. Your responses have
                been recorded successfully.
              </p>
              <button
                className="btn btn-outline-light px-4"
                onClick={() => (window.location.href = "/")}
              >
                Return to Home
              </button>
            </div>
          )}

          {/* Step - Expired Link */}
          {step === "expired" && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill text-center px-3">
              <h3 className="fw-bold text-danger mb-3">
                Interview Link Expired
              </h3>
              <p className="text-secondary mb-4 w-75 text-white">
                This interview link has expired. Please contact your recruiter
                if you need a new link.
              </p>
              <button className="btn btn-outline-light px-4" disabled>
                Employer Email: {empemail || "Not available"}
              </button>
            </div>
          )}
          {step === 0 && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill text-center px-3">
              <h1 className="fw-bold mb-3 text-white">Coding Interview Test</h1>
              <p className="text-secondary mb-4 w-75 text-white">
                You will solve 3 programming questions while your screen, audio,
                and camera are recorded. Make sure you have a stable internet
                connection and a working webcam/microphone.
              </p>
            </div>
          )}

          {/* Step 1 – Camera/Mic Permission */}
          {step === 1 && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill text-center px-3">
              <h3 className="fw-bold mb-3 text-white">
                Allow Camera & Microphone
              </h3>
              <p className="text-secondary mb-4 w-75 text-white">
                Please allow access to your camera and microphone to proceed.
              </p>
              <button
                className="btn btn-primary px-4"
                onClick={requestCameraAccess}
              >
                Allow & Continue
              </button>
            </div>
          )}

          {/* Step 2 – Start Recording */}
          {step === 2 && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill text-center px-3">
              <h3 className="fw-bold mb-3 text-white">Start Recording</h3>
              <p className="text-secondary mb-4 w-75 text-white">
                Your camera preview is below. Click Start to share your screen
                and begin recording.
              </p>
              <div
                className="border mb-4"
                style={{ width: "320px", height: "240px" }}
              >
                <video
                  ref={webcamRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <button
                className="btn btn-primary px-4"
                onClick={() => startRecording()}
              >
                Start Recording & Begin Test
              </button>
            </div>
          )}
          {/* Step 3 – Coding Instructions */}
          {step === 3 && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill text-center px-3">
              <h3 className="fw-bold mb-3 text-white">
                Coding Round Instructions
              </h3>
              <div
                className="bg-dark border border-secondary rounded p-4 text-start text-white w-75"
                style={{ maxWidth: "800px" }}
              >
                <ul
                  className="text-start d-inline-block mx-auto text-white mb-3"
                  style={{ lineHeight: "1.8" }}
                >
                  <li>
                    1. You will solve multiple coding questions one after
                    another.
                  </li>
                  <li>
                    2. Each question must be solved inside the built-in code
                    editor.
                  </li>
                  <li>
                    3. You must click <b>Run</b> to execute and verify your code
                    output before submitting.
                  </li>
                  <li>
                    4. Once the output looks correct, click <b>Submit</b> to
                    move to the next question.
                  </li>
                  <li>
                    5. After the last question, your answers and recording will
                    be automatically submitted.
                  </li>
                </ul>
                <p className="text-warning">
                  ⚠️ Once you begin, the recording continues until all questions
                  are completed. Do not close or refresh the page.
                </p>
              </div>

              <button
                className="btn btn-primary mt-4 px-5"
                onClick={() => setStep(4)} // move to coding interface
              >
                Accept & Begin Coding
              </button>
            </div>
          )}
          {/* Step 4 – Coding Round */}
          {step === 4 && (
            <div className="d-flex flex-fill">
              {/* LEFT PANEL – Question + Camera */}
              <div className="col-4 border-end border-secondary p-4 overflow-auto d-flex flex-column">
                <h4 className="fw-bold mb-3 text-blue-400">
                  Question {currentQ + 1}
                </h4>
                <p className="text-white mb-4">
                  {questions[currentQ].question}
                </p>

                {/* ✅ Camera Feed */}
                <div
                  className="mt-4 border"
                  style={{ width: "100%", height: "240px" }}
                >
                  <video
                    ref={webcamRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              {/* RIGHT PANEL – Editor + Output */}
              <div className="col-8 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center bg-secondary p-2">
                  <div className="d-flex align-items-center">
                    <label htmlFor="language" className="me-2 fw-semibold">
                      Language:
                    </label>
                    <select
                      id="language"
                      className="form-select form-select-sm bg-dark text-light border-light"
                      style={{ width: "150px" }}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {" "}
                      <option value="javascript">JavaScript</option>
                      <option value="ts">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                      <option value="java">Java</option>
                      {/* Extra popular languages */}
                      <option value="go">Go</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="cs">C#</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="rust">Rust</option>
                      <option value="swift">Swift</option>
                      <option value="r">R</option>
                    </select>
                  </div>
                  <Tooltip
                    title={
                      isCodeEmpty
                        ? "Enter valid code"
                        : isRunning
                        ? "Loading"
                        : "Run code"
                    }
                  >
                    {" "}
                    <button
                      className="btn btn-primary btn-sm run-btn"
                      onClick={() => runCode()}
                      disabled={isCodeEmpty || isRunning || isSubmitting}
                      title={isCodeEmpty ? "Enter valid code" : ""}
                    >
                      {isRunning ? "Running…" : "Run ▶"}
                    </button>
                  </Tooltip>
                </div>

                <div className="flex-fill border-bottom border-secondary">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    value={code}
                    onChange={(v) => setCode(v ?? "")}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div
                  className="bg-secondary p-3 d-flex flex-column"
                  style={{
                    height: "200px",
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-semibold text-white m-0">Output</h6>
                    <Tooltip
                      title={
                        isCodeEmpty
                          ? "Enter valid code"
                          : isSubmitting
                          ? "Submitting"
                          : "Submit code"
                      }
                    >
                      {" "}
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => nextQuestion()}
                      >
                        {currentQ === questions.length - 1
                          ? "Finish"
                          : isSubmitting
                          ? "Submitting"
                          : "Submit"}
                      </button>
                    </Tooltip>
                  </div>
                  <pre
                    className="text-success m-0 text-white"
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                  >
                    {output}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 – Completion */}
          {step === 5 && (
            <div className="d-flex flex-column justify-content-center align-items-center flex-fill">
              <h3 className="fw-bold">Interview Completed</h3>
              <p className="text-secondary">
                Your answers have been submitted successfully. Thank you!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
