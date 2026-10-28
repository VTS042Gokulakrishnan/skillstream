import React, { useState, useEffect, useRef, useCallback } from "react";
import { PracticeHeader, PracticeLoading } from "../PracticalInterview/PracticeStates";
import AssessmentState from "./AssessmentState";
import { Video, Mic, Monitor } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import Webcam from "react-webcam";
import { FaStopCircle, FaPlay, FaClock } from "react-icons/fa";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import InstructionsModal from "../InstructionModal/InstructionsModal";
import "./VideoAssessment.css";
import robot from "../../assets/Animation - 1725479389232.gif"; //changes
import user from "../../assets/Animation - 1725482128206.gif"; //changes
import { Server } from "App";
import axios from "axios";
import { set } from "date-fns";
import { Button, Tooltip, Result, Modal, Switch, Steps } from "antd";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import { isMobile, isTablet, isDesktop } from "react-device-detect";
import logo from "assets/images/loader.png";
import AccessInstructions from "../AccessInstructions/AccessInstructions";
import * as faceapi from "face-api.js";
import CodeEditor from "./CodeEditor";
import { FFmpeg } from "@ffmpeg/ffmpeg";

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
  const [submissionError, setSubmissionError] = useState(false);
  const retrySubmission = useRef(null);
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
  const [jobTitle, setJobTitle] = useState("");
  // const [completed, setCompleted] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState("");
  const audioRef = useRef(null);
  // declaring mediarecorder , recognition ref , web cam ref
  const mediaRecorderRef = useRef(null);
  const frameRef = useRef(null);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const chunks = useRef([]);
  const location = useLocation();
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
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [lastCompletedStep, setLastCompletedStep] = useState(0); // remembers progress
  const [codingAnswer, setCodingAnswer] = useState("");

  // useEffect(() => {
  //   const getMaintenanceMode = async () => {
  //     try {
  //       const { data } = await axios.get(
  //         `${Server}/api/v1/data/maintenance/status`
  //       );
  //       setMaintenanceMode(data.data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getMaintenanceMode();
  // });
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
      const { data } = await axios.post(
        `${Server}/api/v1/videoInterview/startInterview`,
        formData
      );
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
      toast.error("Failed to start interview.");
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
      setInstruction(data?.instructions);
      setExpireIn(new Date(data?.expires_in));
      setInterviewStatus(data?.interviewStatus);
      setInterviewerEmail(data?.email);
      setJobTitle(data?.jobTitle);
      setIsCoding(data?.coding);
      setCandidateEmail(data?.candidateEmail);
      setCompanyName(data?.companyName);
      setCandidateName(data?.candidateName);
      const repsonse = await axios.get(
        `${Server}/api/v1/data/maintenance/status`
      );
      setMaintenanceMode(repsonse.data.data);

      if (data?.interviewStatus === "Completed") {
        setInterviewCompleted(true);
      }
      localStorage.setItem("resume_text", data?.resume_text);
      localStorage.setItem("job_description_text", data?.job_description_text);
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
        const response = await axios.post(
          `${Server}/api/v1/videoInterview/genrate/question`,
          payload
        );

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
            // (async () => {
            //   try {
            //     // mediaRecorderRef.current.stop();
            //     await closeFeedbackModal(currentQuestion, currentAnswer);
            //     // setIsRecording(false);
            //   } catch (e) {
            //     console.error("Silent interview close failed:", e);
            //   }
            // })();
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
            // if (mediaRecorderRef.current) {
            //   mediaRecorderRef.current.stop(); // Stop the video recording
            // }
            // setTimeout(() => {
            //   closeFeedbackModal(currentQuestion, currentAnswer);
            //   setIsRecording(false);
            // }, 30000);
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
            // (async () => {
            //   try {
            //     // mediaRecorderRef.current.stop();
            //     await closeFeedbackModal(currentQuestion, currentAnswer);
            //     // setIsRecording(false);
            //   } catch (e) {
            //     console.error("Silent interview close failed:", e);
            //   }
            // })();
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
            // if (mediaRecorderRef.current) {
            //   mediaRecorderRef.current.stop(); // Stop the video recording
            // }
            // setTimeout(() => {
            //   closeFeedbackModal(currentQuestion, currentAnswer);
            //   setIsRecording(false);
            // }, 30000);
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
          const response = await axios.post(
            `${Server}/api/v1/videoInterview/genrate/question`,
            payload
          );

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
              // (async () => {
              //   try {
              //     // mediaRecorderRef.current.stop();
              //     await closeFeedbackModal(currentQuestion, currentAnswer);
              //     // setIsRecording(false);
              //   } catch (e) {
              //     console.error("Silent interview close failed:", e);
              //   }
              // })();
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
              // if (mediaRecorderRef.current) {
              //   mediaRecorderRef.current.stop(); // Stop the video recording
              // }
              // setTimeout(() => {
              //   closeFeedbackModal(currentQuestion, currentAnswer);
              //   setIsRecording(false);
              // }, 30000);
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
              // (async () => {
              //   try {
              //     // mediaRecorderRef.current.stop();
              //     await closeFeedbackModal(currentQuestion, currentAnswer);
              //     // setIsRecording(false);
              //   } catch (e) {
              //     console.error("Silent interview close failed:", e);
              //   }
              // })();
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
              // if (mediaRecorderRef.current) {
              //   mediaRecorderRef.current.stop(); // Stop the video recording
              // }
              // setTimeout(() => {
              //   closeFeedbackModal(currentQuestion, currentAnswer);
              //   setIsRecording(false);
              // }, 30000);
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
    retrySubmission.current = [currentQuestion, currentAnswer, options];
    setSpinner(true);
    setSubmissionError(false);
    try {
      // setSpinner(true);
      // stopVideo();

      let payload = {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
        question: [...allQuestions, currentQuestion],
        answer: [...allAnswers, currentAnswer],
      };
      const userId = params?.userId;
      const jobId = params?.jobId;
      const candidateId = params?.id;
      const formData = new FormData();
      // console.log("Analyse intyerview", payload);

      //analyse question
      // const { data } = await axios.post(
      //   `${Server}/api/v1/videoInterview/analyse`,
      //   payload
      // );
      // console.log(data);
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
      // formData.append("summary", JSON.stringify(data?.analysis));
      formData.append("candidateEmail", candidateEmail);
      formData.append("candidateName", candidateName);
      formData.append("companyName", companyName);
      formData.append("jobTitle", jobTitle);
      formData.append("email", interviewerEmail);
      formData.append("region", "United States");

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
      setSubmissionError(true);
      toast.error("Unable to confirm submission. Please retry.");
    } finally { setSpinner(false); } // Show thank you message
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
      startSpeechRecording();
    } else {
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
    <main className="ss-video-session">
      <Toaster position="top-center" />
      <PracticeHeader type="Video" title={jobTitle || "Interview"} assessment>
        {isRecording && !spinner && !submissionError && !showThankYouMessage && interviewStatus !== "Completed" && !(currentTime > expireIn) && <span className="ss-recording">● Recording</span>}
      </PracticeHeader>
      {initialised ? <PracticeLoading title="Preparing your assessment" /> : maintenanceMode ? <AssessmentState kind="maintenance" /> : interviewStatus === "Completed" ? <AssessmentState /> : currentTime > expireIn ? <AssessmentState kind="expired" email={interviewerEmail} /> : spinner ? <PracticeLoading title="Submitting your responses" description="Keep this tab open while your answers and recording are submitted." /> : submissionError ? <section className="ss-session-state"><h2>Submission needs attention</h2><p>Your submission could not be confirmed. Keep this tab open and try again.</p><Button type="primary" onClick={() => closeFeedbackModal(...retrySubmission.current)}>Retry submission</Button></section> : showThankYouMessage ? <AssessmentState /> : <>
          <div className="ss-session-toolbar">
            <strong>
              {isRecording ? "Question " + questionCount : "Device check"}
            </strong>
            <span>
              {isRecording
                ? "Keep your camera, microphone and screen sharing active."
                : "Check your devices before starting your interview."}
            </span>
          </div>
          <div className="ss-video-grid">
            <section className="ss-card ss-interviewer">
              {initialised || loader ? (
                <PracticeLoading />
              ) : isRecording ? (
                <>
                  <span className="ss-eyebrow">AI INTERVIEWER · AI-GENERATED VOICE</span>
                  {next ? (
                    <PracticeLoading
                      title={nextFetch}
                      description="Please keep this tab open."
                    />
                  ) : (
                    <>
                      {isCodingRound ? (
                        <div className="ss-practice-inline-editor">
                        <CodeEditor
                          setShowEditor={setShowEditor}
                          setCollapsedQuestion={setCollapsedQuestion}
                          question={displayedQuestion}
                          showEditor={showEditor}
                          setShowNextButton={setShowNextButton}
                          setCodingAnswer={setCodingAnswer}
                        />
                        </div>
                      ) : (
                        <>
                          <div className="ss-ai-orb" aria-hidden="true">
                            ✧
                          </div>
                          <h1 className="ss-interview-question">
                            {displayedQuestion}
                          </h1>
                        </>
                      )}
                      <div className="ss-voice-state">
                        <span className={speech ? "ss-listening" : ""}>
                          ▂ ▅ ▃ ▇ ▄ ▆ ▂ ▅ ▃ ▇ ▄ ▆ ▂
                        </span>
                        <p>
                          {speech
                            ? "Listening to your answer…"
                            : "Listen to the question, then answer aloud."}
                        </p>
                      </div>
                      <div className="ss-interview-controls">
                        <small>Finish your answer before continuing.</small>
                        <Button
                          type="primary"
                          size="large"
                          disabled={!showNextButton}
                          onClick={() => handleNextQuestion()}
                        >
                          {nextText} →
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="ss-device-intro">
                  <span className="ss-ai-orb">◉</span>
                  <h1>Let’s check your devices</h1>
                  <p>
                    Your camera, microphone and screen will be recorded during
                    the interview.
                  </p>
                  <div className="ss-device-checklist">
                    <span><Video size={20} />Camera preview</span>
                    <span><Mic size={20} />Microphone check</span>
                    <span><Monitor size={20} />Screen sharing</span>
                  </div>
                  <div className="ss-info">
                    Choose a quiet space and keep this tab open throughout your
                    assessment.
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleStartInterviewClick}
                  >
                    Check devices →
                  </Button>
                </div>
              )}
              <audio ref={audioRef} style={{ display: "none" }} />
            </section>
            <aside className="ss-video-side">
              <section className="ss-card ss-card-padding">
                <span className="ss-eyebrow">YOUR CAMERA</span>
                <video
                  ref={webcamRef}
                  autoPlay
                  playsInline
                  muted
                  id="video"
                  className="ss-camera-preview"
                />
              </section>
              <section className="ss-card ss-card-padding">
                <h2>Session status</h2>
                <dl className="ss-device-status">
                  {[
                    ["Camera", cameraAllowed],
                    ["Microphone", micAllowed],
                    ["Screen sharing", screenStream?.active],
                  ].map(([name, ready]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd className={ready ? "ready" : ""}>
                        {ready ? "● Active" : "Not started"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="ss-info">
                  Keep this tab open and continue sharing your screen.
                </div>
              </section>
            </aside>
          </div>

                  <Modal className="ss-device-modal" width={700}
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
                  <Modal className="ss-device-modal" width={700}
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
                  <Modal className="ss-device-modal" width={700}
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
      </>}
    </main>
  );
};

export default VideoAssessment;
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
// <div className="thank-you-message">
//   <h2>
//     Your interview has been completed.You will get a email once
//     the review process is completed{" "}
//   </h2>
// </div>
//         <div className="video-assessment-container">
//           <div className="video-section">
//             <Toaster position="top-center" reverseOrder={false} />
//             {!interviewCompleted ? (
//               <video
//                 ref={webcamRef}
//                 style={{
//                   width: "100%",
//                   height: "80%",
//                   objectFit: "cover", // Ensures the video covers the whole container
//                   borderRadius: "0",
//                 }}
//                 // muted
//                 id="video"
//                 // autoplay
//                 muted
//               />
//             ) : null}
//           </div>
//           <div className="qa-section">
//             <h1 style={{ fontSize: "30px", color: "#ffff" }}>
//               {!next ? "AI Video Assessment" : null}
//             </h1>

//             {isRecording && (
//               <div>
//                 {next ? (
//                   <div className="">
//                     <div className="flipping">
//                       <div></div>
//                       <div></div>
//                       <div></div>
//                       <div></div>
//                       <div></div>
//                     </div>
//                     <h1
//                       style={{
//                         fontSize: "30px",
//                         color: "#fff",
//                         paddingTop: "20px",
//                       }}
//                     >
//                       {nextFetch}
//                     </h1>
//                   </div>
//                 ) : (
//                   <div className="current-question">
//                     {" "}
//                     <div className="question-box">
//                       {/* <div className="ai-icon">🤖</div> */}
//                       <div className="ai-icon">
//                         <img src={robot} alt="Animated Robot" />
//                       </div>
//                       <div className="question-text">
//                         {displayedQuestion}
//                       </div>
//                       <audio
//                         ref={audioRef}
//                         style={{ display: "none" }}
//                       ></audio>

//                       {/*timeLeft <= 30 && (
//       <div className={`timer ${showWarning ? "warning" : ""}`}>
//         <FaClock /> {timeLeft}s
//       </div>
//     )*/}
//                     </div>
//                     {speech && (
//                       <div className="answer-box">
//                         <div className="user-icon">
//                           <img
//                             src={user}
//                             alt="Animated Robot"
//                             style={{ height: "30px", width: "30px" }}
//                           />
//                         </div>
//                         <div class="voice-loading">
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                         </div>
//                         <div class="voice-loading">
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                         </div>
//                         <div class="voice-loading">
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                         </div>
//                         <div class="voice-loading">
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                           <span></span>
//                         </div>
//                         {/*<div className="user-icon">👤</div>
// <div className="answer-text">
//   {displayedAnswer || "Your answer will appear here..."}
// </div>*/}
//                       </div>
//                     )}
//                     <div className="controls-btn">
//                       <Tooltip
//                         title={
//                           !showNextButton
//                             ? "You can't click now"
//                             : "Click to move to next question"
//                         }
//                       >
//                         <button
//                           onClick={() => handleNextQuestion()}
//                           disabled={!showNextButton}
//                         >
//                           {nextText}
//                         </button>
//                       </Tooltip>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//             {!isRecording &&
//               !isFeedbackModalOpen &&
//               !feedbackCompleted && (
//                 <div className="controls">
//                   <button
//                     className="controls-btn"
//                     onClick={handleStartRecording}
//                   >
//                     <FaPlay /> Start Interview
//                   </button>

//                   {isInstructionsModalOpen && (
//                     <InstructionsModal
//                       onAgree={handleInstructionsAgree}
//                       onCancel={handleCancelAgree}
//                       loader={loader}
//                     />
//                   )}
//                 </div>
//               )}
//             {isFeedbackModalOpen && (
//               <FeedbackModal onClose={closeFeedbackModal} />
//             )}

//             {showThankYouMessage && (
//               <>
//                 {spinner ? (
//                   <div className="final-message">
//                     <h2>Please Don't Close the Window.</h2>
//                     <h2>Please Don't Stop sharing</h2>
//                     <h2>Please wait Submitting your Answers...</h2>
//                     <div className="spinner"></div>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="thank-you-message">
//                       <h2>{thankYouMessage}</h2>
//                     </div>
//                     <audio
//                       ref={audioRef}
//                       style={{ display: "none" }}
//                     ></audio>

//                     {/*<Button variant="primary" onClick={handleDownload}>
//         Download
//       </Button>*/}
//                   </>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
{
  /* {speech && (
                            <div className="answer-box mt-4 p-2 bg-[#222] rounded-md">
                              <div className="flex items-center gap-2">
                                <img src={user} alt="User Icon" className="w-8 h-8" />
                                <div className="flex gap-1 voice-loading">
                                  {[...Array(4)].map((_, idx) => (
                                    <div key={idx} className="flex gap-[2px]">
                                      {[...Array(8)].map((_, i) => (
                                        <span key={i}></span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )} */
}
{
  /* <div class="voice-loading">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div> */
}
{
  /*<div className="user-icon">👤</div>
                <div className="answer-text">
                  {displayedAnswer || "Your answer will appear here..."}
                </div>*/
}
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

// const handleNextQuestion = async () => {
//   stopSpeaking();
//   setSpeech(false);
//   setShowNext(false);
//   setNext(true);
//   setShowNextButton(false);
//   try {
//     stopSpeechRecording(); // Stop the speech recording and process the answer

//     // Wait for the transcription to be processed before continuing
//     speechRecorderRef.current.onstop = async () => {
//       const audioBlob = new Blob(audioRecordedChunks.current, {
//         type: "audio/webm",
//       });
//       const formData = new FormData();
//       const file = new File([audioBlob], "audio.webm", {
//         type: "audio/webm",
//       });
//       formData.append("file", file);

//       // Make the API call to get the transcribed text
//       const { data } = await axios.post(
//         `${Server}/api/v1/parser/convert/stt`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
//           },
//         }
//       );

//       // Set the transcribed answer to the displayedAnswer
//       console.log("Transcribed Text: ", data.text);
//       setDisplayedAnswer(data.text); // Set the transcribed answer here

//       // Push the current question and answer to their respective arrays
//       setAllAnswers((prevAnswers) => [...prevAnswers, data.text]);
//       setAllQuestions((prevQuestions) => [
//         ...prevQuestions,
//         displayedQuestion,
//       ]);
//       // Reset chunks and stop the stream if available
//       audioRecordedChunks.current = [];
//       if (SpeechStream) {
//         SpeechStream.getTracks().forEach((track) => track.stop());
//         setSpeechSStream(null);
//       }
//       // Call the API to fetch the next question
//       const payload = {
//         resume_text: resumeText,
//         job_description_text: jobDescriptionText,
//         question: allQuestions,
//         answer: allAnswers, // Use the transcribed answer
//         question_count: questionCount,
//         instructions: instruction,
//       };
//       console.log(payload);

//       const response = await axios.post(
//         `${Server}/api/v1/videoInterview/genrate/question`,
//         payload
//       );

//       if (response.data.status) {
//         console.log("Next Question: ", response.data.data.next_question);

//         // Set the new question and reset answer for the next round
//         setDisplayedQuestion(response.data.data.next_question);
//         setDisplayedAnswer(""); // Reset displayed answer for the new question
//         setQuestionCount((prevCount) => prevCount + 1); // Increment question count

//         // Check if the interview is complete
//         if (questionCount + 1 >= 10) {
//           setThankYouMessage(response.data.data.closing_message);
//           setNextText("Submitting Answer ....");
//           setInterviewCompleted(true);
//           setIsRecording(false);

//           if (mediaRecorderRef.current) {
//             mediaRecorderRef.current.stop();
//           }

//           // Open feedback modal
//           // setIsFeedbackModalOpen(true);
//           closeFeedbackModal();
//         } else {
//           setNext(false);
//           // Enable moving to the next question
//         }
//       }
//     };
//   } catch (error) {
//     console.error("Error generating the next question:", error);
//   }
// };
// useEffect(() => {
//   // Capture webcam video on component mount
//   navigator.mediaDevices
//     .getUserMedia({ video: true })
//     .then((s) => {
//       setStream(s);
//       frameRef.current = s;
//       intervalIdRef.current = setInterval(sendFrame, 1000);
//     })
//     .catch((err) => console.error("Error accessing webcam:", err));

//   // Stop video stream on component unmount
//   return () => {
//     if (intervalIdRef.current) clearInterval(intervalIdRef.current);
//     if (stream) stream.getTracks().forEach((track) => track.stop());
//   };
// }, [stream]);
// const sendFrame = (streamv) => {
//   if (!stream) return;
//   console.log("sending frame");

//   const videoTrack = stream.getVideoTracks()[0];
//   console.log(videoTrack);

//   if (videoTrack.readyState !== "live") {
//     console.error("Video track is not live");
//     return;
//   }

//   const canvas = document.createElement("canvas");
//   canvas.width = 640;
//   canvas.height = 480;
//   const ctx = canvas.getContext("2d");
//   const imageCapture = new window.ImageCapture(videoTrack);

//   imageCapture
//     .grabFrame()
//     .then((imageBitmap) => {
//       ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob((blob) => {
//         const formData = new FormData();
//         formData.append("frame", blob, "frame.jpg");

//         fetch("http://54.227.240.212:5001/frame", {
//           method: "POST",
//           body: formData,
//         })
//           .then((response) => response.blob())
//           .then((imageBlob) => {
//             const imageUrl = URL.createObjectURL(imageBlob);
//             // setVideoSrc(imageUrl);
//           })
//           .catch((error) => console.error("Error sending frame:", error));
//       }, "image/jpeg");
//     })
//     .catch((error) => console.error("Error capturing frame:", error));
// };
// useEffect(() => {
//   const loadModels = async () => {
//     const MODEL_URL = "/models";
//     try {
//       await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//       console.log("Face detection model loaded.");
//     } catch (error) {
//       console.error("Error loading face-api.js models", error);
//     }
//   };

//   loadModels();

// Handle instructions agree & proceed to question
// const handleInstructionsAgree = async () => {
//   // Close the modal first
//   // console.log(isMobile);
//   if (
//     !webcamRef.current ||
//     !webcamRef.current ||
//     !webcamRef.current.srcObject
//   ) {
//     toast.error("Camera is turned off.Please turn on camera.");
//     setIsInstructionsModalOpen(false);
//     return;
//   }

//   if (
//     webcamRef.current
//     //  &&
//     // webcamRef.current.video
//     // webcamRef.current.video.srcObject
//   ) {
//     // const stream = webcamRef.current.video.srcObject;
//     const screenStream = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//       audio: true,
//     });
//     const micStream = await navigator.mediaDevices.getUserMedia({
//       // video: true,
//       audio: true,
//     });

//     // Combine screen and mic audio tracks

//     try {
//       setLoader(true);
//       let formData = {
//         resume_text: resumeText,
//         job_description_text: jobDescriptionText,
//         instructions: instruction,
//       };
//       const { data } = await axios.post(
//         `${Server}/api/v1/videoInterview/startInterview`,
//         formData
//       );
//       const combinedStream = new MediaStream([
//         ...screenStream.getVideoTracks(),
//         ...screenStream.getAudioTracks(),
//         ...micStream.getAudioTracks(),
//       ]);

//       // Ensure question is set
//       // questions.push(data?.initial_intro);
//       setDisplayedQuestion(data?.initial_intro); // Set the first question
//       // console.log("Displayed Question:", data?.initial_intro);
//       setLoader(false);
//       setIsInstructionsModalOpen(false);
//       // mediaRecorderRef.current = new MediaRecorder(screenStream);

//       mediaRecorderRef.current = new MediaRecorder(combinedStream, {
//         mimeType: "video/webm",
//       });

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunks.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);

//       // Take a screenshot every second and send it to the API
//       // Take a screenshot every second and send it to the API
//       const canvas = document.createElement("canvas");
//       const videoTrack = screenStream.getVideoTracks()[0];
//       const video = document.createElement("video");
//       video.srcObject = new MediaStream([videoTrack]);
//       video.play();

//       const sendFrameToAPI = async () => {
//         // Set canvas dimensions to video frame dimensions
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const context = canvas.getContext("2d");
//         context.drawImage(video, 0, 0, canvas.width, canvas.height);

//         // Convert canvas to Blob
//         const frameBlob = await new Promise((resolve) =>
//           canvas.toBlob(resolve, "image/jpeg", 0.85)
//         );

//         // Prepare FormData
//         const formData = new FormData();
//         formData.append("frame", frameBlob, "frame.jpg");
//         // console.log("sending frame");

//         // Send frame to API
//         try {
//           const { data } = await axios.post(
//             `http://54.227.240.212:5001/frame`,
//             formData,
//             {
//               headers: {
//                 "Content-Type": "multipart/form-data",
//               },
//             }
//           );
//           // console.log(data);

//           // console.log("sent frame");
//         } catch (err) {
//           console.error("Failed to send frame:", err);
//         }
//       };

//       // const intervalId = setInterval(sendFrameToAPI, 1000); // Call every second

//       // Cleanup: Stop sending frames when recording ends
//       mediaRecorderRef.current.onstop = () => {
//         // clearInterval(intervalId);
//       };
//     } catch (error) {
//       console.error("Failed to start recording:", error);
//       setLoader(false);
//       setIsInstructionsModalOpen(false);
//     }
//   } else {
//     console.error("Webcam stream not available");
//     setLoader(false);
//     setIsInstructionsModalOpen(false);
//   }
// };
