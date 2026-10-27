import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
// import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import practiceApi from "../practiceApi";
import {
  PracticeHeader,
  PracticeLoading,
  PracticeResult,
  PracticeRetry,
} from "../PracticeStates";
import { Button } from "antd";
import logo2 from "../../../assets/logo-white-new.png";
import logo from "../../../assets/images/loader.png";
import "../../VideoAssessment/codeEditor.css";
import NewLogo from "../../../assets/logo-twos.png";
import { Server } from "App";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { Tooltip } from "antd";
import { jwtDecode } from "jwt-decode";

export default function CodingPractice() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.state?.practiceSessionId)
      navigate("/practiceInterview", { replace: true });
  }, [location.state, navigate]);
  const {
    jobTitle,
    resume_text,
    job_description_text,
    level,
    practiceSessionId,
  } = location.state || {};
  const [submissionError, setSubmissionError] = useState(false);
  const finalAnswersRef = useRef(null);
  const screenStreamRef = useRef(null);
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
    if (!token) return;
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
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (webcamRef.current && cameraStreamRef.current) {
      webcamRef.current.srcObject = cameraStreamRef.current;
    }
  }, [step, qLoader]);
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

      screenStreamRef.current = screenStream;
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

      const { data } = await practiceApi.post(
        `/genrate/coding/question`,
        payload,
        { headers: { "X-Practice-Session": practiceSessionId } }
      );
      // console.log(data);
      // console.log(data.data);
      if (data.data.status === "error" || !data.data.questions?.length) {
        throw new Error("Questions could not be prepared. Please try again.");
      } else {
        setQuestions(data.data.questions);
        // mediaRecorderRef.current.onstop = saveRecording;
        setQloader(false);
      }
      setStep(3); // move to coding step
    } catch (err) {
      if (mediaRecorderRef.current?.state === "recording")
        mediaRecorderRef.current.stop();
      screenStream?.getTracks().forEach((track) => track.stop());
      setQloader(false);
      alert(
        err.response?.data?.message ||
          "Unable to start your interview. Please return to Practice Assessment and try again."
      );
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
    finalAnswersRef.current = finalAnswers;
    setSubmissionError(false);
    setQloader(true);
    // stopRecording();
    if (mediaRecorderRef.current?.state === "recording") {
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
      const response = await practiceApi.post(
        `/coding/update/details/${userId}`,
        formData,
        { headers: { "X-Practice-Session": practiceSessionId } }
      );
      if (response.data?.status === false)
        throw new Error("Submission not confirmed");
      setQloader(false);
      setStep(5); // Only show success after the server confirms submission.
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      // setTimeout(() => {
      //   window.location.reload();
      // }, 150000);
    } catch (err) {
      setQloader(false);
      setSubmissionError(true);
    }
  };

  // ----- NEXT QUESTION -----
  const nextQuestion = async () => {
    if (isSubmitting || isRunning || code.trim() === "") return; // Do nothing if code is empty

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
    <main className="ss-coding-session">
      <PracticeHeader type="Coding" title={jobTitle}>
        {step === 4 && (
          <span className="ss-recording">
            ● Recording · Screen sharing active
          </span>
        )}
      </PracticeHeader>
      {qLoader ? (
        <PracticeLoading
          title={
            finalAnswersRef.current
              ? "Submitting your responses"
              : "Preparing your interview"
          }
          description={
            finalAnswersRef.current
              ? "Your recording and code are uploading. Keep this tab open until submission is confirmed."
              : "Preparing coding questions based on your role and resume. Keep this tab open."
          }
        />
      ) : submissionError ? (
        <PracticeRetry
          onRetry={() => submitInterview(finalAnswersRef.current)}
        />
      ) : step === 5 ? (
        <PracticeResult
          type="coding"
          sessionId={practiceSessionId}
          jobTitle={jobTitle}
        />
      ) : step === 4 ? (
        <>
          <div className="ss-session-toolbar">
            <strong>
              Question {currentQ + 1} of {questions.length}
            </strong>
            <div className="ss-question-progress">
              {questions.map((_, i) => (
                <span key={i} className={i === currentQ ? "active" : ""}>
                  {i + 1}
                </span>
              ))}
            </div>
            <span>{level}</span>
          </div>
          <div className="ss-code-grid">
            <aside>
              <section className="ss-card ss-card-padding">
                <span className="ss-eyebrow">CODING QUESTION</span>
                <h1 className="ss-code-question">
                  {questions[currentQ]?.question}
                </h1>
                <div className="ss-info">
                  Write your solution in the editor. Run your code to review the
                  output before submitting.
                </div>
              </section>
              <section className="ss-card ss-card-padding">
                <span className="ss-eyebrow">YOUR CAMERA</span>
                <video
                  ref={webcamRef}
                  autoPlay
                  muted
                  playsInline
                  className="ss-camera-preview"
                />
              </section>
            </aside>
            <section className="ss-code-workspace">
              <div className="ss-editor-toolbar">
                <label htmlFor="practice-language">
                  Language{" "}
                  <select
                    id="practice-language"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      setOutput("");
                    }}
                  >
                    {[
                      ["javascript", "JavaScript"],
                      ["ts", "TypeScript"],
                      ["python", "Python"],
                      ["cpp", "C++"],
                      ["c", "C"],
                      ["java", "Java"],
                      ["go", "Go"],
                      ["php", "PHP"],
                      ["ruby", "Ruby"],
                      ["cs", "C#"],
                      ["kotlin", "Kotlin"],
                      ["rust", "Rust"],
                      ["swift", "Swift"],
                      ["r", "R"],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="primary"
                  disabled={isCodeEmpty || isRunning || isSubmitting}
                  loading={isRunning}
                  onClick={runCode}
                >
                  Run code ▷
                </Button>
              </div>
              <Editor
                height="460px"
                theme="vs-dark"
                language={
                  { ts: "typescript", cs: "csharp" }[language] || language
                }
                value={code}
                onChange={(v) => {
                  setCode(v ?? "");
                  setOutput("");
                }}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
              <div className="ss-code-output">
                <h2>Output</h2>
                <pre>{output || "Run your code to see the output here."}</pre>
              </div>
            </section>
          </div>
          <footer className="ss-session-bottom">
            <span>ⓘ Keep this tab open while your recording is active.</span>
            <Button
              type="primary"
              size="large"
              disabled={isCodeEmpty || isRunning || isSubmitting}
              loading={isSubmitting}
              onClick={nextQuestion}
            >
              {currentQ === questions.length - 1
                ? "Finish & submit"
                : "Submit & next question →"}
            </Button>
          </footer>
        </>
      ) : (
        <div className="ss-device-page">
          <h1>Let’s check your devices</h1>
          <p>
            Your microphone and shared screen are recorded during coding
            practice.
          </p>
          <div className="ss-grid">
            <section className="ss-card ss-card-padding">
              <h2>Camera preview</h2>
              {step >= 2 ? (
                <video
                  ref={webcamRef}
                  autoPlay
                  muted
                  playsInline
                  className="ss-camera-preview"
                />
              ) : (
                <div className="ss-camera-placeholder">
                  <i className="la la-video" />
                  <p>Enable your camera to see your preview.</p>
                </div>
              )}
              <div className="ss-info">
                {step >= 2
                  ? "Camera and microphone access granted."
                  : "We’ll ask for camera and microphone access."}
              </div>
            </section>
            <section className="ss-card ss-card-padding">
              <h2>Ready to begin</h2>
              <dl className="ss-device-status">
                <div>
                  <dt>Camera & microphone</dt>
                  <dd className={step >= 2 ? "ready" : ""}>
                    {step >= 2 ? "● Ready" : "Not started"}
                  </dd>
                </div>
                <div>
                  <dt>Screen sharing</dt>
                  <dd className={step >= 3 ? "ready" : ""}>
                    {step >= 3 ? "● Active" : "Not started"}
                  </dd>
                </div>
              </dl>
              <div className="ss-info">
                Keep this tab open throughout your practice. Your recording
                starts when you share your screen.
              </div>
              {step < 2 ? (
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={requestCameraAccess}
                >
                  Allow camera & microphone
                </Button>
              ) : step === 2 ? (
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={startRecording}
                >
                  Share screen & prepare questions
                </Button>
              ) : (
                <>
                  <p>
                    Answer each question in the editor. Run your code, then
                    submit to continue. Your responses are uploaded after the
                    final question.
                  </p>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => setStep(4)}
                  >
                    Start coding interview →
                  </Button>
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
