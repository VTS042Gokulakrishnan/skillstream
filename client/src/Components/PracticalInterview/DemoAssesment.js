import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import VideoCam from "./VideoCam";
import QuestionPanel from "./QuestionPanel";
import FeedbackModal from "./FeedModal";
import InstructionsModal from "./InstructionModal";
import { FaRobot, FaClock, FaUser } from "react-icons/fa";
import { Tooltip, Button } from "antd";
// import { FaRobot, FaUser } from "react-icons/fa";
import "./QuestionPanel.css";
import backgroundImage from "../../assets/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner.jpg";
import axios from "axios";
import { Server } from "App";
import jsPDF from "jspdf";
import { jwtDecode } from "jwt-decode";

const PracticalInterview = () => {
  const location = useLocation();
  const { jobTitle, questions, resume_text, job_description_text } =
    location.state || {};
  const [isSetup, setIsSetup] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isInterviewRunning, setIsInterviewRunning] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [loading, setLoading] = useState(false); // Loader state
  const [startLoader, setStartLoader] = useState(false);
  const [displayQuestion, setDisplayQuestion] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [speechStart, setSpeechStart] = useState(false);
  const audioRef = useRef(null);
  const speechRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRecordedChunks = useRef([]);
  const mediaRecorderRef = useRef(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [SpeechStream, setSpeechSStream] = useState(null);
  const [nextQuestionLoader, setNextQuestionLoader] = useState(false);
  const [nextText, setNextText] = useState("Next Question");
  const [showNextButton, setShowNextButton] = useState(false);
  const [nextFetch, setNextFetch] = useState("Fetching Next Question");
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [speech, setSpeech] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [score, setScore] = useState("0");
  // console.log(speechRecorderRef);
  const [allQ, sertAllQ] = useState([]);
  const [allA, setAllA] = useState([]);
  useEffect(() => {
    // Speech Recognition Setup
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new window.SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;

    recognitionRef.current.addEventListener("result", (e) => {
      const interimTranscript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      // console.log(interimTranscript);

      // setDisplayedAnswer(interimTranscript);
    });

    recognitionRef.current.addEventListener("speechend", async () => {
      // setDisplayedAnswer("");
      setSpeech(false);
      // console.log("speech ended");
      // setShowNext(true);
      // setTimeout(() => {
      //   handleNextQuestion();
      // }, 2000);
    });
  }, []);
  // const audioRef = useRef(null);
  //convert text to speech
  const convertTextToSpeech = async (Question) => {
    try {
      let payLoad = {
        textInput: `${Question}`,
      };
      const { data } = await axios.post(
        `${Server}/api/v1/parser/convert/tts`,
        payLoad,
        {
          headers: {
            // Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          responseType: "arraybuffer",
        }
      );
      const audioBlob = new Blob([data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      // console.log(audioUrl);

      if (audioRef.current) {
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src); // Revoke the old URL to prevent memory leaks
        }
        audioRef.current.src = audioUrl;
        const handleAudioEnd = () => {
          // Set speech to true after playback has finished
          // convertTextToSpeech("Now you can start answering");
          setSpeech(true);
          setTimeout(() => {
            setShowNextButton(true);
          }, [5000]);
          setAnimationStarted(true);
          audioRef.current.removeEventListener("ended", handleAudioEnd);
        };

        audioRef.current.addEventListener("ended", handleAudioEnd);

        audioRef.current.play();
        // Automatically play the audio
      }
      // audioRef.current.src = audioUrl;
      // audioRef.current.play(); // Automatically play the audio
    } catch (error) {
      // console.log(error);
    }
  };
  // useEffect(() => {
  //   if (speechStart) {
  //     setAnimationStarted(false);
  //     console.log("hi");
  //     convertTextToSpeech(`${displayQuestion}. Now you can start answering.`);
  //   }
  //   //   }
  //   // convertTextToSpeech(`${thankYouMessage}`);
  //   // convertTextToSpeech(`${displayQuestion}.Now you can start answer.`);
  //   // if ("speechSynthesis" in window) {
  //   //   const utterance = new SpeechSynthesisUtterance(displayQuestion);
  //   //   utterance.onend = () => setAnimationStarted(true);
  //   //   window.speechSynthesis.speak(utterance);
  //   // }
  //   // }
  // }, [speechStart]);
  // useEffect(() => {
  //   if (showThankYouMessage && !analysed) {
  //     convertTextToSpeech(`${thankYouMessage}`);
  //   }
  // }, [showThankYouMessage]);
  // text to speech
  const startSpeechRecording = async () => {
    try {
      // console.log("Speech Recording started");
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setSpeechSStream(audioStream);
      speechRecorderRef.current = new MediaRecorder(audioStream);
      speechRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioRecordedChunks.current.push(event.data);
        }
      };
      speechRecorderRef.current.start();
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (speech) {
      // console.log("speech started");
      startSpeechRecording();
    } else {
      recognitionRef.current.stop();
      // console.log("speech stopped");
    }
  }, [speech]);

  // next question api & specch to text conversion

  const answerAnimationStyle = {
    display: animationStarted ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "40px",
    animation: "fadeIn 1s ease-in-out",
  };
  // convert text to
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const frequencyBarStyle = (color, delay) => ({
    width: "10px",
    height: "50px",
    margin: "0 4px",
    borderRadius: "4px",
    backgroundColor: color,
    animation:
      "waveFrequency 1.5s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    animationDelay: `${delay}s`,
  });
  const stopSpeechRecording = async () => {
    try {
      recognitionRef.current.stop();
      if (speechRecorderRef.current) {
        speechRecorderRef.current.stop();
        // console.log("Stopping speech recorder...");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const handleNextQuestion = async () => {
    setSpeechStart(false);
    setAnimationStarted(false);
    setSpeech(false);
    setNextQuestionLoader(true);
    setShowNextButton(false);
    try {
      stopSpeechRecording();
      // console.log("next question", questionCount);
      speechRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioRecordedChunks.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        const file = new File([audioBlob], "audio.webm", {
          type: "audio/webm",
        });
        formData.append("file", file);

        // Make the API call to get the transcribed text
        const { data } = await axios.post(
          `${Server}/api/v1/parser/convert/stt`,
          formData,
          {
            headers: {
              // Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            },
          }
        );

        // Capture the transcribed answer and question
        const currentAnswer = data.text;
        const currentQuestion = displayQuestion; // Ensure the question matches the answer
        // console.log("Transcribed Text: ", currentAnswer);
        audioRecordedChunks.current = [];
        // if (SpeechStream) {
        //   SpeechStream.getTracks().forEach((track) => track.stop());
        //   setSpeechSStream(null);
        // }
        setAllAnswers((prevAnswers) => [...prevAnswers, currentAnswer]);
        setAllQuestions((prevQuestions) => [...prevQuestions, currentQuestion]);
        const payload = {
          resume_text: resumeText,
          job_description_text: jobDescriptionText,
          question: [...allQuestions, currentQuestion], // Send all previous + current question
          answer: [...allAnswers, currentAnswer], // Send all previous + current answer
          question_count: questionCount,
          instructions: [],
        };
        setAllA([...allAnswers, currentAnswer]);
        sertAllQ([...allQuestions, currentQuestion]);
        // console.log("Payload to be sent:", payload);
        const response = await axios.post(
          `${Server}/api/v1/videoInterview/genrate/question`,
          payload
        );
        if (response.data.status) {
          if (questionCount >= 8) {
            setNextText("Submit Answer");
            setNextFetch("Submitting Answer ....");
          }
          if (questionCount >= 9) {
            // setShowFeedback(true);
            setThankYouMessage(
              `${response.data.data.closing_message} .Please Don't Close the window we are submitting your answers.`
            );
            setShowThankYouMessage(true);
            setNextQuestionLoader(false);
            stopRecording();
            setInterviewCompleted(true);
            convertTextToSpeech(
              `${response.data.data.closing_message}.Please Don't Close the window we are submitting your answers.`
            );
            setTimeout(() => {
              closeFeedbackModal(currentAnswer, currentQuestion);
            }, 30000);
          } else {
            setDisplayQuestion(response.data.data.next_question);
            setSpeechStart(true);
            setNextQuestionLoader(false);
            setQuestionCount((prevCount) => prevCount + 1);
            convertTextToSpeech(
              `${response.data.data.next_question}. Now you can start answering.`
            );
          }
        }
      };
    } catch (error) {
      // console.log(error);
      setNextQuestionLoader(false);
    }
  };
  const completeInterview = async (currentAnswer, currentQ) => {
    try {
      setSpinner(true);
      let payload = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        question: [...allQuestions, currentQ],
        answer: [...allAnswers, currentAnswer],
      };
      const { data } = await axios.post(
        `${Server}/api/v1/videoInterview/analyse`,
        payload
      );
      setSpinner(false);
      setThankYouMessage(
        "Thank you for attending the interview.We have submitted your answers for review & we will get back to you soon."
      );
    } catch (error) {
      // console.log(error);
    }
  };
  const chunks = useRef([]);
  useEffect(() => {
    setResumeText(resume_text);
    setJobDescriptionText(job_description_text);
    // setIsSetup(false);
  }, [location.state]);
  // console.log(location.state);

  const startRecording = async () => {
    // Check if getDisplayMedia is supported for screen recording
    if (navigator.mediaDevices.getDisplayMedia) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true, // Attempt to capture system audio
        });

        // Attempt to capture microphone audio if supported
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Combine streams if both are available
        const combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          // ...screenStream.getAudioTracks(),
          ...audioStream.getAudioTracks(),
        ]);

        handleRecording(combinedStream);
      } catch (err) {
        console.error("Screen recording is not supported or failed", err);
        fallbackToMicrophoneOnly();
      }
    } else {
      fallbackToMicrophoneOnly();
    }
  };

  const fallbackToMicrophoneOnly = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      handleRecording(micStream);
    } catch (err) {
      console.error("Microphone recording failed:", err);
      alert("Your device does not support audio recording.");
    }
  };

  const handleRecording = (stream) => {
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      chunks.current = [];
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // const downloadVideo = () => {
  //   const a = document.createElement("a");
  //   a.href = videoUrl;
  //   a.download = "interview_session.webm";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  // const handleAnswer = (answer) => {
  //   console.log("User answer:", answer);
  //   setLoading(true); // Start loader animation

  //   setTimeout(() => {
  //     if (currentQuestion < questions.length - 1) {
  //       setCurrentQuestion((prev) => prev + 1);
  //     } else {
  //       // Automatically stop recording when the last question is finished
  //       stopRecording();
  //       setShowFeedback(true); // Show feedback after recording stops
  //     }
  //     setLoading(false); // Stop loader animation
  //   }, 2000); // Simulate loading time
  // };
  const generatePDF = () => {
    const questions = allQ;
    const answers = allA;
    // console.log(questions, answers);

    const doc = new jsPDF();
    let yPosition = 10;
    const marginLeft = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 2 * marginLeft; // Calculate the maximum width for text

    // Ensure the questions and answers array are of the same length
    const length = Math.min(questions.length, answers.length);

    for (let i = 0; i < length; i++) {
      const questionText = `${i + 1}. ${questions[i]}`;
      const answerText = `Answers: ${answers[i]}`;

      // Split the text to fit within the page width
      const splitQuestion = doc.splitTextToSize(questionText, maxLineWidth);
      const splitAnswer = doc.splitTextToSize(answerText, maxLineWidth);

      // Check if there's enough space on the page, otherwise add a new page
      if (
        yPosition + splitQuestion.length * 10 + splitAnswer.length * 10 >
        doc.internal.pageSize.getHeight()
      ) {
        doc.addPage();
        yPosition = 10; // Reset the y position for the new page
      }

      // Add the question and answer to the PDF
      doc.text(splitQuestion, marginLeft, yPosition);
      yPosition += splitQuestion.length * 10; // Adjust yPosition based on question length
      doc.text(splitAnswer, marginLeft, yPosition);
      yPosition += splitAnswer.length * 10 + 10; // Adjust yPosition for answer and add space for next question
    }

    // Trigger download of the PDF with a custom filename
    doc.save("questions_and_answers.pdf");
  };
  const generatePDFToSave = (questions, answers) => {
    // const questions = allQ;
    // const answers = allA;
    // console.log(questions, answers);

    const doc = new jsPDF();
    let yPosition = 10;
    const marginLeft = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 2 * marginLeft; // Calculate the maximum width for text

    // Ensure the questions and answers array are of the same length
    const length = Math.min(questions.length, answers.length);

    for (let i = 0; i < length; i++) {
      const questionText = `${i + 1}. ${questions[i]}`;
      const answerText = `Answers: ${answers[i]}`;

      // Split the text to fit within the page width
      const splitQuestion = doc.splitTextToSize(questionText, maxLineWidth);
      const splitAnswer = doc.splitTextToSize(answerText, maxLineWidth);

      // Check if there's enough space on the page, otherwise add a new page
      if (
        yPosition + splitQuestion.length * 10 + splitAnswer.length * 10 >
        doc.internal.pageSize.getHeight()
      ) {
        doc.addPage();
        yPosition = 10; // Reset the y position for the new page
      }

      // Add the question and answer to the PDF
      doc.text(splitQuestion, marginLeft, yPosition);
      yPosition += splitQuestion.length * 10; // Adjust yPosition based on question length
      doc.text(splitAnswer, marginLeft, yPosition);
      yPosition += splitAnswer.length * 10 + 10; // Adjust yPosition for answer and add space for next question
    }

    // Trigger download of the PDF with a custom filename
    return doc;
  };
  const startInterview = () => {
    startRecording();
    setShowInstructions(true);
  };
  const closeFeedbackModal = async (currentAnswer, currentQ) => {
    try {
      setSpinner(true);
      let token = localStorage.getItem("token");
      let userId = localStorage.getItem("UserId");

      let email;
      if (token) {
        const decodedToken = jwtDecode(token);
        email = decodedToken?.email;
      }
      let payload = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        question: [...allQuestions, currentQ],
        answer: [...allAnswers, currentAnswer],
        jobTitle,
        userId: userId,
        email: email ? email : null,
        region:"United States"
      };
      const q = [...allQuestions, currentQ];
      const a = [...allAnswers, currentAnswer];
      const formData = new FormData();
      const blob = new Blob(chunks.current, {
        type: "video/webm",
      });
      const pdfDoc = generatePDFToSave(q, a);
      const pdfBlob = pdfDoc.output("blob");
      const file = new File([blob], "video.webm", { type: "video/webm" });
      formData.append("file", file);
      formData.append("pdf", pdfBlob);
      formData.append("userId", userId);
      formData.append("jobTitle", jobTitle);


      const response = await axios.post(
        `${Server}/api/v1/practiceInterview/update/details`,
        formData
      );
      const { data } = await axios.post(
        `${Server}/api/v1/practiceInterview/analyse`,
        payload
      );

      // const scoreMatch = data?.analysis.match(/\*\*Score:\*\* (\d+\/\d+)/);
      // console.log(data);
      // console.log(scoreMatch);

      // const score = scoreMatch[1];
      // setScore(score);
      setSpinner(false);
      setThankYouMessage("Your practice interview has been completed");
      setAnalysed(true);
    } catch (error) {
      // console.log(error);
      setAnalysed(false);
      setSpinner(false);
    }
  };
  const confirmStartInterview = async () => {
    setStartLoader(true);
    try {
      let payload = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        instructions: [],
      };
      // console.log(payload);

      const response = await axios.post(
        `${Server}/api/v1/practiceInterview/startInterview`,
        payload
      );
      // console.log(response?.data?.initial_intro);
      setDisplayQuestion(response?.data?.initial_intro);
      setIsInterviewRunning(true);
      setStartLoader(false);
      setShowInstructions(false);
      setSpeechStart(true);
      convertTextToSpeech(
        `${response?.data?.initial_intro}. Now you can start answering.`
      );
    } catch (error) {
      // console.log(error);
    }
  };
  const downloadVideo = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "interview_session.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const loaderStyle = {
    width: "50px",
    height: "50px",
    border: "8px solid #f3f3f3",
    borderTop: "8px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    left: "20%",
    height: "100vh",
    background: "linear-gradient(to bottom, #000000, #1e90ff)", // Black to Vibrant Blue
    backgroundSize: "cover",
    transition: "opacity 0.5s ease",
  };
  window.addEventListener("beforeunload", () => {
    window.speechSynthesis.cancel();
  });
  const buttonContain = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  };
  return (
    <div style={containerStyle}>
      {!interviewCompleted ? (
        isSetup ? (
          <div>Please wait while we set up your interview...</div>
        ) : (
          <>
            <div
              style={{
                flex: 1,
                padding: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
              }}
            >
              {!interviewCompleted ? <VideoCam /> : null}
            </div>
            <div
              style={{
                flex: 1,
                padding: "20px",
                marginLeft: "45px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
              }}
            >
              <div style={{ position: "relative", height: "100%" }}>
                {isInterviewRunning ? (
                  <>
                    {loading && <div style={loaderStyle}></div>}
                    {nextQuestionLoader ? (
                      <div style={flipstyle}>
                        <div className="flipping">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                        <h1
                          style={{
                            fontSize: "30px",
                            color: "#fff",
                            paddingTop: "20px",
                          }}
                        >
                          {nextFetch}
                        </h1>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "20px",
                          borderRadius: "8px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                          background:
                            "linear-gradient(to bottom, #000000, #1e90ff)",
                          color: "#fff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <FaRobot size={35} color="#007bff" />
                          <h2 style={{ fontSize: "22px", fontWeight: "500" }}>
                            {displayQuestion}
                          </h2>
                          <audio
                            ref={audioRef}
                            style={{ display: "none" }}
                          ></audio>
                        </div>

                        <div style={answerAnimationStyle}>
                          <FaUser size={35} color="#007bff" />
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {[...Array(15)].map((_, i) => (
                              <div
                                key={i}
                                style={frequencyBarStyle(
                                  getRandomColor(),
                                  i * 0.1
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <div style={{ textAlign: "center", marginTop: "40px" }}>
                          <Tooltip
                            title={
                              !showNextButton
                                ? "You have to answer to move to next question"
                                : "Click to move to next question"
                            }
                          >
                            <button
                              className="nextq-button"
                              onClick={handleNextQuestion}
                              style={nextButtonStyle(!showNextButton)} // Pass the disabled state
                              disabled={!showNextButton}
                            >
                              {nextText}
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    )}

                    {/*<QuestionPanel
                  // question={questions[currentQuestion]}
                  // onAnswer={handleAnswer}
                  resumeText={resumeText}
                  displayQuestion={displayQuestion}
                  jobDescriptionText={jobDescriptionText}
                  setDisplayQuestion={setDisplayQuestion}
                  audioRef={audioRef}
                  audioRecordedChunks={audioRecordedChunks}
                  speechRecorderRef={speechRecorderRef}
                  allAnswers={allAnswers}
                  setAllAnswers={setAllAnswers}
                  allQuestions={allQuestions}
                  setAllQuestions={setAllQuestions}
                  speechStart={speechStart}
                  setSpeechStart={setSpeechStart}
                  setShowFeedback={setShowFeedback}
                  recognitionRef={recognitionRef}
                />*/}
                  </>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <button onClick={startInterview} style={buttonStyle}>
                      Start Interview
                    </button>
                  </div>
                )}
              </div>
            </div>

            <InstructionsModal
              show={showInstructions}
              onClose={() => setShowInstructions(false)}
              onConfirm={confirmStartInterview}
              startLoader={startLoader}
            />
            <FeedbackModal
              show={showFeedback}
              onClose={() => setShowFeedback(false)}
              videoUrl={videoUrl}
              onDownload={downloadVideo}
            />
          </>
        )
      ) : (
        showThankYouMessage && (
          <>
            {spinner ? (
              <div className="final-message">
                <h2>Don't Close the Window.</h2>
                <h2>Please wait Submitting your Answers...</h2>
                <div className="spinner"></div>
              </div>
            ) : (
              <div>
                <div className="thank-you-message">
                  <h2>{thankYouMessage}</h2>
                </div>
                <audio ref={audioRef} style={{ display: "none" }}></audio>
                {analysed ? (
                  <>
                    <div className="thank-you-message">
                      {/* <h2>Your Score: {score}</h2>*/}
                    </div>
                    <div style={buttonContain}>
                      {" "}
                      <div style={{ paddingRight: "20px" }}>
                        <Button variant="primary" onClick={downloadVideo}>
                          Download Video
                        </Button>
                      </div>
                      <div>
                        {" "}
                        <Button variant="primary" onClick={generatePDF}>
                          Download Transcript
                        </Button>
                        {/* <Button
                      variant="primary"
                      onClick={() => setShowThankYouMessage(true)}
                    >
                      Download Transcript
                    </Button>*/}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "15px 30px",
  backgroundColor: "#2980b9",
  color: "#ffff",
  border: "none",
  borderRadius: "12px",
  fontWeight:"bold",
  cursor: "pointer",
  fontSize: "18px",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.6)",
  transition: "background-color 0.3s ease, transform 0.3s ease",
};
const nextButtonStyle = (isDisabled) => ({
  padding: "10px 20px",
  backgroundColor: isDisabled ? "#d3d3d3" : "#007bff", // Gray background if disabled
  color: isDisabled ? "#ffffff" : "#fff", // Change text color when disabled
  borderRadius: "10px",
  border: "5px solid #fff",
  cursor: isDisabled ? "not-allowed" : "pointer", // Change cursor when disabled
  opacity: isDisabled ? 0.6 : 1, // Add transparency when disabled
  transition: "background-color 0.3s ease",
});
const flipstyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default PracticalInterview;
