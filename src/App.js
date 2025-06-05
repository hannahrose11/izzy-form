import * as React from "react";
import { useState, useRef, useEffect } from "react";

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
  const textareaRef = useRef(null);

  // Prevent zoom on input focus for iOS
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        e.target.style.fontSize = '16px';
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

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
        
        // Log what we're sending to help debug
        console.log("Sending to Pipedream:", JSON.stringify(updatedAnswers, null, 2));
        
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
        
        console.log("Formatted data:", JSON.stringify(dataToSend, null, 2));
        
        // Try different approaches to ensure Pipedream receives the data
        const response = await fetch("https://eo61pxe93i0terz.m.pipedream.net", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        // Check if the response is the template (indicating empty data was received)
        if (responseText.includes("TASK: \nAUDIENCE: \nTONE:")) {
          console.error("Pipedream received empty data!");
          console.log("Data we tried to send:", dataToSend);
          
          // Try to display what we attempted to send
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
          console.log("Parsed response:", data);
        } catch (e) {
          console.error("Failed to parse response:", e);
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
        // Focus on textarea after state update
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 100);
      }
    } catch (err) {
      console.error("Error details:", err);
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
      // Focus on textarea after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
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

  // Handle textarea focus to ensure visibility on mobile
  const handleTextareaFocus = (e) => {
    // Small delay to wait for keyboard to appear
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  return (
    <div style={{ 
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
      maxWidth: 600, 
      margin: "0 auto", 
      padding: "24px",
      minHeight: "100vh",
      boxSizing: "border-box",
      WebkitTextSizeAdjust: "100%",
      textSizeAdjust: "100%",
    }}>
      {error && (
        <div style={{ 
          background: "#fee", 
          color: "#c00", 
          padding: "12px", 
          marginBottom: "20px",
          borderRadius: "8px",
          fontSize: "14px",
          boxSizing: "border-box",
        }}>
          {error}
        </div>
      )}
      
      {!finalPrompt ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Question {step + 1} of {questions.length}
            </div>
            <div style={{ 
              width: "100%", 
              height: "8px", 
              background: "#e0e0e0", 
              borderRadius: "4px",
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
          
          <p style={{ 
            fontSize: "18px", 
            marginBottom: "12px",
            lineHeight: "1.4",
            padding: "0 10px",
          }}>
            {current.question}
          </p>
          
          <textarea
            ref={textareaRef}
            rows={4}
            style={{
              width: "calc(100% - 20px)",
              maxWidth: "500px",
              margin: "0 auto",
              display: "block",
              padding: "12px",
              fontSize: "16px",
              lineHeight: "1.4",
              borderRadius: "8px",
              border: "1px solid #ccc",
              resize: "vertical",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              touchAction: "manipulation",
            }}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onFocus={handleTextareaFocus}
            placeholder="Type your answer here..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck="true"
          />
          
          <div style={{ marginTop: "16px", padding: "0 10px" }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  marginRight: "8px",
                  background: "#f0f0f0",
                  color: "#333",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!currentInput.trim() || loading}
              style={{
                background: currentInput.trim() ? "#FF4D80" : "#ccc",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: currentInput.trim() && !loading ? "pointer" : "not-allowed",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "20px", 
            marginBottom: "12px",
            padding: "0 10px",
          }}>
            Here's your GPT-optimized prompt:
          </h2>
          <pre style={{ 
            background: "#f6f6f6", 
            padding: "16px", 
            borderRadius: "8px", 
            whiteSpace: "pre-wrap", 
            textAlign: "left",
            maxHeight: "400px",
            overflow: "auto",
            margin: "0 10px",
            fontSize: "14px",
            lineHeight: "1.4",
            WebkitOverflowScrolling: "touch",
            boxSizing: "border-box",
          }}>
            {finalPrompt}
          </pre>
          <div style={{ marginTop: "16px", padding: "0 10px" }}>
            <button
              onClick={copyPrompt}
              style={{
                marginRight: "8px",
                marginBottom: "8px",
                background: "#00C2A8",
                color: "white",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Copy Prompt
            </button>
            <button
              onClick={startOver}
              style={{
                marginRight: "8px",
                marginBottom: "8px",
                background: "#f0f0f0",
                color: "#333",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Start Over
            </button>
          </div>
          
          <div style={{ marginTop: "16px", padding: "0 10px" }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Open in:</p>
            <a
              href={`https://chat.openai.com/?model=gpt-4&prompt=${encodeURIComponent(finalPrompt)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                marginRight: "8px",
                color: "#FF4D80",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "16px",
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
                marginRight: "8px",
                color: "#FF4D80",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "16px",
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
                fontWeight: "bold",
                fontSize: "16px",
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
