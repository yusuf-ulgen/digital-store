"use client";

import { useState } from "react";
import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Basit CSS Transition */}
      <div
        className={`transition-all duration-300 ease-in-out origin-bottom-right transform ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 translate-y-10 invisible pointer-events-none"
        }`}
      >
        <ChatWindow onClose={() => setIsOpen(false)} />
      </div>

      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
}