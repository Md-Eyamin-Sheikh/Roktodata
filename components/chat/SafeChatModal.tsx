'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, Send, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { initialChatMessages } from '@/lib/data';

interface SafeChatModalProps {
  donorName: string;
  onClose: () => void;
  onOpenReport: () => void;
}

export const SafeChatModal: React.FC<SafeChatModalProps> = ({
  donorName,
  onClose,
  onOpenReport,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [inputVal, setInputVal] = useState('');
  const msgCounterRef = useRef(100);

  const quickChips = ['কোথায় আসব?', 'আমি রওনা হয়েছি', 'পৌঁছে গেছি', 'ধন্যবাদ'];

  const handleSend = useCallback((textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    msgCounterRef.current += 1;
    const msgId = `MSG-${msgCounterRef.current}`;
    const newMsg: ChatMessage = {
      id: msgId,
      sender: 'user',
      senderName: 'রোগীর স্বজন',
      text,
      timestamp: 'এইমাত্র',
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputVal('');

    // Simulate donor response after 1.5s
    setTimeout(() => {
      msgCounterRef.current += 1;
      const reply: ChatMessage = {
        id: `MSG-${msgCounterRef.current}`,
        sender: 'donor',
        senderName: donorName,
        text: 'জি আমি মেসেজ পেয়েছি। যথাসময়ে উপস্থিত হচ্ছি।',
        timestamp: 'এইমাত্র',
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  }, [inputVal, donorName]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#F7F7F9] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Chat Header */}
        <div className="p-3.5 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FDECEF] text-[#C41E3A] font-bold text-xs flex items-center justify-center">
              তা
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B1B1F]">{donorName}</h3>
              <span className="text-[10px] text-[#00744B] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] animate-pulse" />
                সক্রিয় আছেন
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenReport}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6]/40 flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>রিপোর্ট</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Humanitarian safety banner */}
        <div className="px-3 py-1.5 bg-[#D9E2FF]/30 text-[11px] text-[#001946] flex items-center gap-1.5 border-b border-[#D9E2FF]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0D58C9] shrink-0" />
          <span>রক্তের বিনিময়ে টাকা লেনদেন নিষেধ। নিরাপদ চ্যাট পর্যবেক্ষণাধীন।</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => {
            const isSystem = m.sender === 'system';
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  isSystem ? 'items-center text-center' : isMe ? 'items-end' : 'items-start'
                }`}
              >
                {isSystem ? (
                  <span className="bg-[#E4E6EB] text-[#5B5F6B] text-[10px] px-3 py-1 rounded-full font-medium">
                    {m.text}
                  </span>
                ) : (
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      isMe
                        ? 'bg-[#C41E3A] text-white rounded-tr-none'
                        : 'bg-white text-[#1B1B1F] shadow-xs rounded-tl-none border border-[#E4E6EB]/60'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] mt-1 block ${
                        isMe ? 'text-white/80' : 'text-[#5B5F6B]'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Reply Chips (Section 12 requirement) */}
        <div className="px-3 py-2 bg-white/70 border-t border-[#E4E6EB]/50 flex gap-2 overflow-x-auto no-scrollbar">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-[#E4E6EB] text-xs font-semibold text-[#1B1B1F] hover:bg-[#FDECEF] hover:text-[#C41E3A] active:scale-95 transition-all shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E4E6EB] flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="বার্তা লিখুন..."
            className="flex-1 h-11 px-3.5 bg-[#F7F7F9] rounded-xl text-xs text-[#1B1B1F] outline-none focus:ring-1 focus:ring-[#C41E3A]"
          />
          <button
            onClick={() => handleSend()}
            className="w-11 h-11 rounded-xl bg-[#C41E3A] text-white flex items-center justify-center shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
