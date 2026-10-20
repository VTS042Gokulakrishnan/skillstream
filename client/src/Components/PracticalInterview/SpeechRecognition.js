import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SpeechRecognitionComponent = ({ onAnswer }) => {
  const { transcript, resetTranscript } = useSpeechRecognition();

  const handleStart = () => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStop = () => {
    SpeechRecognition.stopListening();
    onAnswer(transcript);
    resetTranscript();
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handleStart}
        style={styles.startButton}
      >
        Start Interview
      </button>
      <button
        onClick={handleStop}
        style={styles.stopButton}
      >
        Stop Interview
      </button>
      <div style={styles.transcriptContainer}>
        <p>Current Response:</p>
        <p style={styles.transcript}>{transcript}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  startButton: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.3s, transform 0.2s',
    fontSize: '16px',
    fontWeight: 'bold',
    outline: 'none',
  },
  stopButton: {
    backgroundColor: '#e11d48',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.2s',
    fontSize: '16px',
    fontWeight: 'bold',
    outline: 'none',
  },
  transcriptContainer: {
    marginTop: '15px',
    fontSize: '16px',
  },
  transcript: {
    whiteSpace: 'pre-wrap',
    color: '#333',
  },
};

export default SpeechRecognitionComponent;
