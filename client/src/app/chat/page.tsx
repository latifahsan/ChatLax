'use client';

export default function ChatIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0e0e0e] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#111] border border-[#2a2a2a] flex items-center justify-center mb-5 shadow-elevated">
        <svg className="w-7 h-7 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-[15px] font-semibold text-[#444] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Select a conversation
      </h2>
      <p className="text-[12px] text-[#333] max-w-xs leading-relaxed">
        Choose an existing chat from the sidebar, or start a new one.
      </p>
    </div>
  );
}
