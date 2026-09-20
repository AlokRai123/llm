"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

type Sender = "mine" | "theirs";
type Message = { id: number; sender: Sender; text: string; time: string };

const SUGGESTIONS = ["What are your opening hours?", "I need help with an order", "Talk to a person"];

const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

type ChatResponse = { success: true; response: string } | { success: false; message: string };

async function getReply(message: string): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = (await response.json()) as ChatResponse;
  if (!response.ok || !data.success) {
    throw new Error(data.success ? "Chat request failed" : data.message);
  }
  return data.response;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | undefined>(undefined);

  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const push = (sender: Sender, body: string) =>
    setMessages((m) => [...m, { id: nextId.current++, sender, text: body, time: now() }]);

  // Seed the greeting on the client to avoid a hydration mismatch on the timestamp.
  useEffect(() => {
    push("theirs", "Hi! I'm here to help. any thing you want to ask about alok rai or you can pick one below.");
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  // Grow the textarea with its content.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  async function send(raw: string) {
    const body = raw.trim();
    if (!body || typing) return;
    setShowQuick(false);
    push("mine", body);
    setText("");
    setTyping(true);
    try {
      push("theirs", await getReply(body));
    } catch {
      push("theirs", "Something went wrong. Please try again.");
    } finally {
      setTyping(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(text);
    }
  }

  function clearChat() {
    setMessages([]);
    setShowQuick(true);
    setTyping(false);
    nextId.current = 1;
    push("theirs", "Hi! I'm here to help. Ask a question or pick one below.");
    inputRef.current?.focus();
  }

  return (
    <main className="chat" data-theme={theme} aria-label="Chat">
      <header className="head">
        <div className="avatar" aria-hidden="true">S</div>
        <div className="who">
          <h1>Support team</h1>
          <div className="status"><span className="dot" />Online, replies in a few seconds</div>
        </div>
        <button
          className="iconBtn"
          type="button"
          aria-label="Switch light or dark theme"
          onClick={() =>
            setTheme((t) => {
              const dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
              return dark ? "light" : "dark";
            })
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        </button>
        <button className="iconBtn" type="button" aria-label="Clear conversation" onClick={clearChat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
        </button>
      </header>

      <div className="messages" ref={listRef} role="log" aria-live="polite" aria-label="Messages">
        {messages.map((m, i) => (
          <div key={m.id} className={`row ${m.sender}${i > 0 && messages[i - 1].sender !== m.sender ? " gap" : ""}`}>
            <div className="bubble">{m.text}</div>
            <div className="time">{m.time}</div>
          </div>
        ))}
        {typing && (
          <div className="row theirs typingRow gap" aria-label="Support team is typing">
            <div className="bubble typing"><i /><i /><i /></div>
          </div>
        )}
      </div>

      {showQuick && (
        <div className="quick">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={onSubmit} autoComplete="off">
        <label className="sr" htmlFor="chat-input">Message</label>
        <textarea
          id="chat-input"
          ref={inputRef}
          rows={1}
          value={text}
          placeholder="Write a message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="send" type="submit" aria-label="Send message" disabled={!text.trim() || typing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>
        </button>
      </form>

      <style jsx>{`
        .chat {
          --panel: #ffffff; --ink: #17233a; --muted: #64738a; --line: #d9e1ea;
          --mine: #17233a; --mineInk: #f4f7fa; --theirs: #eef3f7;
          --accent: #1f8a84; --accentInk: #ffffff;
          width: 100%; max-width: 440px; height: min(680px, 100vh);
          margin: 0 auto;
          background: var(--panel); color: var(--ink);
          border: 1px solid var(--line); border-radius: 20px;
          box-shadow: 0 18px 50px -20px rgba(23, 35, 58, 0.35);
          display: flex; flex-direction: column; overflow: hidden;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        @media (prefers-color-scheme: dark) {
          .chat:not([data-theme="light"]) {
            --panel: #161e2e; --ink: #e7edf5; --muted: #8b9ab0; --line: #26314a;
            --mine: #2aa79f; --mineInk: #06201e; --theirs: #1e2839;
            --accent: #2aa79f; --accentInk: #06201e;
          }
        }
        .chat[data-theme="dark"] {
          --panel: #161e2e; --ink: #e7edf5; --muted: #8b9ab0; --line: #26314a;
          --mine: #2aa79f; --mineInk: #06201e; --theirs: #1e2839;
          --accent: #2aa79f; --accentInk: #06201e;
        }

        .head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
        .avatar { width: 40px; height: 40px; border-radius: 12px; background: var(--accent); color: var(--accentInk); display: grid; place-items: center; font-weight: 700; font-size: 18px; flex: none; }
        .who { flex: 1; min-width: 0; }
        .who h1 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
        .status { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); margin-top: 2px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
        .iconBtn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: transparent; color: var(--muted); cursor: pointer; display: grid; place-items: center; }
        .iconBtn:hover { color: var(--ink); background: var(--theirs); }
        .iconBtn svg { width: 18px; height: 18px; }

        .messages { flex: 1; overflow-y: auto; padding: 18px 16px 8px; display: flex; flex-direction: column; gap: 4px; }
        .row { display: flex; flex-direction: column; max-width: 82%; }
        .row.mine { align-self: flex-end; align-items: flex-end; }
        .row.theirs { align-self: flex-start; align-items: flex-start; }
        .row.gap { margin-top: 10px; }
        .bubble { padding: 9px 13px; font-size: 15px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; animation: land 0.18s ease-out; }
        .mine .bubble { background: var(--mine); color: var(--mineInk); border-radius: 16px 16px 4px 16px; }
        .theirs .bubble { background: var(--theirs); color: var(--ink); border-radius: 16px 16px 16px 4px; }
        .time { font-size: 11.5px; color: var(--muted); margin: 3px 4px 0; }
        @keyframes land { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

        .typing { display: flex; gap: 4px; padding: 13px 14px; }
        .typing i { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: blink 1.1s infinite ease-in-out; }
        .typing i:nth-child(2) { animation-delay: 0.15s; }
        .typing i:nth-child(3) { animation-delay: 0.3s; }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }

        .quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 8px; }
        .quick button { font: inherit; font-size: 13.5px; color: var(--accent); background: transparent; border: 1px solid var(--accent); border-radius: 999px; padding: 6px 12px; cursor: pointer; }
        .quick button:hover { background: var(--accent); color: var(--accentInk); }

        .composer { display: flex; align-items: flex-end; gap: 8px; padding: 12px; border-top: 1px solid var(--line); }
        .composer textarea { flex: 1; resize: none; max-height: 120px; min-height: 42px; font: inherit; font-size: 15px; line-height: 1.4; color: var(--ink); background: var(--theirs); border: 1px solid transparent; border-radius: 14px; padding: 10px 14px; outline: none; }
        .composer textarea::placeholder { color: var(--muted); }
        .composer textarea:focus { border-color: var(--accent); }
        .send { width: 42px; height: 42px; flex: none; border: 0; border-radius: 14px; background: var(--accent); color: var(--accentInk); cursor: pointer; display: grid; place-items: center; }
        .send:disabled { opacity: 0.4; cursor: not-allowed; }
        .send svg { width: 20px; height: 20px; }

        button:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

        @media (prefers-reduced-motion: reduce) {
          .bubble, .typing i { animation: none; }
        }
        @media (max-width: 480px) {
          .chat { height: 100vh; max-width: none; border-radius: 0; border: 0; }
        }
      `}</style>
    </main>
  );
}