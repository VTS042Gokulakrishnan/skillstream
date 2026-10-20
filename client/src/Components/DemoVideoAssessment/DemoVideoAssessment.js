import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import Webcam from "react-webcam";
import { FaStopCircle, FaPlay, FaClock } from "react-icons/fa";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import InstructionsModal from "../InstructionModal/InstructionsModal";
import "./DemoVideoAssessment.css";
import robot from "../../assets/Animation - 1725479389232.gif"; //changes
import user from "../../assets/Animation - 1725482128206.gif"; //changes
import "../DemoVideoAssessment/DemoVideoAssessment.css";
import { Server } from "App";
import axios from "axios";
import { set } from "date-fns";
import { Button, Tooltip } from "antd";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
const DemoVideoAssessment = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [showWarning, setShowWarning] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [questionCount, setQuestionCount] = useState(1);
  const [loader, setLoader] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [text, setText] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [speech, setSpeech] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [next, setNext] = useState(false);
  const [nextText, setNextText] = useState("Fetching Next Question  ......");
  const [startVoice, setStartVoice] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [ws, setWs] = useState(null);
  const [SpeechStream, setSpeechSStream] = useState(null);
  // const [transcription, setTranscription] = useState("");
  const speechRecorderRef = useRef(null);
  const audioRecordedChunks = useRef([]);
  const [textInput, setTextInput] = useState(""); // Input text for TTS
  const [showNextButton, setShowNextButton] = useState(false);
  const audioRef = useRef(null);
  // declaring mediarecorder , recognition ref , web cam ref
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const chunks = useRef([]);
  const location = useLocation();
  const params = useParams();

  const appendPromptToQuestion = (question) => {
    return `${question} Now you can start answering.`;
  };
  // starting camera
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;

          // Add event listener to check when video metadata is loaded
          webcamRef.current.addEventListener("loadedmetadata", () => {
            // setVideoReady(true);
            webcamRef.current.play().catch((error) => {
              console.error("Error playing video:", error);
            });
          });
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startVideo();

    // Clean up function to stop video stream
    return () => {
      if (webcamRef.current && webcamRef.current.srcObject) {
        const stream = webcamRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        webcamRef.current.srcObject = null;
      }
    };
  }, []);
  // console.log(webcamRef.current);
  //check the camera & opening the instruction modal
  const handleStartRecording = () => {
    if (webcamRef.current) {
      setIsInstructionsModalOpen(true);
    } else {
      alert("Please make sure the webcam is active and try again.");
    }
  };

  const handleCancelAgree = () => {
    setIsInstructionsModalOpen(false);
  };
  // Handle instructions agree & proceed to question
  const handleInstructionsAgree = async () => {
    // Close the modal first

    if (
      webcamRef.current
      //  &&
      // webcamRef.current.video
      // webcamRef.current.video.srcObject
    ) {
      // const stream = webcamRef.current.video.srcObject;
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const micStream = await navigator.mediaDevices.getUserMedia({
        // video: true,
        audio: true,
      });

      // Combine screen and mic audio tracks

      try {
        setLoader(true);
        let formData = {
          resume_text: resumeText,
          job_description_text: jobDescriptionText,
        };
        const { data } = await axios.post(
          `${Server}/api/v1/videoInterview/startInterview`,
          formData
        );
        const combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          // ...screenStream.getAudioTracks(),
          ...micStream.getAudioTracks(),
        ]);

        // Ensure question is set
        // questions.push(data?.initial_intro);
        setDisplayedQuestion(data?.initial_intro); // Set the first question
        // console.log("Displayed Question:", data?.initial_intro);
        setLoader(false);
        setIsInstructionsModalOpen(false);
        // mediaRecorderRef.current = new MediaRecorder(screenStream);

        mediaRecorderRef.current = new MediaRecorder(combinedStream, {
          mimeType: "video/webm",
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
        setLoader(false);
        setIsInstructionsModalOpen(false);
      }
    } else {
      console.error("Webcam stream not available");
      setLoader(false);
      setIsInstructionsModalOpen(false);
    }
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );
  useEffect(() => {
    upload();
  }, []);
  // sending resume & job description
  const upload = async () => {
    try {
      setInitialised(true);
      // const { resume, jobDescription } = location.state;
      let formData = {
        userId: params?.userId,
        jobId: params?.jobId,
        candidateId: params?.id,
      };
      const { data } = await axios.post(
        `${Server}/api/v1/videoInterview/upload`,
        formData
      );
      // console.log(data);
      setResumeText(data?.resume_text);
      setJobDescriptionText(data?.job_description_text);
      localStorage.setItem("resume_text", data?.resume_text);
      localStorage.setItem("job_description_text", data?.job_description_text);
      setInitialised(false);
    } catch (error) {
      // console.log(error);
      setInitialised(false);
      toast.error("Please try again");
    }
  };

  // const handleNextQuestion = async () => {
  //   // if (displayedAnswer.length === 0) {
  //   //   toast.error("Please answer the question & move to next question");
  //   // } else {
  //   stopSpeechRecording();
  //   stopSpeaking();
  //   setSpeech(false);
  //   setShowNext(false);
  //   setNext(true);
  //   try {
  //     console.log(displayedAnswer);
  //     allAnswers.push(displayedAnswer);
  //     allQuestions.push(displayedQuestion);
  //     // Construct the request payload
  //     const payload = {
  //       resume_text: resumeText, // Replace with actual resume text
  //       job_description_text: jobDescriptionText, // Replace with actual job description text
  //       question: displayedQuestion,
  //       answer: displayedAnswer,
  //       question_count: questionCount,
  //     };
  //     console.log(payload);

  //     const response = await axios.post(
  //       `${Server}/api/v1/videoInterview/genrate/question`, // Your API endpoint here
  //       payload
  //     );
  //     // console.log(payload);

  //     if (response.data.status) {
  //       console.log(response.data.data);

  //       setDisplayedQuestion(response.data.data.next_question);
  //       // questions.push(response.data.next_question);
  //       setDisplayedAnswer(""); // Reset answer for new question
  //       setQuestionCount((prevCount) => prevCount + 1); // Increment question count
  //       setWaitingForNextQuestion(false);
  //       // setTimeLeft(100);
  //       setShowWarning(false);
  //       setNext(false);
  //       if (questionCount >= 8) {
  //         setNextText("Submitting Answer ....");
  //       }
  //       if (questionCount >= 9) {
  //         setThankYouMessage(response.data.data.closing_message);
  //         setNextText("Submitting Answer ....");
  //         setIsRecording(false);
  //         setInterviewCompleted(true);
  //         if (mediaRecorderRef.current) {
  //           mediaRecorderRef.current.stop();
  //         }
  //         // closeFeedbackModal();
  //         // Stop recording after 6th question
  //         setIsFeedbackModalOpen(true); // Open feedback modal after the last question
  //       } else {
  //         // setTimeLeft(100); // Reset the timer for the next question
  //       }
  //     } else {
  //       console.error("Failed to generate the next question");
  //     }
  //   } catch (error) {
  //     console.error("Error generating the next question:", error);
  //   }
  //   // }
  // };

  const handleNextQuestion = async () => {
    stopSpeaking();
    setSpeech(false);
    setShowNext(false);
    setNext(true);
    setShowNextButton(false);
    try {
      stopSpeechRecording(); // Stop the speech recording and process the answer

      // Wait for the transcription to be processed before continuing
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

        // Set the transcribed answer to the displayedAnswer
        // console.log("Transcribed Text: ", data.text);
        setDisplayedAnswer(data.text); // Set the transcribed answer here

        // Push the current question and answer to their respective arrays
        setAllAnswers((prevAnswers) => [...prevAnswers, data.text]);
        setAllQuestions((prevQuestions) => [
          ...prevQuestions,
          displayedQuestion,
        ]);
        // Reset chunks and stop the stream if available
        audioRecordedChunks.current = [];
        if (SpeechStream) {
          SpeechStream.getTracks().forEach((track) => track.stop());
          setSpeechSStream(null);
        }
        // Call the API to fetch the next question
        const payload = {
          resume_text: resumeText,
          job_description_text: jobDescriptionText,
          question: allQuestions,
          answer: allAnswers, // Use the transcribed answer
          question_count: questionCount,
        };
        // console.log(payload);

        const response = await axios.post(
          `${Server}/api/v1/videoInterview/genrate/question`,
          payload
        );

        if (response.data.status) {
          // console.log("Next Question: ", response.data.data.next_question);

          // Set the new question and reset answer for the next round
          setDisplayedQuestion(response.data.data.next_question);
          setDisplayedAnswer(""); // Reset displayed answer for the new question
          setQuestionCount((prevCount) => prevCount + 1); // Increment question count

          // Check if the interview is complete
          if (questionCount + 1 >= 10) {
            setThankYouMessage(response.data.data.closing_message);
            setNextText("Submitting Answer ....");
            setInterviewCompleted(true);
            setIsRecording(false);

            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
            }

            // Open feedback modal
            // setIsFeedbackModalOpen(true);
            closeFeedbackModal();
          } else {
            setNext(false);
            // Enable moving to the next question
          }
        }
      };
    } catch (error) {
      console.error("Error generating the next question:", error);
    }
  };

  // console.log(allAnswers, allQuestions);
  const generatePDF = (questions, answers) => {
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

    return doc;
  };
  const closeFeedbackModal = async () => {
    try {
      setIsFeedbackModalOpen(false);
      setFeedbackCompleted(true);
      setShowThankYouMessage(true);
      setSpinner(true);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      let payload = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        question: allQuestions,
        answer: allAnswers,
      };
      const userId = params?.userId;
      const jobId = params?.jobId;
      const candidateId = params?.id;
      const formData = new FormData();

      //analyse question
      const { data } = await axios.post(
        `${Server}/api/v1/videoInterview/analyse`,
        payload
      );
      // console.log(data);
      //upload video & update details
      const blob = new Blob(chunks.current, {
        type: "video/webm",
      });
      const file = new File([blob], "video.webm", { type: "video/webm" });
      // console.log(file);
      const pdfDoc = generatePDF(allQuestions, allAnswers);
      const pdfBlob = pdfDoc.output("blob");
      formData.append("file", file);
      formData.append("pdf", pdfBlob);
      formData.append("summary", data?.analysis);
      const response = await axios.post(
        `${Server}/api/v1/videoInterview/uploadVideo/${userId}/${jobId}/${candidateId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Confirm if this is needed, else you can omit it
          },
        }
      );
      // console.log(response.data);

      toast.success("Data Submitted for Review");
      setSpinner(false);
    } catch (error) {
      // console.log(error);
      toast.error("Internal Sevrer Error");
    } // Show thank you message
  };
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();

    // Unmute the microphone after stopping speech
    const stream = webcamRef.current?.video?.srcObject;
    const audioTracks = stream?.getAudioTracks();
    if (audioTracks) {
      audioTracks.forEach((track) => (track.enabled = true));
    }
  };
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
  const startSpeechRecording = async () => {
    try {
      // console.log("Speech Recording started");
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setSpeechSStream(audioStream);
      setIsRecording(true);
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
  const stopSpeechRecording = async () => {
    try {
      // console.log("Stopping speech recognition...");
      recognitionRef.current.stop();
      if (speechRecorderRef.current) {
        speechRecorderRef.current.stop();
      }

      // speechRecorderRef.current.onstop = async () => {
      //   const audioBlob = new Blob(audioRecordedChunks.current, {
      //     type: "audio/webm",
      //   });
      //   const formData = new FormData();
      //   const file = new File([audioBlob], "audio.webm", {
      //     type: "audio/webm",
      //   });
      //   formData.append("file", file);

      //   // Make API call to get the transcribed text
      //   const { data } = await axios.post(
      //     `${Server}/api/v1/parser/convert/stt`,
      //     formData,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      //       },
      //     }
      //   );

      //   // Set transcribed text in the displayedAnswer state
      //   console.log(data);
      //   setDisplayedAnswer(data.text); // Set transcribed answer here

      //   // Reset chunks and stop the stream if available
      //   audioRecordedChunks.current = [];
      //   if (SpeechStream) {
      //     SpeechStream.getTracks().forEach((track) => track.stop());
      //     setSpeechSStream(null);
      //   }
      // };
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (speech) {
      // console.log("speech started");
      recognitionRef.current.start();
      startSpeechRecording();
    } else {
      recognitionRef.current.stop();
      // console.log("speech stopped");
    }
  }, [speech]);

  // console.log(speech);

  const convertTextToSpeech = async (Question) => {
    try {
      let payLoad = {
        textInput: `${Question}.Now you can start answer.`,
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
  useEffect(() => {
    if (!interviewCompleted) {
      if (displayedQuestion?.length != 0) {
        // console.log("tts started");
        convertTextToSpeech(displayedQuestion);
      }
    }
  }, [displayedQuestion]);
  // console.log(audioRef);
  window.addEventListener("beforeunload", () => {
    window.speechSynthesis.cancel();
  });

  return (
    <div className="video-assessment-container">
      <div className="video-section">
        <Toaster position="top-center" reverseOrder={false} />
        {!interviewCompleted ? (
          <video
            ref={webcamRef}
            style={{
              width: "100%",
              height: "80%",
              objectFit: "cover", // Ensures the video covers the whole container
              borderRadius: "0",
            }}
            // muted
            id="video"
            // autoplay
            muted
          />
        ) : null}
      </div>
      <div className="qa-section">
        <h1 style={{ fontSize: "30px", color: "#ffff" }}>
          {!next ? "AI Video Assessment" : null}
        </h1>

        {isRecording && (
          <div>
            {next ? (
              <div className="">
                <div className="flipping">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <h1 style={{ fontSize: "30px", color: "#fff", paddingTop:"20px" }}>
                  Fetching Next Question
                </h1>
              </div>
            ) : (
              <div className="current-question">
                {" "}
                <div className="question-box">
                  {/* <div className="ai-icon">🤖</div> */}
                  <div className="ai-icon">
                  <img src={robot} alt="Animated Robot" />
                </div>
                  <div className="question-text">{displayedQuestion}</div>
                  <audio ref={audioRef} style={{ display: "none" }}></audio>

                  {/*timeLeft <= 30 && (
                <div className={`timer ${showWarning ? "warning" : ""}`}>
                  <FaClock /> {timeLeft}s
                </div>
              )*/}
                </div>
                {speech && (
                  <div className="answer-box">
                     <div className="user-icon">
                    <img
                      src={user}
                      alt="Animated Robot"
                      style={{ height: "30px", width: "30px" }}
                    />
                  </div>
                    <div class="voice-loading">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div class="voice-loading">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div class="voice-loading">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div class="voice-loading">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    {/*<div className="user-icon">👤</div>
          <div className="answer-text">
            {displayedAnswer || "Your answer will appear here..."}
          </div>*/}
                  </div>
                )}
                <div className="controls-btn">
                  <Tooltip
                    title={
                      !showNextButton
                        ? "You can't click now"
                        : "Click to move to next question"
                    }
                  >
                    <button
                      onClick={() => handleNextQuestion()}
                      disabled={!showNextButton}
                    >
                      {next ? nextText : "Next Question"}
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        )}
        {!isRecording && !isFeedbackModalOpen && !feedbackCompleted && (
          <div className="controls">
            {initialised ? (
              <div class="initialiser"></div>
            ) : (
              <button className="controls-btn" onClick={handleStartRecording}>
                <FaPlay /> Start Interview
              </button>
            )}

            {isInstructionsModalOpen && (
              <InstructionsModal
                onAgree={handleInstructionsAgree}
                onCancel={handleCancelAgree}
                loader={loader}
              />
            )}
          </div>
        )}
        {isFeedbackModalOpen && <FeedbackModal onClose={closeFeedbackModal} />}

        {showThankYouMessage && (
          <>
            {spinner ? (
              <div className="final-message">
                <h2>Don't Close the Window.</h2>
                <h2>Please wait Submitting your Answers...</h2>
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <div className="thank-you-message">
                  <h2>{thankYouMessage}</h2>
                </div>
                {/*<Button variant="primary" onClick={handleDownload}>
                  Download
                </Button>*/}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DemoVideoAssessment;

// useEffect(() => {
//   const newWs = new WebSocket("ws://localhost:5002");

//   newWs.onopen = () => {
//     console.log("WebSocket connection established");
//     setWs(newWs);
//   };

//   newWs.onmessage = (event) => {
//     // Handle the received audio data from the server
//     const audioBlob = new Blob([event.data], { type: "audio/mp3" });
//     const audioUrl = URL.createObjectURL(audioBlob);
//     if (audioRef.current) {
//       audioRef.current.src = audioUrl;
// const handleAudioEnd = () => {
//   // Set speech to true after playback has finished
//   // convertTextToSpeech("Now you can start answering");
//   setSpeech(true);
//   audioRef.current.removeEventListener("ended", handleAudioEnd);
// };

// audioRef.current.addEventListener("ended", handleAudioEnd);
//       audioRef.current.play(); // Automatically play the audio
//     }
//   };

//   newWs.onclose = () => {
//     console.log("WebSocket connection closed");
//   };

//   return () => {
//     if (newWs.readyState === WebSocket.OPEN) {
//       newWs.close();
//     }
//   };
// }, []);

//speak text when i question is displayed
// useEffect(() => {
//   if (displayedQuestion) {
//     speakText(displayedQuestion, () => {
//       speakText("Now tell me your answer.", () => {
//         setSpeech(true); // Start speech recognition after speaking the question and prompt
//       });
//     });
//   }
// }, [displayedQuestion]);

// Speak text
// const speakText = (text, callback) => {
//   if (typeof window.speechSynthesis !== "undefined") {
//     window.speechSynthesis.cancel();

//     // Mute the microphone before speaking
//     const stream = webcamRef.current?.video?.srcObject;
//     const audioTracks = stream?.getAudioTracks();
//     if (audioTracks) {
//       audioTracks.forEach((track) => (track.enabled = false));
//     }

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "en-US";

//     utterance.onend = () => {
//       // Unmute the microphone after speaking
//       if (audioTracks) {
//         audioTracks.forEach((track) => (track.enabled = true));
//       }
//       if (typeof callback === "function") {
//         callback();
//       }
//     };

//     utterance.onerror = (event) => {
//       console.error("Speech synthesis error:", event.error);
//       // Unmute the microphone if there is an error
//       if (audioTracks) {
//         audioTracks.forEach((track) => (track.enabled = true));
//       }
//     };

//     window.speechSynthesis.speak(utterance);
//   } else {
//     console.warn("Speech Synthesis API not supported.");
//   }
// };

// if (ws && ws.readyState === WebSocket.OPEN && Question) {
//   console.log("tts send");
//   const message = JSON.stringify({
//     type: "tts",
//     text: `${Question}.Now you can start answer.`,
//   });
//   ws.send(message); // Send the input text to the WebSocket server for TTS processing
// }
