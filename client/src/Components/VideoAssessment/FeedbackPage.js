import React, { useState } from "react";
import "./FeedbackPage.css"; // Import the CSS file for styling

const FeedbackForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState({
    satisfaction: "",
    experience: "",
    aiAssessment: "",
    suggestions: "",
  });

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleChange = (e) => {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value,
    });
  };

  const handleStarClick = (name, value) => {
    setFeedback({
      ...feedback,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Feedback Submitted:", feedback);
    alert("Thank you for your feedback!");
    // Reset form and step
    setCurrentStep(1);
    setFeedback({
      satisfaction: "",
      experience: "",
      aiAssessment: "",
      suggestions: "",
    });
  };

  return (
    <div  className="feedbackpage">
    <div className="feedback-container">
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <div className="feedback-step">
            <h2 className="feedback-question">
              How do you feel about our service? 😊
            </h2>
            <div className="feedback-options emoji-options">
              <label className="feedback-option">
                <input
                  type="radio"
                  name="satisfaction"
                  value="Very Satisfied"
                  checked={feedback.satisfaction === "Very Satisfied"}
                  onChange={handleChange}
                />
                <span role="img" aria-label="Very Satisfied">
                  😄
                </span>
              </label>
              <label className="feedback-option">
                <input
                  type="radio"
                  name="satisfaction"
                  value="Satisfied"
                  checked={feedback.satisfaction === "Satisfied"}
                  onChange={handleChange}
                />
                <span role="img" aria-label="Satisfied">
                  🙂
                </span>
              </label>
              <label className="feedback-option">
                <input
                  type="radio"
                  name="satisfaction"
                  value="Neutral"
                  checked={feedback.satisfaction === "Neutral"}
                  onChange={handleChange}
                />
                <span role="img" aria-label="Neutral">
                  😐
                </span>
              </label>
              <label className="feedback-option">
                <input
                  type="radio"
                  name="satisfaction"
                  value="Dissatisfied"
                  checked={feedback.satisfaction === "Dissatisfied"}
                  onChange={handleChange}
                />
                <span role="img" aria-label="Dissatisfied">
                  🙁
                </span>
              </label>
            </div>
            <div className="feedback-buttons">
              <button
                type="button"
                className="feedback-next-button"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="feedback-step">
            <h2 className="feedback-question">
              How was your overall experience?
            </h2>
            <div className="feedback-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`feedback-star ${
                    feedback.experience >= star ? "selected" : ""
                  }`}
                  onClick={() => handleStarClick("experience", star)}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="feedback-buttons">
              <button
                type="button"
                className="feedback-previous-button"
                onClick={handlePrevious}
              >
                Previous
              </button>
              <button
                type="button"
                className="feedback-next-button"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="feedback-step">
            <h2 className="feedback-question">
              Rate the AI video assessment 🤖
            </h2>
            <div className="feedback-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`feedback-star ${
                    feedback.aiAssessment >= star ? "selected" : ""
                  }`}
                  onClick={() => handleStarClick("aiAssessment", star)}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="feedback-buttons">
              <button
                type="button"
                className="feedback-previous-button"
                onClick={handlePrevious}
              >
                Previous
              </button>
              <button
                type="button"
                className="feedback-next-button"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="feedback-step">
            <h2 className="feedback-question">
              Any suggestions for improving the AI assessments? 💡
            </h2>
            <textarea
              className="feedback-textarea"
              name="suggestions"
              value={feedback.suggestions}
              onChange={handleChange}
              placeholder="Your suggestions..."
            />
            <div className="feedback-buttons">
              <button
                type="button"
                className="feedback-previous-button"
                onClick={handlePrevious}
              >
                Previous
              </button>
              <button type="submit" className="feedback-submit-button">
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
    </div> 
  );
};

export default FeedbackForm;
