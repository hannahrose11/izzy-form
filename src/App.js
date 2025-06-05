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
    { id: "context", question: "Where are you using this â€” like on social media, in a message, printed, or just for your own brain?" },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editableRef = useRef(null);

  // Handle input changes for contenteditable
  const handleInputChange = () => {
    if (editableRef.current) {
      setCurrentInput(editableRef.current.innerText);
    }
  };

  // Update contenteditable when navigating
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerText = currentInput;
    }
  }, [step, currentInput]);

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
    // Create a temporary textarea to copy from
    const textarea = document.createElement('textarea');
    textarea.value = finalPrompt;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    try {
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      document.execCommand('copy');
      alert("Prompt copied to clipboard!");
    } catch (err) {
      alert("Failed to copy. Please select and copy manually.");
    }
    
    document.body.removeChild(textarea);
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setCurrentInput("");
    setFinalPrompt("");
    setError("");
  };

  const current = questions[step];

  return (
    <div style={{ 
      fontFamily: "Inter, system-ui, sans-serif", 
      maxWidth: 600, 
      margin: "0 auto", 
      padding: "20px",
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
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8, textAlign: "center" }}>
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
          
          <p style={{ fontSize: 18, marginBottom: 16, textAlign: "center", lineHeight: 1.4 }}>
            {current.question}
          </p>
          
          {/* ContentEditable div instead of textarea */}
          <div
            ref={editableRef}
            contentEditable
            onInput={handleInputChange}
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "2px solid #ddd",
              background: "#fff",
              marginBottom: "16px",
              lineHeight: "1.4",
              outline: "none",
              WebkitUserSelect: "text",
              userSelect: "text",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
            data-placeholder="Type your answer here..."
            suppressContentEditableWarning={true}
          />
          
          {/* CSS for placeholder */}
          <style>{`
            div[contenteditable]:empty:before {
              content: attr(data-placeholder);
              color: #999;
            }
          `}</style>
          
          <div style={{ textAlign: "center" }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  marginRight: 8,
                  padding: "12px 24px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f0f0f0",
                  color: "#333",
                  fontWeight: "bold",
                  cursor: "pointer",
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
                borderRadius: "8px",
                border: "none",
                background: currentInput.trim() ? "#FF4D80" : "#ccc",
                color: "white",
                fontWeight: "bold",
                cursor: currentInput.trim() && !loading ? "pointer" : "not-allowed",
              }}
            >
              {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
            </button>
          </div>

          {/* Alternative: Button-based input for extreme cases */}
          <div style={{ marginTop: 40, padding: 20, background: "#f5f5f5", borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 10, textAlign: "center" }}>
              Having trouble typing? Try voice input or use your device's native keyboard:
            </p>
            <button
              onClick={() => {
                const userInput = prompt(current.question);
                if (userInput) {
                  setCurrentInput(userInput);
                  if (editableRef.current) {
                    editableRef.current.innerText = userInput;
                  }
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Click here to use popup input
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 16, textAlign: "center" }}>
            Here's your GPT-optimized prompt:
          </h2>
          
          {/* Make the prompt selectable for manual copying */}
          <div style={{ 
            background: "#f6f6f6", 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 16,
            maxHeight: 400,
            overflow: "auto",
            WebkitUserSelect: "text",
            userSelect: "text",
          }}>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              margin: 0,
              fontSize: 14,
              lineHeight: 1.4,
              fontFamily: "monospace",
              WebkitUserSelect: "text",
              userSelect: "text",
            }}>
              {finalPrompt}
            </pre>
          </div>
          
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <button
              onClick={copyPrompt}
              style={{
                marginRight: 8,
                padding: "12px 20px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "none",
                background: "#00C2A8",
                color: "white",
                fontWeight: "bold",
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
                borderRadius: "8px",
                border: "none",
                background: "#f0f0f0",
                color: "#333",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Start Over
            </button>
          </div>
          
          <div style={{ textAlign: "center" }}>
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
            <span style={{ margin: "0 4px", color: "#ccc" }}>â€¢</span>
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
            <span style={{ margin: "0 4px", color: "#ccc" }}>â€¢</span>
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

