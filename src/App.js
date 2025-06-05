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
    navigator.clipboard.writeText(finalPrompt).then(() => alert("Copied!"));
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setFinalPrompt("");
  };

  if (finalPrompt) {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h2>Your prompt:</h2>
        <div style={{ background: "#f0f0f0", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{finalPrompt}</pre>
        </div>
        <button onClick={copyPrompt} style={{ marginRight: "10px", padding: "10px 20px" }}>Copy</button>
        <button onClick={startOver} style={{ padding: "10px 20px" }}>Start Over</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div>Question {step + 1} of {questions.length}</div>
        <div style={{ width: "100%", height: "10px", background: "#e0e0e0", borderRadius: "5px", marginTop: "5px" }}>
          <div style={{ width: `${((step + 1) / questions.length) * 100}%`, height: "100%", background: "#FF4D80", borderRadius: "5px" }} />
        </div>
      </div>
      
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>{questions[step].question}</p>
      
      <input
        id="answer-input"
        type="text"
        placeholder="Type your answer here..."
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "16px",
          border: "2px solid #ddd",
          borderRadius: "5px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      />
      
      <div>
        {step > 0 && (
          <button onClick={handleBack} style={{ marginRight: "10px", padding: "10px 20px" }}>Back</button>
        )}
        <button 
          onClick={handleNext} 
          disabled={loading}
          style={{ padding: "10px 20px", background: "#FF4D80", color: "white", border: "none", borderRadius: "5px" }}
        >
          {step === questions.length - 1 ? (loading ? "Loading..." : "Get Prompt") : "Next"}
        </button>
      </div>
    </div>
  );
}

