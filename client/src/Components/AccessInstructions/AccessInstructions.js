// import React, { useState } from "react";
// import success from "../../assets/Animation - 1751978042942.gif";

// const AccessInstructions = ({ setAccessGranted }) => {
//   const [step, setStep] = useState(1);
//   const [popupMsg, setPopupMsg] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const [showAnime, setShowAnime] = useState(false);
//   const [showTransitionGif, setShowTransitionGif] = useState(false);

//   const [cameraGranted, setCameraGranted] = useState(false);
//   const [micGranted, setMicGranted] = useState(false);
//   const [screenGranted, setScreenGranted] = useState(false);

//   const totalSteps = 4;

//   const handleAccess = async () => {
//     try {
//       if (step === 1) {
//         await navigator.mediaDevices.getUserMedia({ video: true });
//         setCameraGranted(true);
//         triggerPopup("📸 Camera is ready!");
//       } else if (step === 2) {
//         await navigator.mediaDevices.getUserMedia({ audio: true });
//         setMicGranted(true);
//         triggerPopup("🎤 Mic is active!");
//       } else if (step === 3) {
//         await navigator.mediaDevices.getDisplayMedia({ video: true });
//         setScreenGranted(true);
//         triggerPopup("🖥️ Screen shared!");
//       }

//       setTimeout(() => {
//         if (step < totalSteps) {
//           setShowTransitionGif(true);
//           setTimeout(() => {
//             setShowTransitionGif(false);
//             setStep(step + 1);
//           }, 2000); // shows gif for 2s
//         }
//       }, 1500);
//     } catch (error) {
//       triggerPopup("❌ Permission denied. Please try again.");
//     }
//   };

//   const triggerPopup = (msg) => {
//     setPopupMsg(msg);
//     setShowPopup(true);
//     setTimeout(() => setShowPopup(false), 1300);
//   };

//   const getStepContent = () => {
//     switch (step) {
//       case 1:
//         return {
//           title: "Step 1: Camera Access",
//           desc: "Enable your camera for the video interview.",
//           button: "Grant Camera Access",
//         };
//       case 2:
//         return {
//           title: "Step 2: Microphone Access",
//           desc: "Enable your mic to speak during the interview.",
//           button: "Grant Microphone Access",
//         };
//       case 3:
//         return {
//           title: "Step 3: Screen Sharing",
//           desc: "Share your screen during the interview.",
//           button: "Start Screen Share",
//         };
//       case 4:
//         return {
//           title: "✅ All Set!",
//           desc: "You're ready for your AI interview.",
//           button: "Start Interview",
//         };
//       default:
//         return {};
//     }
//   };

//   const { title, desc, button } = getStepContent();
//   const progress = ((step - 1) / (totalSteps - 1)) * 100;

//   return (
//     <div className="access-wrapper">
//       {/* Global Back Button */}
//       <button className="global-back-btn" onClick={() => window.history.back()}>
//         ← Back
//       </button>

//       <div className="access-box">
//         {/* Progress */}
//         <div className="progress-bar-bg">
//           <div
//             className="progress-bar-fill"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//         <p className="step-indicator">
//           Step {step} of {totalSteps}
//         </p>

//         {/* Title */}
//         <h2 className="access-title">
//           {title}
//           {step === 1 && cameraGranted && (
//             <span className="granted-icon">✅</span>
//           )}
//           {step === 2 && micGranted && <span className="granted-icon">✅</span>}
//           {step === 3 && screenGranted && (
//             <span className="granted-icon">✅</span>
//           )}
//         </h2>

//         <p className="access-desc">{desc}</p>

//         {/* Button */}
//         <button
//           className={`access-button ${step === 4 ? "ready" : ""}`}
//           onClick={step === 4 ? () => setAccessGranted(true) : handleAccess}
//         >
//           {button}
//         </button>

//         {/* Permission popup */}
//         {showPopup && <div className="popup bounce">{popupMsg}</div>}

//         {/* Anime popup (optional) */}
//         {showAnime && (
//           <div className="anime-popup sparkle-in">
//             <img
//               src={"https://media.tenor.com/CuKd5GsUWHQAAAAi/cute-anime.gif"}
//               alt="anime"
//               className="anime-img"
//             />
//             <p className="anime-text">Yay! Step completed 🎉</p>
//           </div>
//         )}

//         {/* Transition GIF between steps */}
//         {showTransitionGif && (
//           <div className="transition-gif-container">
//             <img src={success} alt="transition" className="transition-gif" />
//           </div>
//         )}
//       </div>

