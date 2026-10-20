import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { FaStopCircle, FaPlay, FaClock } from "react-icons/fa";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import InstructionsModal from "../InstructionModal/InstructionsModal";
import "../VideoAssessment/VideoAssessment.css";
import robot from "../../assets/Animation - 1725479389232.gif"; //changes
import user from "../../assets/Animation - 1725482128206.gif"; //changes
import { Server } from "App";
import axios from "axios";
import practiceApi from "./practiceApi";
import { set } from "date-fns";
import { Button, Tooltip, Result, Modal, Switch, Steps } from "antd";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import { isMobile, isTablet, isDesktop } from "react-device-detect";
import logo from "assets/images/loader.png";
import * as faceapi from "face-api.js";
import CodeEditor from "../VideoAssessment/CodeEditor";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { jwtDecode } from "jwt-decode";

const ffmpeg = new FFmpeg();

export async function convertAndCompress(file) {
  console.log("compressing");
  try {
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }

    // Load file into memory
    const arrayBuffer = await file.arrayBuffer();
    await ffmpeg.writeFile("input.webm", new Uint8Array(arrayBuffer));

    // Run conversion with H.265 (smaller file, good quality)
    await ffmpeg.exec([
      "-i",
      "input.webm",
      "-c:v",
      "libx265", // use H.265 encoder
      "-preset",
      "ultrafast", // faster encode (less compression)
      "-crf",
      "28", // adjust quality: 23=good, 28=smaller size
      "-vf",
      "scale=-2:720", // keep aspect, max height 720
      "-r",
      "30", // fps
      "output.mp4",
    ]);

    // Read output
    const data = await ffmpeg.readFile("output.mp4");
    const mp4Blob = new Blob([data.buffer], { type: "video/mp4" });
    return new File([mp4Blob], "video.mp4", { type: "video/mp4" });
  } catch (err) {
    console.error("FFmpeg H265 error:", err);
    throw err;
  }
}
const VideoAssessment = () => {
  let userId = localStorage.getItem("UserId");
  let token = localStorage.getItem("token");
  const { email } = jwtDecode(token);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!location.state?.practiceSessionId) navigate("/practiceInterview", { replace: true });
  }, [location.state, navigate]);
  const { jobTitle, resume_text, job_description_text, practiceSessionId } = location.state || {};
  const { Step } = Steps;
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
  const [currentQ, setCurrentQ] = useState("");
  const [currentA, setCurrentA] = useState("");
  const [isCodingRound, setIsCodingRound] = useState(false);
  const [isCoding, setIsCoding] = useState(false);
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
  const [nextText, setNextText] = useState("Next Question");
  const [nextFetch, setNextFetch] = useState("Fetching Next Question ....");
  const [startVoice, setStartVoice] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [ws, setWs] = useState(null);
  const [SpeechStream, setSpeechSStream] = useState(null);
  // const [transcription, setTranscription] = useState("");
  const speechRecorderRef = useRef(null);
  const audioRecordedChunks = useRef([]);
  const [textInput, setTextInput] = useState(""); // Input text for TTS
  const [showNextButton, setShowNextButton] = useState(false);
  const [expireIn, setExpireIn] = useState();
  const [instruction, setInstruction] = useState([]);
  const [candidateEmail, setCandidateEmail] = useState("");
  // const [jobTitle, setJobTitle] = useState("");
  // const [completed, setCompleted] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState("");
  const audioRef = useRef(null);
  // declaring mediarecorder , recognition ref , web cam ref
  const mediaRecorderRef = useRef(null);
  const frameRef = useRef(null);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const chunks = useRef([]);
  const params = useParams();
  const currentTime = new Date();
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [stream, setStream] = useState(null);
  const [sendImage, setSendImage] = useState(false);
  const intervalIdRef = useRef(null);
  const [candidateName, setCandidateName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [micAllowed, setMicAllowed] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [showEditor, setShowEditor] = useState(false);
  const [collapsedQuestion, setCollapsedQuestion] = useState(false);
  const [lastCompletedStep, setLastCompletedStep] = useState(0); // remembers progress
  const [codingAnswer, setCodingAnswer] = useState("");
  const appendPromptToQuestion = (question) => {
    return `${question} Now you can start answering.`;
  };
  const stepItems = [
    { title: "Allow Camera & Mic" },
    { title: "Share Screen" },
    { title: "Instructions" },
  ];
  function getBrowserInfo() {
    const ua = navigator.userAgent;

    if (/chrome|crios|crmo/i.test(ua) && !/edge|edg|opr/i.test(ua))
      return "Chrome";
    if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) return "Safari";
    if (/firefox|fxios/i.test(ua)) return "Firefox";
    if (/edg/i.test(ua)) return "Edge";
    return "Other";
  }

  function getOSInfo() {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("mac")) return "macOS";
    if (platform.includes("win")) return "Windows";
    if (/linux/.test(platform)) return "Linux";
    return "Other";
  }
  //check the camera & opening the instruction modal
  const handleStartRecording = () => {
    if (webcamRef.current) {
      setCurrentStep(0);
      setIsInstructionsModalOpen(true);
    } else {
      alert("Please make sure the webcam is active and try again.");
    }
  };

  const handleCancelAgree = () => {
    setIsInstructionsModalOpen(false);
  };
  const handleToggleCameraMic = async (checked) => {
    if (!checked) {
      setIsAllowed(false);
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    setLoading(true);
    try {
      const camPerm = await navigator.permissions.query({ name: "camera" });
      const micPerm = await navigator.permissions.query({ name: "microphone" });

      if (camPerm.state === "granted" && micPerm.state === "granted") {
        await startCameraMicStream();
      } else if (camPerm.state === "prompt" || micPerm.state === "prompt") {
        await startCameraMicStream();
      } else {
        Modal.error({
          title: "Camera & Microphone Access Required",
          content: (
            <div>
              Please click the <b>lock icon</b> in your browser's address bar
              and enable <b>Camera</b> and <b>Microphone</b>.
              <br />
              Then click <b>Retry</b>.
            </div>
          ),
          okText: "Retry",
          onOk: () => handleToggleCameraMic(true),
        });
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
    setLoading(false);
  };

  const startCameraMicStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsAllowed(true);
      setMicStream(stream); // store mic/camera stream
    } catch (err) {
      console.error("getUserMedia error:", err);
      setIsAllowed(false);
      Modal.error({
        title: "Unable to Access Camera/Mic",
        content: "Please allow access to continue.",
      });
    }
  };
  const mixAudioStreams = (micStream, systemStream) => {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    // Always include mic if available
    if (micStream && micStream.getAudioTracks().length > 0) {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    }

    const browser = getBrowserInfo();
    const os = getOSInfo();
    console.log("Browser - ", browser, "OS - ", os);
    // Only include system audio if browser/OS supports it
    if (
      systemStream &&
      systemStream.getAudioTracks().length > 0 &&
      !(browser === "Safari" && os === "macOS") // skip system audio on Safari macOS
    ) {
      const sysSource = audioContext.createMediaStreamSource(systemStream);
      sysSource.connect(destination);
    }

    return destination.stream;
  };

  const handleInstructionsAgree = async () => {
    try {
      const formData = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        instructions: instruction,
      };

      setLoader(true);
      const { data } = await practiceApi.post(`/startInterview`, formData, { headers: { "X-Practice-Session": practiceSessionId } });
      // console.log(screenStream);
      // console.log(micStream);
      const mixedAudioStream = mixAudioStreams(micStream, screenStream);
      const combinedStream = new MediaStream([
        // ...screenStream.getVideoTracks(),
        // ...screenStream.getAudioTracks(),
        ...screenStream.getVideoTracks(), // Video from screen
        ...mixedAudioStream.getAudioTracks(), // Merged mic + system audio
      ]);

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };

      mediaRecorderRef.current.start();

      setIsInstructionsModalOpen(false);
      setIsRecording(true);
      setDisplayedQuestion(data?.initial_intro);
      setLoader(false);
      setCurrentStep(0);

      // Optionally: Start interval screenshot capture
      // startFrameCapture(screenStream);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview.");
      if ([402, 409].includes(error.response?.status)) navigate("/practiceInterview");
      console.error(error);
      setLoader(false);
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

      // console.log(data);
      setResumeText(resume_text);
      setJobDescriptionText(job_description_text);
      setInstruction([]);
      // setExpireIn(new Date(data?.expires_in));
      // setInterviewStatus(data?.interviewStatus);
      // setInterviewerEmail(data?.email);
      // setJobTitle(jobTitle);
      setIsCoding(false);
      setCandidateEmail(candidateEmail);
      // setCompanyName(data?.companyName);
      // setCandidateName(data?.candidateName);
      if (interviewStatus === "Completed") {
        setInterviewCompleted(true);
      }
      localStorage.setItem("resume_text", resume_text);
      localStorage.setItem("job_description_text", job_description_text);
      setInitialised(false);
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
    } catch (error) {
      // console.log(error);
      setInitialised(false);
      toast.error("Please try again");
    }
  };
  const handleNextQuestion = async () => {
    stopSpeaking(); // Ensure speech synthesis stops
    setSpeech(false);
    setShowNext(false);
    setNext(true);
    setShowNextButton(false);
    try {
      if (isCodingRound) {
        console.log(codingAnswer);
        setShowEditor(false);
        setCollapsedQuestion(false);
        // Capture the transcribed answer and question
        const currentAnswer = codingAnswer;
        const currentQuestion = displayedQuestion; // Ensure the question matches the answer
        // console.log("Transcribed Text: ", currentAnswer);
        setCurrentA(currentAnswer);
        setCurrentQ(currentQuestion);
        setDisplayedAnswer(currentAnswer); // Set the answer for UI display

        // Push the current question and answer to their respective arrays
        setAllAnswers((prevAnswers) => [...prevAnswers, currentAnswer]);
        setAllQuestions((prevQuestions) => [...prevQuestions, currentQuestion]);

        // Reset chunks and clean up audio stream
        audioRecordedChunks.current = [];
        if (SpeechStream) {
          SpeechStream.getTracks().forEach((track) => track.stop());
          setSpeechSStream(null);
        }
        setIsCodingRound(false);
        // Prepare the payload with the current question and answer
        const payload = {
          resume_text: resumeText,
          job_description_text: jobDescriptionText,
          question: [...allQuestions, currentQuestion], // Send all previous + current question
          answer: [...allAnswers, currentAnswer], // Send all previous + current answer
          question_count: questionCount,
          instructions: instruction,
          coding_questions: isCoding,
        };
        // console.log("Payload to be sent:", payload);

        // Call the API to fetch the next question
        const response = await practiceApi.post(`/genrate/question`, payload, { headers: { "X-Practice-Session": practiceSessionId } });

        // Process the response and set the next question
        if (response.data.status) {
          // const nextQuestion = response.data.data.next_question;

          const nextQuestion = response.data.data.answer;
          const codingRound = response.data.data.coding;
          // console.log("Next Question: ", nextQuestion);
          if (!isCoding && questionCount >= 8) {
            setNextText("Submit Answer");
            setNextFetch("Submitting Answer ....");
          }
          if (isCoding && questionCount >= 10) {
            setNextText("Submit Answer");
            setNextFetch("Submitting Answer ....");
          }
          if (!isCoding && questionCount >= 9) {
            // setNextText(""); // Clear any "Submit Answer"
            // setNextFetch("");
            if (mediaRecorderRef.current) {
              // Wrap in a Promise to wait until onstop is done
              await new Promise((resolve) => {
                mediaRecorderRef.current.onstop = () => {
                  resolve();
                };
                mediaRecorderRef.current.stop();
              });
            }
          
            try {
              await closeFeedbackModal(currentQuestion, currentAnswer);
            } catch (e) {
              console.error("Silent interview close failed:", e);
            }
            setThankYouMessage(
              `${response.data.data.closing_message} Please Click on "Stop Sharing" button to stop sharing`
            );
            setShowThankYouMessage(true);
            setIsFeedbackModalOpen(false);
            setFeedbackCompleted(true);
            // setShowThankYouMessage(true);
            setIsRecording(false);

            setInterviewCompleted(true);
           
          } else if (isCoding && questionCount >= 11) {
            // setNextText(""); // Clear any "Submit Answer"
            // setNextFetch("");
            if (mediaRecorderRef.current) {
              // Wrap in a Promise to wait until onstop is done
              await new Promise((resolve) => {
                mediaRecorderRef.current.onstop = () => {
                  resolve();
                };
                mediaRecorderRef.current.stop();
              });
            }
           
            try {
              await closeFeedbackModal(currentQuestion, currentAnswer);
            } catch (e) {
              console.error("Silent interview close failed:", e);
            }
            setThankYouMessage(
              `${response.data.data.closing_message} Please Click on "Stop Sharing" button to stop sharing`
            );
            setShowThankYouMessage(true);
            setIsFeedbackModalOpen(false);
            setFeedbackCompleted(true);
            // setShowThankYouMessage(true);
            setIsRecording(false);

            setInterviewCompleted(true);
         
          } else {
            setNext(false); // Enable the 'Next' button for the next question
            setDisplayedQuestion(nextQuestion); // Set the new question for display
            setDisplayedAnswer(""); // Clear answer for the next question
            setQuestionCount((prevCount) => prevCount + 1); // Increment the count
            setIsCodingRound(codingRound);
          }
          // Update question count and check interview completion
        }
      } else {
        stopSpeechRecording(); // Stop the recording for the answer

        // Ensure the transcription process completes before proceeding
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
          const currentQuestion = displayedQuestion; // Ensure the question matches the answer
          // console.log("Transcribed Text: ", currentAnswer);
          setCurrentA(currentAnswer);
          setCurrentQ(currentQuestion);
          setDisplayedAnswer(currentAnswer); // Set the answer for UI display

          // Push the current question and answer to their respective arrays
          setAllAnswers((prevAnswers) => [...prevAnswers, currentAnswer]);
          setAllQuestions((prevQuestions) => [
            ...prevQuestions,
            currentQuestion,
          ]);

          // Reset chunks and clean up audio stream
          audioRecordedChunks.current = [];
          if (SpeechStream) {
            SpeechStream.getTracks().forEach((track) => track.stop());
            setSpeechSStream(null);
          }

          // Prepare the payload with the current question and answer
          const payload = {
            resume_text: resumeText,
            job_description_text: jobDescriptionText,
            question: [...allQuestions, currentQuestion], // Send all previous + current question
            answer: [...allAnswers, currentAnswer], // Send all previous + current answer
            question_count: questionCount,
            instructions: instruction,
            coding_questions: isCoding,
          };
          // console.log("Payload to be sent:", payload);

          // Call the API to fetch the next question
          const response = await practiceApi.post(`/genrate/question`, payload, { headers: { "X-Practice-Session": practiceSessionId } });

          // Process the response and set the next question
          if (response.data.status) {
            // const nextQuestion = response.data.data.next_question;

            const nextQuestion = response.data.data.answer;
            const codingRound = response.data.data.coding;
            // console.log("Next Question: ", nextQuestion);
            if (!isCoding && questionCount >= 8) {
              setNextText("Submit Answer");
              setNextFetch("Submitting Answer ....");
            }
            if (isCoding && questionCount >= 10) {
              setNextText("Submit Answer");
              setNextFetch("Submitting Answer ....");
            }
            if (!isCoding && questionCount >= 9) {
              // setNextText(""); // Clear any "Submit Answer"
              // setNextFetch("");
              if (mediaRecorderRef.current) {
                // Wrap in a Promise to wait until onstop is done
                await new Promise((resolve) => {
                  mediaRecorderRef.current.onstop = () => {
                    resolve();
                  };
                  mediaRecorderRef.current.stop();
                });
              }
             
              try {
                await closeFeedbackModal(currentQuestion, currentAnswer);
              } catch (e) {
                console.error("Silent interview close failed:", e);
              }
              setThankYouMessage(
                `${response.data.data.closing_message} Please Click on "Stop Sharing" button to stop sharing`
              );
              setShowThankYouMessage(true);
              setIsFeedbackModalOpen(false);
              setFeedbackCompleted(true);
              // setShowThankYouMessage(true);
              setIsRecording(false);

              setInterviewCompleted(true);
             
            } else if (isCoding && questionCount >= 11) {
              // setNextText(""); // Clear any "Submit Answer"
              // setNextFetch("");
              if (mediaRecorderRef.current) {
                // Wrap in a Promise to wait until onstop is done
                await new Promise((resolve) => {
                  mediaRecorderRef.current.onstop = () => {
                    resolve();
                  };
                  mediaRecorderRef.current.stop();
                });
              }
            
              try {
                await closeFeedbackModal(currentQuestion, currentAnswer);
              } catch (e) {
                console.error("Silent interview close failed:", e);
              }
              setThankYouMessage(
                `${response.data.data.closing_message} Please Click on "Stop Sharing" button to stop sharing`
              );
              setShowThankYouMessage(true);
              setIsFeedbackModalOpen(false);
              setFeedbackCompleted(true);
              // setShowThankYouMessage(true);
              setIsRecording(false);

              setInterviewCompleted(true);
             
            } else {
              setNext(false); // Enable the 'Next' button for the next question
              setDisplayedQuestion(nextQuestion); // Set the new question for display
              setDisplayedAnswer(""); // Clear answer for the next question
              setQuestionCount((prevCount) => prevCount + 1); // Increment the count
              setIsCodingRound(codingRound);
            }
            // Update question count and check interview completion
          }
        };
      }
    } catch (error) {
      console.error("Error generating the next question:", error);
      setNext(false); // Enable the 'Next' button for the next question
      setIsRecording(false);
    }
  };

  // console.log(allAnswers, allQuestions);
  const generatePDF = (questions, answers) => {
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

    return doc;
  };
  const closeFeedbackModal = async (
    currentQuestion,
    currentAnswer,
    options = { silent: false }
  ) => {
    // if (!options.silent) {
    //   setIsRecording(false);
    //   setSpinner(true);
    // }
    try {
      // setSpinner(true);
      // stopVideo();

      let payload = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        question: [...allQuestions, currentQuestion],
        answer: [...allAnswers, currentAnswer],
      };

      const formData = new FormData();
      // console.log("Analyse intyerview", payload);

      //upload video & update details
      const blob = new Blob(chunks.current, {
        type: "video/webm",
      });
      const file = new File([blob], "video.webm", { type: "video/webm" });
      // const compressed = await convertAndCompress(file);
      // console.log(file);
      const q = [...allQuestions, currentQuestion];
      const a = [...allAnswers, currentAnswer];
      const pdfDoc = generatePDF(q, a);
      const pdfBlob = pdfDoc.output("blob");
      formData.append("file", file);
      formData.append("pdf", pdfBlob);
      formData.append("resume_text", resumeText);
      formData.append("job_description_text", jobDescriptionText);
      formData.append("question", JSON.stringify(q));
      formData.append("answer", JSON.stringify(a));
      formData.append("candidateEmail", email);
      formData.append("jobTitle", jobTitle);
      formData.append("region", "United States");

      const response = await practiceApi.post(
        `/update/details/${userId}`,
        formData,
        {
          headers: {
            "X-Practice-Session": practiceSessionId,
          },
        }
      );
      // console.log(response.data);

      // const getResults = await axios.get("http://54.227.240.212:5001/results");
      // console.log(getResults.data);

      toast.success("Data Submitted for Review");
      // if (!options.silent) {
      //   toast.success("Data Submitted for Review");
      //   setSpinner(false);
      //   setThankYouMessage(
      //     "Thank you for attending the interview. We have submitted your answers for review."
      //   );
      // }
      localStorage.removeItem("job_description_text");
      localStorage.removeItem("resume_text");
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
        convertTextToSpeech(`${displayedQuestion}.Now you can start answer.`);
      }
    } else {
      if (showThankYouMessage) {
        setIsRecording(false);
        convertTextToSpeech(thankYouMessage);
      }
    }
  }, [displayedQuestion, showThankYouMessage]);
  // console.log(audioRef);
  window.addEventListener("beforeunload", () => {
    window.speechSynthesis.cancel();
  });
  // console.log(new Date(expireIn));
  const handleStartInterviewClick = () => {
    if (lastCompletedStep === 0) {
      setCurrentStep(1);
    } else if (lastCompletedStep === 1) {
      setCurrentStep(2);
    } else if (lastCompletedStep === 2) {
      setCurrentStep(3);
    }
  };
  return (
    <div className="empty">
      {initialised ? (
        <div className="logo-container">
          <img src={logo} alt="S Logo Loader" className="heartbeat w-24 h-24" />
          <div>Loading...</div>
        </div>
      ) : (
        <>
          {" "}
          {currentTime > expireIn ? (
            <Result
              status="warning"
              style={{ paddingTop: "180px" }}
              title={
                <div>
                  {" "}
                  <p style={{ color: "white", fontSize: "30px" }}>
                    Interview Link Expired .
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontSize: "25px",
                      paddingTop: "20px",
                    }}
                  >
                    {`Please reach out to ${interviewerEmail} to reschedule the interview `}
                  </p>
                  {/* <p
                    style={{
                      color: "white",
                      fontSize: "20px",
                      paddingTop: "20px",
                    }}
                  >
                    {` Email : ${interviewerEmail}`}
                  </p>*/}
                </div>
              }
              extra={
                <a href="/">
                  <Button type="primary" key="console">
                    Back to home
                  </Button>
                </a>
              }
            />
          ) : (
            <>
              {interviewStatus === "Completed" ? (
                <Result
                  status="success"
                  style={{ paddingTop: "180px" }}
                  title={
                    <div>
                      {" "}
                      <p style={{ color: "white", fontSize: "30px" }}>
                        Your interview has been completed.You will get notified
                        once the review process is completed
                      </p>
                    </div>
                  }
                  extra={
                    <a href="/">
                      <Button type="primary" key="console">
                        Back to home
                      </Button>
                    </a>
                  }
                />
              ) : (
                <div className="video-assessment-container flex flex-col lg:flex-row w-full min-h-screen">
                  {/* Video Section */}
                  <div className="video-section w-full h-auto lg:w-1/2 lg:h-full relative mb-6 lg:mb-0">
                    <Toaster position="top-center" reverseOrder={false} />
                    {!interviewCompleted && (
                      <video
                        ref={webcamRef}
                        className="w-full h-auto object-cover rounded-none"
                        muted
                        id="video"
                      />
                    )}
                  </div>

                  {/* QA Section */}
                  <div className="qa-section w-full lg:w-1/2 bg-[#111] p-4 sm:p-6 flex flex-col justify-center text-white">
                    <h1 className="text-2xl sm:text-3xl mb-4 text-center  text-white ">
                      {!next ? "AI Video Assessment" : null}
                    </h1>

                    {isRecording && !showThankYouMessage && (
                      <div>
                        {next ? (
                          <div className="">
                            <div className="flipping text-center">
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                            </div>
                            <h1
                              style={{
                                fontSize: "25px",
                                color: "#fff",
                                paddingTop: "20px",
                              }}
                            >
                              {nextFetch}
                            </h1>
                          </div>
                        ) : (
                          <div className="current-question">
                            {isCodingRound ? (
                              <div className="coding-question">
                                <div className="question-box bg-[#1c1c1c] p-4 rounded-md shadow-lg mb-4">
                                  <CodeEditor
                                    setShowEditor={setShowEditor}
                                    setCollapsedQuestion={setCollapsedQuestion}
                                    question={displayedQuestion}
                                    showEditor={showEditor}
                                    setShowNextButton={setShowNextButton}
                                    setCodingAnswer={setCodingAnswer}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="question-box bg-[#1c1c1c] p-4 rounded-md shadow-lg">
                                <div className="ai-icon mb-3">
                                  <img
                                    src={robot}
                                    alt="Animated Robot"
                                    className="h-12 mx-auto"
                                  />
                                </div>
                                <div className="question-text text-center  text-sm  lg:text-lg  sm:text-lg text-white">
                                  {displayedQuestion}
                                </div>
                                <audio
                                  ref={audioRef}
                                  style={{ display: "none" }}
                                />
                              </div>
                            )}

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
                              </div>
                            )}

                            <div className="controls-btn mt-6 text-center">
                              {/* {isCodingRound && !collapsedQuestion ? (
                                <button
                                  onClick={() => {
                                    setCollapsedQuestion(true);
                                    setShowEditor(true);
                                  }}
                                  className={`px-4 py-2 rounded-md text-white transition duration-300 ${
                                    showNextButton
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : "bg-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  Start Coding
                                </button>
                              ) : (*/}
                              <Tooltip
                                title={
                                  !showNextButton
                                    ? "You can't click now"
                                    : "Click to move to next question"
                                }
                              >
                                <button
                                  onClick={handleNextQuestion}
                                  disabled={!showNextButton}
                                  className={`px-4 py-2 rounded-md text-white transition duration-300 ${
                                    showNextButton
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : "bg-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {nextText}
                                </button>
                              </Tooltip>
                              {/*)}*/}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isRecording &&
                      !isFeedbackModalOpen &&
                      !feedbackCompleted && (
                        <div className="controls mt-6 text-center">
                          <button
                            className="controls-btn bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md text-lg"
                            // onClick={handleStartRecording}
                            onClick={() => handleStartInterviewClick()}
                          >
                            <FaPlay className="inline-block mr-2" /> Start
                            Interview
                          </button>

                          {isInstructionsModalOpen && (
                            <InstructionsModal
                              onAgree={handleInstructionsAgree}
                              onCancel={handleCancelAgree}
                              loader={loader}
                            />
                          )}
                        </div>
                      )}

                    {isFeedbackModalOpen && (
                      <FeedbackModal onClose={closeFeedbackModal} />
                    )}

                    {showThankYouMessage && (
                      <>
                        {spinner ? (
                          <div className="final-message text-center mt-8">
                            <h2 className="text-lg">
                              Please Don't Close the Window.
                            </h2>
                            <h2 className="text-lg">
                              Please Don't Stop sharing
                            </h2>
                            <h2 className="text-lg mb-4">
                              Submitting your Answers...
                            </h2>
                            <div className="spinner mx-auto"></div>
                          </div>
                        ) : (
                          <div className="thank-you-message text-center mt-8">
                            <h2
                              className="text-2xl"
                              style={{
                                fontSize: "20px",
                                color: "#fff",
                              }}
                            >
                              {thankYouMessage}
                            </h2>
                            <audio ref={audioRef} style={{ display: "none" }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {/* <Modal
                    title="Step 1: Allow Camera & Microphone"
                    open={currentStep === 1}
                    onCancel={() => setCurrentStep(0)}
                    footer={[
                      <Button
                        key="allow"
                        type="primary"
                        onClick={async () => {
                          try {
                            const stream =
                              await navigator.mediaDevices.getUserMedia({
                                video: true,
                                audio: true,
                              });
                            setMicAllowed(true);
                            setCameraAllowed(true);
                            webcamRef.current.srcObject = stream;
                            setCurrentStep(2);
                          } catch (err) {
                            toast.error(
                              "Please allow camera and mic permissions."
                            );
                          }
                        }}
                      >
                        Allow Camera & Mic
                      </Button>,
                    ]}
                  >
                    <p>
                      Click the button below to enable camera and microphone for
                      the interview.
                    </p>
                  </Modal>*/}
                  <Modal
                    open={currentStep === 1}
                    title="Step 1: Allow Camera & Microphone"
                    onCancel={() => setCurrentStep(0)}
                    footer={[
                      <Button
                        key="next"
                        type="primary"
                        disabled={!isAllowed}
                        onClick={() => {
                          setCurrentStep(2);
                          setLastCompletedStep(1);
                        }}
                      >
                        Next
                      </Button>,
                    ]}
                    centered
                  >
                    <Steps
                      current={currentStep - 1}
                      items={stepItems}
                      style={{ marginBottom: 20 }}
                    />
                    <p>Turn on camera and microphone to continue.</p>
                    <Switch
                      checked={isAllowed}
                      loading={loading}
                      onChange={handleToggleCameraMic}
                    />
                    <div style={{ marginTop: 20 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: "100%",
                          height: "200px",
                          background: "#000",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  </Modal>
                  <Modal
                    title="Step 2: Share Your Screen"
                    open={currentStep === 2}
                    onCancel={() => {
                      setCurrentStep(0);
                    }}
                    centered
                    footer={[
                      <Button
                        key="share"
                        type="primary"
                        onClick={async () => {
                          try {
                            const stream =
                              await navigator.mediaDevices.getDisplayMedia({
                                video: {
                                  displaySurface: "monitor", // Prefer entire screen
                                },
                                audio: true, // System audio
                                // video: true,
                                // audio: true, // important: system audio
                              });
                            setScreenStream(stream);
                            setCurrentStep(3);
                            setLastCompletedStep(2);
                          } catch (err) {
                            toast.error(
                              "Please share your screen to continue."
                            );
                          }
                        }}
                      >
                        Share Screen
                      </Button>,
                    ]}
                  >
                    <Steps
                      current={currentStep - 1}
                      items={stepItems}
                      style={{ marginBottom: 20 }}
                    />
                    <p>
                      Select 'Entire Screen' and check 'Share System Audio' to
                      proceed.
                    </p>
                    <p>
                      <strong>Important:</strong>
                    </p>
                    <ul>
                      <li>
                        1. Select <b>Entire Screen</b> (not just a tab or
                        window)
                      </li>
                      <li>2. Click on the Screen to share</li>
                      <li>
                        3.Check <b>"Share system audio"</b> (bottom left corner)
                      </li>
                    </ul>
                  </Modal>
                  <Modal
                    title="Step 3: Instructions"
                    open={currentStep === 3}
                    onCancel={() => setCurrentStep(0)}
                    centered
                    footer={[
                      <Button
                        key="start"
                        type="primary"
                        onClick={handleInstructionsAgree}
                        disabled={loader}
                        loading={loader}
                        // onClick={handleStartRecording}
                      >
                        {loader ? "Starting..." : "Start Interview"}
                      </Button>,
                    ]}
                  >
                    <Steps
                      current={currentStep - 1}
                      items={stepItems}
                      style={{ marginBottom: 20 }}
                    />
                    {/*<p>Instructions for the interview go here...</p>*/}
                    <main className="modal-body-one">
                      <p>
                        Welcome to the video assessment. Please review and agree
                        to the following instructions:
                      </p>
                      <ul>
                        <h2>Interview Instructions</h2>
                        <p>1. Ensure your webcam and microphone are working.</p>
                        {/*<p>
                          2. Make sure your screen recording permissions are
                          enabled. You will be prompted to allow screen
                          recording/ at the beginning of the interview. Please
                          choose entire Window to capture correctly
                        </p>*/}

                        <p>
                          2. You will have Next Question button for each
                          question. Please answer each question thoroughly with
                          your own time.
                        </p>
                        <p>
                          3. The recording will capture both video and audio.
                          Ensure your environment is quiet and well-lit.
                        </p>
                        {/* <p>
                          5. At the end of the interview, Please wait for the
                          Answers to be Submitted .The recording will be
                          automatically stopped and redirect to feedback page
                        </p>*/}
                        <p>
                          4.Please do not click the 'Stop Sharing' button during
                          the interview.
                        </p>
                        <p>
                          5.Make sure to enable system audio when sharing your
                          entire screen. You will find a toggle button labeled
                          "Share System Audio" at the bottom.
                        </p>
                      </ul>
                    </main>
                  </Modal>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default VideoAssessment;
