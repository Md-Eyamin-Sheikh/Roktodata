'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserCheck,
  Clock,
  CheckCheck,
  Lock,
} from 'lucide-react';
import { SafeChatMessage } from '@/lib/types';
import {
  fetchChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
} from '@/lib/services/bloodService';

interface SafeChatModalProps {
  donorName: string;
  donorId?: string;
  donorBloodGroup?: string;
  requestId?: string;
  currentUserId?: string;
  currentUserName?: string;
  onClose: () => void;
  onOpenReport: (name: string, userId?: string, requestId?: string) => void;
}

export const SafeChatModal: React.FC<SafeChatModalProps> = ({
  donorName,
  donorId = 'donor-1',
  donorBloodGroup,
  requestId = 'REQ-LIVE',
  currentUserId = 'user-current',
  currentUserName = 'রোগীর স্বজন',
  onClose,
  onOpenReport,
}) => {
  const [messages, setMessages] = useState<SafeChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if donor is blocked in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawBlocked = localStorage.getItem('roktodata_blocked_users');
        if (rawBlocked) {
          const list: string[] = JSON.parse(rawBlocked);
          if (list.includes(donorId) || list.includes(donorName)) {
            setIsBlocked(true);
          }
        }
      } catch (err) {
        console.error('Error reading blocked users:', err);
      }
    }
  }, [donorId, donorName]);

  // Load chat history & subscribe to Realtime
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial message history
    fetchChatMessages(requestId, currentUserId, donorId).then((history) => {
      if (isMounted) {
        setMessages(history);
      }
    });

    // 2. Realtime listener
    const unsubscribe = subscribeToChatMessages(requestId, (newMsg) => {
      if (isMounted) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [requestId, currentUserId, donorId]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickChips = ['কোথায় আসব?', 'আমি রওনা হয়েছি', 'পৌঁছে গেছি', 'ধন্যবাদ'];

  const handleSend = useCallback(
    async (textToSend?: string) => {
      if (isBlocked) {
        alert('আপনি এই ব্যবহারকারীকে ব্লক করেছেন। বার্তা পাঠাতে আগে আনব্লক করুন।');
        return;
      }

      const text = (textToSend || inputVal).trim();
      if (!text || isSending) return;

      setIsSending(true);
      if (!textToSend) setInputVal('');

      try {
        const sent = await sendChatMessage({
          requestId,
          senderId: currentUserId,
          senderName: currentUserName,
          receiverId: donorId,
          message: text,
        });

        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
      } catch (err) {
        console.error('Failed to send message:', err);
      } finally {
        setIsSending(false);
      }
    },
    [inputVal, isSending, isBlocked, requestId, currentUserId, currentUserName, donorId]
  );

  const toggleBlockUser = () => {
    const nextState = !isBlocked;
    setIsBlocked(nextState);
    if (typeof window !== 'undefined') {
      try {
        const rawBlocked = localStorage.getItem('roktodata_blocked_users');
        const list: string[] = rawBlocked ? JSON.parse(rawBlocked) : [];
        const identifier = donorId || donorName;
        const updated = nextState
          ? Array.from(new Set([...list, identifier]))
          : list.filter((id) => id !== identifier);
        localStorage.setItem('roktodata_blocked_users', JSON.stringify(updated));
      } catch (err) {
        console.error('Error updating blocked users:', err);
      }
    }
    setShowOptions(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#F7F7F9] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[640px] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Header */}
        <div className="p-3.5 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FDECEF] text-[#C41E3A] font-bold text-sm flex items-center justify-center shrink-0 border border-[#C41E3A]/20">
              {donorBloodGroup || 'রক্ত'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-[#1B1B1F] leading-tight">{donorName}</h3>
                {donorBloodGroup && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#FDECEF] text-[#C41E3A] font-extrabold text-[10px]">
                    {donorBloodGroup}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#00744B] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] animate-pulse" />
                  সক্রিয় চ্যাট
                </span>
                <span className="text-[10px] text-[#5B5F6B]">• আইডি: {requestId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenReport(donorName, donorId, requestId)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6]/40 flex items-center gap-1 cursor-pointer transition-colors"
              title="প্রতারণা বা অনিয়মের রিপোর্ট করুন"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">রিপোর্ট</span>
            </button>

            <button
              onClick={() => setShowOptions((prev) => !prev)}
              className="p-1.5 rounded-full text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
              title="আরও অপশন"
            >
              <Ban className="w-4 h-4 text-[#BA1A1A]" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B5F6B] hover:bg-[#F7F7F9] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Block Dropdown */}
          {showOptions && (
            <div className="absolute right-4 top-14 bg-white rounded-2xl shadow-xl border border-[#E4E6EB] p-2 z-20 w-48 animate-in fade-in zoom-in-95">
              <button
                onClick={toggleBlockUser}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  isBlocked
                    ? 'text-[#00744B] hover:bg-[#E8F5E9]'
                    : 'text-[#BA1A1A] hover:bg-[#FFDAD6]/40'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isBlocked ? 'আনব্লক করুন' : 'রক্তদাতা ব্লক করুন'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Security & Verification Banner */}
        <div className="px-3.5 py-2 bg-[#D9E2FF]/35 text-[11px] text-[#001946] flex items-center justify-between border-b border-[#D9E2FF]/60 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D58C9] shrink-0" />
            <span className="leading-tight">
              <strong>নিরাপদ মানবিক চ্যাট:</strong> রক্তের বিনিময়ে কোনো অর্থ লেনদেন নিষিদ্ধ।
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#0D58C9] font-medium shrink-0">
            <Lock className="w-3 h-3" />
            <span>সদস্যপদ যাচাইকৃত</span>
          </div>
        </div>

        {/* Blocked Alert Banner if blocked */}
        {isBlocked && (
          <div className="px-3.5 py-2 bg-[#FFDAD6]/60 text-xs text-[#BA1A1A] flex items-center justify-between border-b border-[#BA1A1A]/20 shrink-0">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>আপনি এই ব্যবহারকারীকে ব্লক করেছেন।</span>
            </div>
            <button
              onClick={toggleBlockUser}
              className="text-xs font-bold underline cursor-pointer hover:text-[#93000A]"
            >
              আনব্লক করুন
            </button>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
          {/* Conversation Start Verification Notice */}
          <div className="p-3 bg-white/80 rounded-2xl border border-[#E4E6EB]/80 text-center space-y-1 my-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005938] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
              <UserCheck className="w-3 h-3" />
              <span>রক্তের অনুরোধ আইডি: {requestId}</span>
            </div>
            <p className="text-[11px] text-[#5B5F6B] leading-relaxed">
              শুধুমাত্র এই জরুরি রক্তের অনুরোধের নিবন্ধিত ব্যক্তি ও রক্তদাতা এই আলোচনা দেখতে পাচ্ছেন।
            </p>
          </div>

          {messages.map((m) => {
            const isMe = m.isMe || m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[78%] p-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#C41E3A] text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-[#1B1B1F] shadow-xs rounded-tl-none border border-[#E4E6EB]/80'
                  }`}
                >
                  {!isMe && (
                    <span className="text-[10px] font-bold block mb-1 text-[#C41E3A]">
                      {m.senderName || donorName}
                    </span>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                      isMe ? 'text-white/80' : 'text-[#5B5F6B]'
                    }`}
                  >
                    <span>{m.createdAt}</span>
                    {isMe && <CheckCheck className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        {!isBlocked && (
          <div className="px-3 py-2 bg-white/80 border-t border-[#E4E6EB]/60 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                disabled={isSending}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-[#E4E6EB] text-xs font-semibold text-[#1B1B1F] hover:bg-[#FDECEF] hover:text-[#C41E3A] active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E4E6EB] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isBlocked || isSending}
            placeholder={
              isBlocked ? 'ব্যবহারকারী ব্লক থাকায় মেসেজ পাঠানো বন্ধ আছে' : 'বার্তা লিখুন...'
            }
            className="flex-1 h-11 px-3.5 bg-[#F7F7F9] rounded-xl text-xs text-[#1B1B1F] outline-none focus:ring-2 focus:ring-[#C41E3A]/40 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleSend()}
            disabled={isBlocked || isSending || !inputVal.trim()}
            className="w-11 h-11 rounded-xl bg-[#C41E3A] hover:bg-[#A3182F] text-white flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
