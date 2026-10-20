import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import "./QuestionPanel.css";
import { border } from "@chakra-ui/react";
import axios from "axios";
import { Server } from "App";
const QuestionPanel = ({
  // onAnswer,
  resumeText,
  setDisplayQuestion,
  displayQuestion,
  audioRef,
  audioRecordedChunks,
  jobDescriptionText,
  speechRecorderRef,
  allAnswers,
  setAllAnswers,
  allQuestions,
  setAllQuestions,
  setShowFeedback,
  speechStart,
  setSpeechStart,
  recognitionRef,
}) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [SpeechStream, setSpeechSStream] = useState(null);

  const [speech, setSpeech] = useState(false);
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
          // setTimeout(() => {
          //   setShowNextButton(true);
          // }, [5000]);
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
  useEffect(() => {
    if (speechStart) {
      setAnimationStarted(false);
      // console.log("hi");
      convertTextToSpeech(`${displayQuestion}. Now you can start answering.`);
      // convertTextToSpeech(`${displayQuestion}.Now you can start answer.`);
      // if ("speechSynthesis" in window) {
      //   const utterance = new SpeechSynthesisUtterance(displayQuestion);
      //   utterance.onend = () => setAnimationStarted(true);
      //   window.speechSynthesis.speak(utterance);
      // }
    }
  }, [speechStart]);
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
  const stopSpeechRecording = () => {
    recognitionRef.current.stop();
    if (speechRecorderRef.current) {
      speechRecorderRef.current.stop();
      // console.log("Stopping speech recorder...");
    }
  };

  const handleNextQuestion = async () => {
    setSpeechStart(false);
    setAnimationStarted(false);
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
        // console.log("Payload to be sent:", payload);
        const response = await axios.post(
          `${Server}/api/v1/videoInterview/genrate/question`,
          payload
        );
        if (response.data.status) {
          if (questionCount >= 9) {
            setShowFeedback(true);
          } else {
            setDisplayQuestion(response.data.data.next_question);
            setSpeechStart(true);
            setQuestionCount((prevCount) => prevCount + 1);
          }
        }
      };
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        background: "linear-gradient(to bottom, #000000, #1e90ff)",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <FaRobot size={35} color="#007bff" />
        <h2 style={{ fontSize: "22px", fontWeight: "500" }}>
          {displayQuestion}
        </h2>
        <audio ref={audioRef} style={{ display: "none" }}></audio>
      </div>

      <div style={answerAnimationStyle}>
        <FaUser size={35} color="#007bff" />
        <div style={{ display: "flex", alignItems: "center" }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} style={frequencyBarStyle(getRandomColor(), i * 0.1)} />
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button onClick={handleNextQuestion} style={nextButtonStyle}>
          Next Question
        </button>
      </div>
    </div>
  );
};

const nextButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff",
  borderRadius: "10px",
  border: "5px solid #fff",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

export default QuestionPanel;
