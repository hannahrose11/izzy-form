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
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force input to be interactive
  useEffect(() => {
    if (textareaRef.current) {
      // Force enable the textarea
      textareaRef.current.readOnly = false;
      textareaRef.current.disabled = false;
      
      // Remove any pointer-events styling
      textareaRef.current.style.pointerEvents = 'auto';
      textareaRef.current.style.userSelect = 'text';
      textareaRef.current.style.WebkitUserSelect = 'text';
      
      // Ensure it's touchable
      textareaRef.current.style.touchAction = 'auto';
      
      // Force z-index to be on top
      textareaRef.current.style.position = 'relative';
      textareaRef.current.style.zIndex = '9999';
    }
  });

  const handleNext = async () => {
    try {
      setError("");
      
      const updatedAnswers = {
        ...answers,
        [questions[step].id]: currentInput,
      };
      
      setAnswers(updatedAnswers);

      if (step === questions.length - 1) {
        setLoading(true);
        
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
        
        if (responseText.includes("TASK: \nAUDIENCE: \nTONE:")) {
          const debugPrompt = `
DEBUG: Data not received by Pipedream. Here's what we tried to send:

TASK: ${dataToSend.task}
AUDIENCE: ${dataToSend.audience}
TONE: ${dataToSend.tone}
INCLUDE: ${dataToSend.include}
AVOID: ${dataToSend.avoid}
FORMAT: ${dataToSend.format}
CONTEXT: ${dataToSend.context}`;
          setFinalPrompt(debugPrompt);
          return;
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          setFinalPrompt(responseText);
          return;
        }
        
        if (data.finalPrompt) {
          setFinalPrompt(data.finalPrompt);
        } else if (data.body && data.body.finalPrompt) {
          setFinalPrompt(data.body.finalPrompt);
        } else {
          setFinalPrompt(responseText);
        }
      } else {
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
    // Fallback for mobile
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(finalPrompt)
        .then(() => alert("Prompt copied to clipboard!"))
        .catch(() => {
          // Fallback method
          const textArea = document.createElement("textarea");
          textArea.value = finalPrompt;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            alert("Prompt copied to clipboard!");
          } catch (err) {
            alert("Failed to copy prompt");
          }
          document.body.removeChild(textArea);
        });
    } else {
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = finalPrompt;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Prompt copied to clipboard!");
      } catch (err) {
        alert("Failed to copy prompt");
      }
      document.body.removeChild(textArea);
    }
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setCurrentInput("");
    setFinalPrompt("");
    setError("");
  };

  const current = questions[step];

  // Alternative input method for extreme cases
  const [useBasicInput, setUseBasicInput] = useState(false);

  return (
    <div style={{ 
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", 
      maxWidth: "600px", 
      width: "100%",
      margin: "0 auto", 
      padding: "20px",
      boxSizing: "border-box",
    }}>
      {/* Debug info */}
      {isMobile && (
        <div style={{ 
          fontSize: "12px", 
          color: "#666", 
          marginBottom: "10px",
          textAlign: "center" 
        }}>
          Mobile detected • {useBasicInput ? "Basic" : "Standard"} input mode
        </div>
      )}

      {error && (
        <div style={{ 
          background: "#fee", 
          color: "#c00", 
          padding: "12px", 
          marginBottom: "20px",
          borderRadius: "8px",
          fontSize: "14px",
        }}>
          {error}
        </div>
      )}
      
      {!finalPrompt ? (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px", textAlign: "center" }}>
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
            marginBottom: "16px",
            textAlign: "center",
            lineHeight: "1.5",
          }}>
            {current.question}
          </p>

          {/* Toggle for basic input if textarea fails */}
          {isMobile && (
            <button
              onClick={() => setUseBasicInput(!useBasicInput)}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                fontSize: "12px",
                textDecoration: "underline",
                marginBottom: "10px",
                cursor: "pointer",
                display: "block",
                margin: "0 auto 10px",
              }}
            >
              Having trouble typing? Click here
            </button>
          )}

          {useBasicInput ? (
            // Basic input as fallback
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer here..."
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                marginBottom: "16px",
                WebkitAppearance: "none",
                outline: "none",
              }}
            />
          ) : (
            // Standard textarea
            <textarea
              ref={textareaRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                lineHeight: "1.5",
                border: "2px solid #ddd",
                borderRadius: "8px",
                resize: "vertical",
                marginBottom: "16px",
                fontFamily: "inherit",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                outline: "none",
                display: "block",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000",
              }}
              onTouchStart={(e) => {
                e.target.focus();
              }}
            />
          )}
          
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "10px",
            flexWrap: "wrap" 
          }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#333",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!currentInput.trim() || loading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                borderRadius: "8px",
                background: currentInput.trim() ? "#FF4D80" : "#ccc",
                color: "#fff",
                cursor: currentInput.trim() && !loading ? "pointer" : "not-allowed",
                minWidth: "120px",
              }}
            >
              {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ 
            fontSize: "20px", 
            marginBottom: "16px",
            textAlign: "center",
          }}>
            Here's your GPT-optimized prompt:
          </h2>
          <div style={{ 
            background: "#f6f6f6", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "16px",
            maxHeight: "400px",
            overflow: "auto",
          }}>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.5",
              fontFamily: "monospace",
            }}>
              {finalPrompt}
            </pre>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}>
            <button
              onClick={copyPrompt}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                borderRadius: "8px",
                background: "#00C2A8",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Copy Prompt
            </button>
            <button
              onClick={startOver}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "600",
                border: "2px solid #ddd",
                borderRadius: "8px",
                background: "#fff",
                color: "#333",
                cursor: "pointer",
              }}
            >
              Start Over
            </button>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Open in:
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <a
                href={`https://chat.openai.com/?model=gpt-4&prompt=${encodeURIComponent(finalPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: "#FF4D80",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                ChatGPT
              </a>
              <a 
                href="https://claude.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: "#FF4D80",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                Claude
              </a>
              <a 
                href="https://gemini.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: "#FF4D80",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                Gemini
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
