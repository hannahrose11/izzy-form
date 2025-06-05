import * as React from "react";
import { useState } from "react";

export default function App() {
  const questions = [
    { id: "task", question: "Alright, what's the annoying thing you want help with today?" },
    { id: "audience", question: "Who's going to use this when it's done?" },
    { id: "tone", question: "Should it sound casual? Professional? Funny? Direct? Tell me the vibe you're going for." },
    { id: "include", question: "What details, facts, or ideas absolutely need to be in there?" },
    { id: "avoid", question: "Anything you don't want it to say or sound like?" },
    { id: "format", question: "Are we making a list? An email? A short caption? A table? Something else?" },
    { id: "context", question: "Where are you using this — like on social media, in a message, printed, or just for your own brain?" },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    try {
      setError("");
      
      // Save current answer with the current input
      const updatedAnswers = {
        ...answers,
        [questions[step].id]: currentInput,
      };
      
      setAnswers(updatedAnswers);

      if (step === questions.length - 1) {
        // Last question - generate prompt
        setLoading(true);
        
        // Create form data exactly as expected
        const dataToSend = {
          task: updatedAnswers.task || "",
          audience: updatedAnswers.audience || "",
          tone: updatedAnswers.tone || "",
          include: updatedAnswers.include || "",
          avoid: updatedAnswers.avoid || "",
          format: updatedAnswers.format || "",
          context: updatedAnswers.context || ""
        };
        
        const response = await fetch("https://eo61pxe93i0terz.m.pipedream.net", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
        
        const responseText = await response.text();
        
        // Check if the response is the template (indicating empty data was received)
        if (responseText.includes("TASK: \nAUDIENCE: \nTONE:")) {
          const debugPrompt = `
DEBUG: Data not received by Pipedream. Here's what we tried to send:

TASK: ${dataToSend.task}
AUDIENCE: ${dataToSend.audience}
TONE: ${dataToSend.tone}
INCLUDE: ${dataToSend.include}
AVOID: ${dataToSend.avoid}
FORMAT: ${dataToSend.format}
CONTEXT: ${dataToSend.context}

Check the browser console for more details.`;
          setFinalPrompt(debugPrompt);
          return;
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If it's not JSON, just use the text as is
          setFinalPrompt(responseText);
          return;
        }
        
        if (data.finalPrompt) {
          setFinalPrompt(data.finalPrompt);
        } else if (data.body && data.body.finalPrompt) {
          // Sometimes the response is nested
          setFinalPrompt(data.body.finalPrompt);
        } else {
          // If we get the template back, show it anyway
          setFinalPrompt(responseText);
        }
      } else {
        // Move to next question
        setStep(step + 1);
        setCurrentInput(answers[questions[step + 1]?.id] || "");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      // Save current answer before going back
      const updatedAnswers = {
        ...answers,
        [questions[step].id]: currentInput,
      };
      setAnswers(updatedAnswers);
      
      setStep(step - 1);
      setCurrentInput(updatedAnswers[questions[step - 1].id] || "");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt)
      .then(() => alert("Prompt copied to clipboard!"))
      .catch(() => alert("Failed to copy prompt"));
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setCurrentInput("");
    setFinalPrompt("");
    setError("");
  };

  const current = questions[step];

  // Mobile-friendly styles
  const textareaStyle = {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontFamily: "inherit",
    lineHeight: "1.4",
    WebkitAppearance: "none",
    appearance: "none",
    resize: "vertical",
    boxSizing: "border-box",
    touchAction: "manipulation",
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    WebkitAppearance: "none",
    appearance: "none",
    touchAction: "manipulation",
  };

  return (
    <div style={{ 
      fontFamily: "Inter, system-ui, sans-serif", 
      maxWidth: 600, 
      margin: "0 auto", 
      padding: 24,
      boxSizing: "border-box",
    }}>
      {error && (
        <div style={{ 
          background: "#fee", 
          color: "#c00", 
          padding: 12, 
          marginBottom: 20,
          borderRadius: 8,
          fontSize: 14
        }}>
          {error}
        </div>
      )}
      
      {!finalPrompt ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Question {step + 1} of {questions.length}
            </div>
            <div style={{ 
              width: "100%", 
              height: 8, 
              background: "#e0e0e0", 
              borderRadius: 4,
              overflow: "hidden"
            }}>
              <div style={{ 
                width: `${((step + 1) / questions.length) * 100}%`, 
                height: "100%", 
                background: "#FF4D80",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
          
          <p style={{ fontSize: 18, marginBottom: 16, lineHeight: 1.4 }}>
            {current.question}
          </p>
          
          <textarea
            rows={4}
            style={textareaStyle}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your answer here..."
            autoComplete="off"
          />
          
          <div style={{ marginTop: 16 }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  ...buttonStyle,
                  marginRight: 8,
                  background: "#f0f0f0",
                  color: "#333",
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!currentInput.trim() || loading}
              style={{
                ...buttonStyle,
                background: currentInput.trim() ? "#FF4D80" : "#ccc",
                color: "white",
                cursor: currentInput.trim() && !loading ? "pointer" : "not-allowed",
              }}
            >
              {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>
            Here's your GPT-optimized prompt:
          </h2>
          <pre style={{ 
            background: "#f6f6f6", 
            padding: 16, 
            borderRadius: 8, 
            whiteSpace: "pre-wrap", 
            textAlign: "left",
            maxHeight: 400,
            overflow: "auto",
            fontSize: 14,
            lineHeight: 1.4,
          }}>
            {finalPrompt}
          </pre>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={copyPrompt}
              style={{
                ...buttonStyle,
                marginRight: 8,
                background: "#00C2A8",
                color: "white",
              }}
            >
              Copy Prompt
            </button>
            <button
              onClick={startOver}
              style={{
                ...buttonStyle,
                background: "#f0f0f0",
                color: "#333",
              }}
            >
              Start Over
            </button>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Open in:</p>
            <a
              href={`https://chat.openai.com/?model=gpt-4&prompt=${encodeURIComponent(finalPrompt)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                marginRight: 8,
                color: "#FF4D80",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              ChatGPT
            </a>
            <span style={{ margin: "0 4px", color: "#ccc" }}>•</span>
            <a 
              href="https://claude.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                marginRight: 8,
                color: "#FF4D80",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              Claude
            </a>
            <span style={{ margin: "0 4px", color: "#ccc" }}>•</span>
            <a 
              href="https://gemini.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: "#FF4D80",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              Gemini
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
