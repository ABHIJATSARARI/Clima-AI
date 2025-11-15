import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AiToolStatus } from '../types';
import { PaperAirplaneIcon } from './icons/AppIcons';

// Simple Markdown to HTML Renderer
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    // This simple renderer handles bold (**text**) and bullet points (* item)
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>') // List items
        .replace(/<\/li>\n<li/g, '</li><li'); // Fix spacing between list items

    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex-shrink-0"></div>
            )}
            <div
                className={`max-w-md p-3 rounded-2xl ${
                    isUser
                        ? 'bg-green-600 text-white rounded-br-lg'
                        : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-lg border border-slate-200 dark:border-slate-600'
                }`}
            >
                <MarkdownRenderer text={message.text} />
            </div>
        </div>
    );
};


interface ChatViewProps {
    history: ChatMessage[];
    onSendMessage: (message: string) => void;
    aiStatus: string; // Can be 'idle', 'thinking', or a tool status message
}

const ChatView: React.FC<ChatViewProps> = ({ history, onSendMessage, aiStatus }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, aiStatus]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const isTyping = aiStatus !== 'idle';

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isTyping) {
            handleSend();
        }
    };

    return (
        <div className="h-[calc(100vh-170px)] flex flex-col animate-fade-in">
             <div className="mb-4">
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">AI Climate Assistant</h2>
                <p className="text-gray-600 dark:text-slate-300">
                    Ask me to check the weather, summarize your reports, or answer climate questions.
                </p>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                {history.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-slate-400 pt-8">
                        <p>No messages yet. Start the conversation!</p>
                        <p className="text-xs mt-2">e.g., "What's the weather like?" or "Summarize my flood risk plan."</p>
                    </div>
                )}
                {history.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {isTyping && (
                    <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex-shrink-0"></div>
                         <div className="max-w-md p-3 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                            {aiStatus.startsWith('Using tool:') ? (
                                <p className="text-xs text-slate-500 dark:text-slate-300 font-medium italic">{aiStatus}</p>
                            ) : (
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                    <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={isTyping}
                    className="flex-grow p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition bg-white dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="bg-green-600 text-white p-4 rounded-xl shadow-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

export default ChatView;