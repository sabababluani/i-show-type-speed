"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generateWords } from "../utils/wordGenerator";

const TypingBox = () => {
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => generateWords(), []);

  const text = words.join(" ");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (started && !finished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && !finished) {
      setFinished(true);
    }

    return () => clearInterval(timer);
  }, [started, timeLeft, finished]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!started && value.length === 1) {
      setStarted(true);
    }

    if (!finished && value.length <= text.length) {
      let correct = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === text[i]) correct++;
      }

      setCorrectChars(correct);
      setTyped(value);
    }
  };

  const renderText = () => {
    return text.split("").map((char, i) => {
      let className = "text-gray-500";

      if (i < typed.length) {
        className = typed[i] === char ? "text-white" : "text-red-500";
      }

      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  };

  const cpm = Math.floor(correctChars * 4);

  return (
    <div
      className="relative w-full max-w-3xl mx-auto p-6 bg-black min-h-screen text-xl font-mono text-white"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex justify-between items-center mb-4 text-lg">
        <span>⏱ Time Left: {timeLeft}s</span>
        {finished && <span>💥 Character per minute: {cpm}</span>}
      </div>

      <p className="break-words leading-relaxed">{renderText()}</p>

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        disabled={finished}
        className="absolute top-0 left-0 w-full h-full opacity-0"
        autoFocus
      />
    </div>
  );
};

export default TypingBox;
