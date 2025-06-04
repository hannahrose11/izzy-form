import * as React from "react";
import { useState } from "react";

export default function App() {
  const questions = [
    { id: "task", question: "Alright, what’s the annoying thing you want help with today?" },
    { id: "audience", question: "Who’s going to use this when it’s done?" },
    { id: "tone", question: "Should it sound casual? Professional? Funny? Direct? Tell me the vibe you’re going for." },
    { id: "include", question: "What details, facts, or ideas absolutely need to be in there?" },
    { id: "avoid", question: "Anything you don’t want it to say or sound like?" },
    { id: "format", question: "Are we making a list? An email? A short caption? A table? Something else?" },
    { id: "context", question: "Where are you using this — like on social media, in a message, printed, or just for your own brain?" },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step === questions.length - 1) {
      setLoading(true);
      const response = await fetch("https://eo61pxe93i0terz.m.pipedream.net", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await response.json();
      setFinalPrompt(data.finalPrompt);
      setLoading(false);
    } else {
      setStep(step + 1);
    }
  };

  const handleChange = (e) => {
    setAnswers({ ...answers, [questions[step].id]: e.target.value });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt);
  };

  const current = questions[step];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 600, margin: "0 auto", padding: 24 }}>
      {!finalPrompt ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>{current.question}</p>
          <textarea
            rows={4}
            style={{
              width: "100%",
              maxWidth: 500,
              margin: "0 auto",
              display: "block",
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
            value={answers[current.id] || ""}
            onChange={handleChange}
          />
          <button
            onClick={handleNext}
            style={{
              marginTop: 16,
              background: "#FF4D80",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Here’s your GPT-optimized prompt:</h2>
          <pre style={{ background: "#f6f6f6", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", textAlign: "left" }}>
            {finalPrompt}
          </pre>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={copyPrompt}
              style={{
                marginRight: 8,
                background: "#00C2A8",
                color: "white",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Copy Prompt
            </button>
            <a
              href={`https://chat.openai.com/?model=gpt-4&prompt=${encodeURIComponent(finalPrompt)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: 8 }}
            >
              Open in ChatGPT
            </a>
            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
              Open Claude
            </a>
            <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">
              Open Gemini
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

