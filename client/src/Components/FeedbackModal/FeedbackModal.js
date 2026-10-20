import React, { useState } from 'react';

const feedbackQuestions = [
  "How was the overall experience?",
  "Were the instructions clear?",
  "Do you have any suggestions for improvement?"
];

const FeedbackModal = ({ onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < feedbackQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit feedback or handle end of feedback process
      // console.log("Feedback responses:", responses);
      onClose();
    }
  };

  const handleResponseChange = (event) => {
    const newValue = event.target.value;
    // console.log("Textarea input:", newValue);  // Log the input value
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = newValue;
    setResponses(newResponses);
  };

  return (
    <div style={modalStyles}>
      <div style={modalContentStyles}>
        <h2 style={feedbackModalContent}>Feedback</h2>
        <p style={feedbackModalContent}>{feedbackQuestions[currentQuestionIndex]}</p>
        <br/>
        <textarea
          rows="5"
          cols="50"
          onChange={handleResponseChange}
          value={responses[currentQuestionIndex] || ''}
          style={textareaStyles}
        />
        <div style={buttonContainerStyles}>
          <button onClick={handleNextQuestion} style={buttonStyles}>
            {currentQuestionIndex < feedbackQuestions.length - 1 ? 'Next' : 'Submit'}
          </button>
          <button onClick={onClose} style={buttonStyles}>Close</button>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyles = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '400px',
  textAlign: 'center',
};

const feedbackModalContent = {
  background: "#fff",
  color: "red",
  width: "100%",
};

const textareaStyles = {
  width: '100%',
  marginBottom: '10px',
  border: "1px solid blue"
};

const buttonContainerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
};

const buttonStyles = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  background: "blue",
  color: "#fff",
  cursor: 'pointer',
};

export default FeedbackModal;