//       {/* STYLES */}
//       <style>{`
//         * {
//           box-sizing: border-box;
//         }
//         .access-wrapper {
//           min-height: 100vh;
//            background: linear-gradient(to bottom,#000000,#1e90ff);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//           position: relative;
//           font-family: 'Segoe UI', sans-serif;
//         }
//         .global-back-btn {
//           position: absolute;
//           top: 20px;
//           left: 20px;
//           background: rgba(255, 255, 255, 0.08);
//           color: #fff;
//           border: 1px solid rgba(255, 255, 255, 0.3);
//           padding: 10px 18px;
//           border-radius: 12px;
//           font-size: 16px;
//           font-weight: bold;
//           cursor: pointer;
//           z-index: 100;
//           backdrop-filter: blur(10px);
//           transition: all 0.3s ease;
//         }
//         .global-back-btn:hover {
//           transform: scale(1.05);
//           box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
//         }
//         .access-box {
//           position: relative;
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(16px);
//           border-radius: 20px;
//           padding: 30px 25px;
//           max-width: 500px;
//           width: 100%;
//           color: #fff;
//           text-align: center;
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           box-shadow: 0 10px 40px rgba(0,0,0,0.3);
//         }
//         .progress-bar-bg {
//           height: 8px;
//           background: rgba(255,255,255,0.2);
//           border-radius: 10px;
//           overflow: hidden;
//           margin-bottom: 12px;
//         }
//         .progress-bar-fill {
//           height: 100%;
//           background: linear-gradient(to right, #00c6ff, #0072ff);
//           transition: width 0.4s ease;
//         }
//         .step-indicator {
//           font-size: 14px;
//           margin-bottom: 18px;
//           color: #ccc;
//         }
//         .access-title {
//           font-size: 22px;
//           font-weight: bold;
//           margin-bottom: 12px;
//         }
//         .access-desc {
//           font-size: 16px;
//           margin-bottom: 20px;
//           color: #e0e0e0;
//         }
//         .granted-icon {
//           margin-left: 10px;
//           color: #00e676;
//           font-size: 22px;
//           animation: popFade 0.5s ease-in;
//         }
//         .access-button {
//           padding: 12px 24px;
//           font-size: 16px;
//           border: none;
//           border-radius: 10px;
//           font-weight: bold;
//           background: linear-gradient(to right, #12d8fa, #1fa2ff);
//           color: #fff;
//           cursor: pointer;
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//         }
//         .access-button:hover {
//           transform: scale(1.05);
//           box-shadow: 0 6px 15px rgba(0, 255, 255, 0.4);
//         }
//         .access-button.ready {
//           background: linear-gradient(to right, #00c853, #00e676);
//         }
//         .popup {
//           position: absolute;
//           top: -45px;
//           left: 50%;
//           transform: translateX(-50%);
//           background: #fff;
//           color: #000;
//           padding: 10px 24px;
//           border-radius: 30px;
//           font-weight: 600;
//           box-shadow: 0 5px 18px rgba(0,0,0,0.25);
//           z-index: 10;
//         }
//         .bounce {
//           animation: bounceIn 0.6s ease-out forwards;
//         }
//         .anime-popup {
//           position: absolute;
//           top: 40%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           background: rgba(255,255,255,0.95);
//           padding: 20px;
//           border-radius: 16px;
//           box-shadow: 0 8px 20px rgba(0,0,0,0.3);
//           text-align: center;
//           z-index: 99;
//           animation: sparkle 1s ease forwards;
//         }
//         .anime-img {
//           width: 80px;
//           height: 80px;
//         }
//         .anime-text {
//           font-weight: bold;
//           color: #222;
//           margin-top: 10px;
//         }
//         .transition-gif-container {
//           position: absolute;
//           border: none;
//           border-radius: 20px;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background: rgba(10, 10, 10, 0.9);
//           backdrop-filter: blur(4px);
//           z-index: 999;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           animation: fadeIn 0.3s ease-in;
//         }
//         .transition-gif {
//           width: 150px;
//           height: 150px;
//         }
//         @keyframes bounceIn {
//           0% { transform: scale(0.5) translateX(-50%); opacity: 0; }
//           60% { transform: scale(1.2) translateX(-50%); opacity: 1; }
//           100% { transform: scale(1) translateX(-50%); }
//         }
//         @keyframes popFade {
//           0% { transform: scale(0.6); opacity: 0; }
//           100% { transform: scale(1); opacity: 1; }
//         }
//         @keyframes sparkle {
//           0% { transform: scale(0.5) translate(-50%, -50%); opacity: 0; }
//           60% { transform: scale(1.2) translate(-50%, -50%); opacity: 1; }
//           100% { transform: scale(1) translate(-50%, -50%); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0 }
//           to { opacity: 1 }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AccessInstructions;
// AccessFlow.jsx
import React, { useState, useRef, useEffect } from "react";

const AccessFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const webcamRef = useRef(null);
  const totalSteps = 4;

  const instructions = [
    {
      title: "Welcome to Your AI Interview",
      description:
        "You'll be guided through a few setup steps to ensure everything is ready. Please proceed one step at a time.",
      button: "Start Instructions",
    },
    {
      title: "Step 1: Camera & Mic Access",
      description:
        "We need access to your camera and microphone. You'll see your camera preview once access is granted.",
      button: "Allow Camera & Mic",
    },
    {
      title: "Step 2: Screen & Audio Share",
      description:
        "Next, share your screen and allow system audio. This will be used to monitor engagement during the interview.",
      button: "Share Screen & Audio",
    },
    {
      title: "Step 3: Initialization",
      description: "Setting up your interview with the relevant data...",
      button: "Initializing...",
    },
    {
      title: "✅ All Set!",
      description:
        "You're ready to begin. Click below to start your AI interview.",
      button: "Start Interview",
    },
  ];

  const handleNext = async () => {
    setError("");
    if (step === 1) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setCameraStream(stream);
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
        setStep(step + 1);
      } catch (err) {
        setError("Camera/Mic access denied. Please allow to continue.");
      }
    } else if (step === 2) {
      try {
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setStep(step + 1);
      } catch (err) {
        setError("Screen sharing denied. Please allow to continue.");
      }
    } else if (step === 3) {
      await new Promise((res) => setTimeout(res, 2000));
      setStep(step + 1);
    } else if (step === 4) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const { title, description, button } = instructions[step];

  return (
    <div className="access-flow bg-[#0d1117] min-h-screen text-white flex flex-col justify-center items-center px-6">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="mb-6 text-sm text-gray-300">{description}</p>

        {step === 1 && (
          <video
            ref={webcamRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-black rounded mb-4 border border-gray-700"
          />
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleNext}
          className={`bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-white transition duration-300 disabled:opacity-50`}
        >
          {button}
        </button>
      </div>
    </div>
  );
};

export default AccessFlow;
