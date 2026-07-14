import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import type { RootState } from '@/store';
import { useChat } from './hooks/useChat';
import { Icon } from '@/ui/icon';
import { PageHeader } from '@/ui/common';

const ChatPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentTrip = useSelector((state: RootState) => state.trips.selectedTrip);
  const currentUserId = currentUser?._id;

  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, error, sendMessage } = useChat(tripId || '');

  // Scroll to bottom on load/receive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Icon name="loader" className="animate-spin text-emerald-600 mb-2" size={32} />
        <span className="text-sm text-gray-500 font-medium">Loading chat history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 inline-flex flex-col items-center">
          <Icon name="alertTriangle" className="text-red-500 mb-2" size={24} />
          <h3 className="font-semibold text-base">Unable to load chat</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100%-1.5rem)] flex flex-col">

      <PageHeader
        title="Trip Chat"
        subtitle={
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
            <span>{`Group chat with ${currentTrip?.members?.length || currentTrip?.membersCount || 1} members`}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected
            </span>
          </div>
        }
      />

      {/* Chat Box container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Message Feeds Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="p-4 bg-emerald-50/50 rounded-full text-emerald-500 mb-3 border border-emerald-100">
                <Icon name="messageSquare" size={28} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">No messages yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Start the conversation! Say hello to your travel companions.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender?._id?.toString() === currentUserId?.toString();
              const formattedTime = format(new Date(message.createdAt), 'p');


              return (
                <div
                  key={message._id}
                  className={`flex items-start space-x-3 max-w-[80%] ${isOwnMessage ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
                    }`}
                >
                  {/* Avatar */}
                  {message.sender?.profilePicUrl ? (
                    <img
                      src={message.sender.profilePicUrl}
                      alt={message.sender?.username || 'User'}
                      className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
                      {(message.sender?.username || 'F').substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div className="flex flex-col">
                    {/* Sender username and timestamp */}
                    <div
                      className={`flex items-center space-x-2 mb-1 text-[11px] text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <span className="font-semibold text-gray-700">
                        {isOwnMessage ? 'You' : message.sender?.username || 'Former Member'}
                      </span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>

                    {/* Content Bubble */}
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isOwnMessage
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none'
                        : 'bg-white border border-gray-200/80 text-gray-800 rounded-2xl rounded-tl-none'
                        }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="relative flex items-end border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-200 p-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message... (Enter to send)"
              maxLength={2000}
              rows={2}
              className="flex-1 resize-none border-0 outline-none focus:ring-0 p-2 text-sm text-gray-800 max-h-24 scrollbar-thin"
            />

            {/* Character counter */}
            {text.length >= 1800 && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                {2000 - text.length} chars remaining
              </span>
            )}

            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-sm ml-2 flex-shrink-0"
              title="Send Message"
            >
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
