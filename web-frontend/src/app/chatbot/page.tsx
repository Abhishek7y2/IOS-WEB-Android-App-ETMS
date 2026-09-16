import React from 'react';
import dynamic from 'next/dynamic';

const ChatLayout = dynamic(
  () => import('../../components/chatbot/ChatLayout').then((mod) => mod.ChatLayout),
  { loading: () => <div className="p-4 flex items-center justify-center h-full">Loading AI Assistant...</div> }
);
export const metadata = {
  title: 'AI Assistant | Employee Task Manager',
};

export default function ChatbotPage() {
  return (
    <React.Suspense fallback={<div className="p-4 flex items-center justify-center h-full">Loading AI Assistant...</div>}>
      <ChatLayout />
    </React.Suspense>
  );
}
