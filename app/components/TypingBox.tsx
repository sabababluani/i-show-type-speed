"use client";

import { useEffect, useRef, useState } from "react";
import { generateWords } from "../utils/wordGenerator";

const INITIAL_WORD_COUNT = 30;
const APPEND_THRESHOLD = 10;

const TypingBox = () => {
  const [typed, setTyped] = useState("");
  const [duration, setDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [wordList, setWordList] = useState<string[]>([]);
  const [highScore, setHighScore] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const text = wordList.join(" ");
  const cpm = Math.floor(correctChars * (60 / duration));

  // Load high score
  useEffect(() => {
    const storedHighScore = localStorage.getItem("typingGameHighScore");
    if (storedHighScore) setHighScore(parseInt(storedHighScore, 10));
  }, []);

  // Generate initial words
  useEffect(() => {
    setWordList(generateWords(INITIAL_WORD_COUNT));
  }, []);

  // Countdown timer
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

  // Save high score
  useEffect(() => {
    if (finished && cpm > highScore) {
      localStorage.setItem("typingGameHighScore", cpm.toString());
      setHighScore(cpm);
    }
  }, [finished, cpm, highScore]);

  // Append more words as user nears the end
  useEffect(() => {
    if (!finished && text.length - typed.length < APPEND_THRESHOLD * 5) {
      setWordList((prev) => [...prev, ...generateWords(APPEND_THRESHOLD)]);
    }
  }, [typed, finished, text.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!started && value.length === 1) {
      setStarted(true);
    }

    if (!finished) {
      let correct = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === text[i]) correct++;
      }

      setCorrectChars(correct);
      setTyped(value);
    }
  };

  const handleRestart = () => {
    setTyped("");
    setTimeLeft(duration);
    setStarted(false);
    setFinished(false);
    setCorrectChars(0);
    setWordList(generateWords(INITIAL_WORD_COUNT));
    inputRef.current?.focus();
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = parseInt(e.target.value, 10);
    setDuration(newDuration);
    setTimeLeft(newDuration);
  };

  const renderText = () => {
    return text.split("").map((char, i) => {
      let className = "text-gray-500";
      if (i < typed.length) {
        className = typed[i] === char ? "text-white" : "text-red-500";
      }

      const isCursor = i === typed.length;

      return (
        <span key={i} className={`${className} relative`}>
          {char}
          {isCursor && !finished && (
            <span className="absolute left-0 top-0 w-[2px] h-full bg-white animate-blink" />
          )}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4 justify-center px-4">
      <h1 className="text-center font-bold text-5xl md:text-6xl">
        I Show Type Speed
      </h1>

      {!started && (
        <div className="flex justify-center mt-2">
          <label className="text-lg font-medium mr-2">⏱ Select Duration:</label>
          <select
            value={duration}
            onChange={handleDurationChange}
            className="px-3 py-1 rounded bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[15, 30, 45, 60].map((d) => (
              <option key={d} value={d}>
                {d} seconds
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className="relative w-full max-w-3xl mx-auto p-6 bg-black text-xl font-mono text-white rounded-md border border-gray-700"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex justify-between items-center mb-4 text-lg font-medium">
          <span>⏱ Time Left: {timeLeft}s</span>
          {finished && (
            <div className="flex flex-col items-end">
              <span>💥 CPM: {cpm}</span>
            </div>
          )}{" "}
          <span className="text-sm text-green-400">🏆 Personal Best: {highScore}</span>
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

      <div className="flex justify-center">
        <button
          onClick={handleRestart}
          className="bg-white text-black px-5 py-2 rounded hover:bg-gray-200 transition font-semibold"
        >
          🔄 Start Over
        </button>
      </div>
    </div>
  );
};

export default TypingBox;
