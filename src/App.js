import React, { useState } from "react";

export default function App() {
  const questions = [
    { id: "task", question: "Alright, what's the annoying thing you want help with today?" },
    { id: "audience", question: "Who's going to use this when it's done?" },
    { id: "tone", question: "Should it sound casual? Professional? Funny? Direct? Tell me the vibe you're going for." },
    { id: "include", question: "What details, facts, or ideas absolutely need to be in there?" },
    { id: "avoid", question: "Anything you don't want it to say or sound like?" },
    { id: "format", question: "Are we making a list? An email? A short caption? A table? Something else?" },
    { id: "context", question: "Where are you using this ? like on social media, in a message, printed, or just for your own brain?" },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const currentAnswer = document.getElementById("answer-input").value;
    
    const updatedAnswers = {
      ...answers,
      [questions[step].id]: currentAnswer,
    };
    
    setAnswers(updatedAnswers);

    if (step === questions.length - 1) {
      setLoading(true);
      
      try {
        const response = await fetch("https://eo61pxe93i0terz.m.pipedream.net", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAnswers),
        });
        
        const responseText = await response.text();
        setFinalPrompt(responseText);
      } catch (err) {
        setFinalPrompt("Error generating prompt. Please try again.");
      }
      
      setLoading(false);
    } else {
      setStep(step + 1);
      document.getElementById("answer-input").value = answers[questions[step + 1]?.id] || "";
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const currentAnswer = document.getElementById("answer-input").value;
      setAnswers({...answers, [questions[step].id]: currentAnswer});
      setStep(step - 1);
      setTimeout(() => {
        document.getElementById("answer-input").value = answers[questions[step - 1].id] || "";
      }, 10);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt).then(() => alert("Prompt copied to clipboard!"));
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setFinalPrompt("");
  };

  if (finalPrompt) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Here's your GPT-optimized prompt:</h2>
        <div style={{ background: "#f6f6f6", padding: "16px", borderRadius: "8px", marginBottom: "16px", textAlign: "left" }}>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "14px", lineHeight: "1.4" }}>{finalPrompt}</pre>
        </div>
        <div>
          <button 
            onClick={copyPrompt} 
            style={{ 
              marginRight: "8px", 
              padding: "10px 16px", 
              fontSize: "16px",
              background: "#00C2A8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Copy Prompt
          </button>
          <button 
            onClick={startOver} 
            style={{ 
              padding: "10px 16px",
              fontSize: "16px",
              background: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "24px", textAlign: "center" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
          Question {step + 1} of {questions.length}
        </div>
        <div style={{ width: "100%", height: "8px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ 
            width: `${((step + 1) / questions.length) * 100}%`, 
            height: "100%", 
            background: "#FF4D80",
            transition: "width 0.3s ease"
          }} />
        </div>
      </div>
      
      <p style={{ fontSize: "18px", marginBottom: "12px" }}>{questions[step].question}</p>
      
      <textarea
        id="answer-input"
        placeholder="Type your answer here..."
        rows={4}
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          display: "block",
          padding: "12px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginBottom: "16px",
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "inherit",
          lineHeight: "1.4"
        }}
      />
      
      <div style={{ marginTop: "16px" }}>
        {step > 0 && (
          <button 
            onClick={handleBack} 
            style={{ 
              marginRight: "8px", 
              padding: "10px 20px",
              fontSize: "16px",
              background: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Back
          </button>
        )}
        <button 
          onClick={handleNext} 
          disabled={loading}
          style={{ 
            padding: "10px 20px",
            fontSize: "16px",
            background: "#FF4D80",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
        </button>
      </div>
    </div>
  );
}
