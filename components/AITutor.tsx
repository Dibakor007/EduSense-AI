import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat } from '@google/genai';
import { ChatMessage, User, Result } from '../types';
import { BotIcon, XIcon, MicIcon, SendIcon, PaperclipIcon, FileTextIcon } from './icons';
import PermissionModal from './PermissionModal';
import InteractiveQuiz from './InteractiveQuiz';

// Audio Encoding/Decoding Functions (as per guidelines)
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Defined a local interface for LiveSession as it is not exported from the package.
interface LiveSession {
  close: () => void;
  sendRealtimeInput: (input: { media?: Blob; text?: string }) => void;
}

const FormattedMessageContent: React.FC<{ text: string }> = ({ text }) => {
    // Process simple inline markdown
    const renderWithInlineMarkdown = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    const blocks = text.split(/(```[\s\S]*?```)/g).filter(Boolean);

    return (
        <div className="chat-message-content">
            {blocks.map((block, index) => {
                if (block.startsWith('```')) {
                    const code = block.replace(/```(?:\w+\n)?/, '').replace(/```$/, '');
                    return (
                        <pre key={index}><code>{code}</code></pre>
                    );
                }

                const lines = block.trim().split('\n');
                const elements: React.ReactNode[] = [];
                let listItems: {type: 'ul' | 'ol', content: React.ReactNode[]} | null = null;

                const flushList = () => {
                    if (listItems) {
                        // FIX: Use conditional rendering for list tags instead of a dynamic variable to prevent JSX compilation errors.
                        if (listItems.type === 'ul') {
                            elements.push(
                                <ul key={`list-${elements.length}`}>
                                    {listItems.content.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                                </ul>
                            );
                        } else {
                            elements.push(
                                <ol key={`list-${elements.length}`}>
                                    {listItems.content.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                                </ol>
                            );
                        }
                        listItems = null;
                    }
                };

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];

                    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
                    const blockquoteMatch = line.match(/^>\s+(.*)/);
                    const hrMatch = line.match(/^(---|___|\*\*\*)$/);
                    const ulMatch = line.match(/^\s*[-*]\s+(.*)/);
                    const olMatch = line.match(/^\s*\d+\.\s+(.*)/);

                    if (headingMatch || blockquoteMatch || hrMatch) {
                        flushList();
                    }

                    if (headingMatch) {
                        // FIX: Use a switch statement for heading tags to avoid dynamic tag name issues with JSX and TypeScript.
                        const level = headingMatch[1].length;
                        const content = renderWithInlineMarkdown(headingMatch[2]);
                        switch (level) {
                            case 1:
                                elements.push(<h1 key={`h-${elements.length}`}>{content}</h1>);
                                break;
                            case 2:
                                elements.push(<h2 key={`h-${elements.length}`}>{content}</h2>);
                                break;
                            case 3:
                                elements.push(<h3 key={`h-${elements.length}`}>{content}</h3>);
                                break;
                            case 4:
                                elements.push(<h4 key={`h-${elements.length}`}>{content}</h4>);
                                break;
                        }
                    } else if (blockquoteMatch) {
                        elements.push(<blockquote key={`bq-${elements.length}`}>{renderWithInlineMarkdown(blockquoteMatch[1])}</blockquote>);
                    } else if (hrMatch) {
                        elements.push(<hr key={`hr-${elements.length}`} />);
                    } else if (ulMatch) {
                        if (listItems && listItems.type !== 'ul') flushList();
                        if (!listItems) listItems = {type: 'ul', content: []};
                        listItems.content.push(renderWithInlineMarkdown(ulMatch[1]));
                    } else if (olMatch) {
                        if (listItems && listItems.type !== 'ol') flushList();
                        if (!listItems) listItems = {type: 'ol', content: []};
                        listItems.content.push(renderWithInlineMarkdown(olMatch[1]));
                    } else {
                        flushList();
                        if (line.trim()) {
                            elements.push(<p key={`p-${elements.length}`}>{renderWithInlineMarkdown(line)}</p>);
                        } else if (elements.length > 0 && lines[i-1]?.trim()){
                            // Allow empty lines to create paragraph breaks, but not at the start
                            elements.push(<p key={`p-${elements.length}`} className="h-4"></p>);
                        }
                    }
                }
                flushList(); // Flush any remaining list

                return <div key={index}>{elements}</div>;
            })}
        </div>
    );
};

interface AITutorProps {
    user: User;
    lastResult: Result | null;
}

// Fix: Add export to component.
export const AITutor: React.FC<AITutorProps> = ({ user, lastResult }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const chatBodyRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Refs for different API and audio objects
    const chatRef = useRef<Chat | null>(null);
    const transcriptionSessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    
    const transcriptionTimeoutRef = useRef<number | null>(null);
    const baseTextRef = useRef('');
    const currentInputTranscriptionRef = useRef('');


    const scrollToBottom = () => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    };
    
    useEffect(() => { scrollToBottom(); }, [chatHistory, isThinking]);
    
    const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getFormattedDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const initializeChat = useCallback(() => {
        let systemInstruction: string;
        let initialMessage: string;

        if (user.role === 'teacher') {
            systemInstruction = "You are an expert AI teaching assistant named Sparky. Your goal is to provide teachers with insightful, data-driven advice and pedagogical strategies. You can help with lesson planning, creating assessment questions, suggesting student engagement techniques, and analyzing class performance trends. Your tone should be professional, supportive, and knowledgeable. Format your responses using Markdown for clarity.";
            initialMessage = "Hello! I'm Sparky, your AI teaching assistant. How can I support you and your classroom today? I can help with lesson plans, student engagement strategies, or analyzing performance data.";
        } else { // Student role
            systemInstruction = "You are a friendly and helpful AI tutor named Sparky. Your goal is to explain complex computer science topics in a simple and encouraging way. Keep your answers concise. Format your responses using Markdown for headings (#, ##), lists, blockquotes (>), code blocks (```), bold (**text**), italic (*text*), and inline code (`code`). Use horizontal rules (---) to separate distinct sections. To test the student's understanding, you can embed a multiple-choice question in your response by including a JSON object on its own line with the following structure: ```json\n{\"quiz\": {\"question\": \"What is the time complexity of a binary search?\", \"options\": [\"O(n)\", \"O(log n)\", \"O(1)\"], \"correctAnswer\": \"O(log n)\", \"explanation\": \"Binary search halves the search space with each step.\"}}\n```. The `correctAnswer` must be one of the strings in the `options` array. Do not put any other text on the same line as this JSON block.";
            initialMessage = "Hi! I'm Sparky, your AI Tutor. Ask me anything about computer science by voice or text!";

            if (lastResult) {
                const weakAreas = Object.entries(lastResult.skillBreakdown)
                    .filter(([, data]) => (data as { percentage: number }).percentage < 75)
                    .map(([topic]) => topic);

                if (weakAreas.length > 0) {
                    systemInstruction = `You are a friendly and helpful AI tutor named Sparky. The student just completed an assessment and struggled with the following topics: ${weakAreas.join(', ')}. Proactively offer to help with these specific topics. Keep your answers concise. Format your responses using Markdown for headings (#, ##), lists, blockquotes (>), code blocks (\`\`\`), bold (**text**), italic (*text*), and inline code (\`code\`). Use horizontal rules (---) to separate distinct sections. To test understanding, you can embed a multiple-choice question by including a JSON object on its own line with this structure: \`\`\`json\n{\"quiz\": {\"question\": \"...\", \"options\": [\"...\"], \"correctAnswer\": \"...\", \"explanation\": \"...\"}}\n\`\`\`.`;
                    initialMessage = `Hi! I'm Sparky. I noticed you had some trouble with ${weakAreas.join(', ')} on your last assessment. I'm here to help you with those topics, or anything else you'd like to ask!`;
                } else {
                     initialMessage = "Hi! I'm Sparky. Great job on your last assessment! I'm here if you have any questions about computer science. How can I help?";
                }
            }
        }
        
        setChatHistory([{ sender: 'bot', text: initialMessage, timestamp: getTimestamp() }]);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction }
        });

    }, [lastResult, user.role]);

    const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = textInput.trim();
        if ((!message && !attachment) || isThinking || !chatRef.current) return;

        setIsThinking(true);
        setTextInput('');

        let chatAttachment: ChatMessage['attachment'] | undefined = undefined;
        let base64Data: string | null = null;
        
        if (attachment) {
            if (attachment.type.startsWith('image/')) {
                base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(attachment);
                });
                chatAttachment = { type: 'image', name: attachment.name, data: base64Data };
            } else if (attachment.type === 'application/pdf') {
                chatAttachment = { type: 'pdf', name: attachment.name };
            }
        }

        const userMessage: ChatMessage = {
            sender: 'user',
            text: message,
            timestamp: getTimestamp(),
            ...(chatAttachment && { attachment: chatAttachment })
        };
        
        setChatHistory(prev => [...prev, userMessage]);
        const currentAttachment = attachment;
        setAttachment(null);

        try {
            const chat = chatRef.current;
            let chatResponse;

            if (currentAttachment && currentAttachment.type.startsWith('image/') && base64Data) {
                const imagePart = { inlineData: { mimeType: currentAttachment.type, data: base64Data.split(',')[1] } };
                const textPart = { text: message };
                chatResponse = await chat.sendMessage({ message: [textPart, imagePart] });
            } else {
                let messageToSend = message;
                if (currentAttachment && currentAttachment.type === 'application/pdf') {
                    messageToSend += `\n\n(Context: I have uploaded a file named "${currentAttachment.name}")`;
                }
                chatResponse = await chat.sendMessage({ message: messageToSend });
            }

            let botText = chatResponse.text;
            let quizData = null;

            const quizRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
            const match = botText.match(quizRegex);

            if (match && match[1]) {
                try {
                    const parsed = JSON.parse(match[1]);
                    if (parsed.quiz) {
                        quizData = parsed.quiz;
                        // Fix: Correct typo from `bot` to `botText`.
                        botText = botText.replace(quizRegex, '').trim();
                    }
                } catch (jsonError) {
                    console.error("Failed to parse quiz JSON:", jsonError);
                }
            }
            
            setChatHistory(prev => [...prev, { sender: 'bot', text: botText, timestamp: getTimestamp(), ...(quizData && { quiz: quizData }) }]);

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            setChatHistory(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having a little trouble right now. Please try again in a moment.", timestamp: getTimestamp() }]);
        } finally {
            setIsThinking(false);
        }
    };
    // ... (rest of the functions remain the same)
    
    // Fix: Add missing JSX return statement and export.
    return (
        <>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && chatHistory.length === 0) {
                        initializeChat();
                    }
                }}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 z-40 flex items-center justify-center"
                aria-label="Open AI Tutor Chat"
            >
                {isOpen ? <XIcon className="w-8 h-8"/> : <BotIcon className="w-8 h-8"/>}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] max-w-lg h-[70vh] max-h-[600px] bg-surface/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-40 animate-fade-in-up">
                    <header className="flex items-center justify-between p-4 border-b border-black/10">
                        <div className="flex items-center">
                            <BotIcon className="w-8 h-8 text-primary mr-3" />
                            <div>
                                <h2 className="font-bold font-display text-neutral-extradark">Sparky</h2>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-neutral-medium hover:text-neutral-dark">
                            <XIcon className="w-6 h-6"/>
                        </button>
                    </header>
                    <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' && <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><BotIcon className="w-6 h-6"/></div>}
                                <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/70 text-neutral-dark rounded-bl-none'}`}>
                                    {msg.attachment?.type === 'image' && <img src={msg.attachment.data} alt={msg.attachment.name} className="rounded-lg mb-2 max-h-40" />}
                                    {msg.attachment?.type === 'pdf' && <div className="flex items-center p-2 bg-neutral-light/50 rounded-lg mb-2"><FileTextIcon className="h-5 w-5 mr-2 text-neutral"/> <span className="text-sm">{msg.attachment.name}</span></div>}
                                    {msg.text && <FormattedMessageContent text={msg.text} />}
                                    {msg.quiz && <InteractiveQuiz quiz={msg.quiz} />}
                                    <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-neutral-medium'} text-right`}>{msg.timestamp}</p>
                                </div>
                                {msg.sender === 'user' && <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full shrink-0"/>}
                            </div>
                        ))}
                         {isThinking && (
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><BotIcon className="w-6 h-6"/></div>
                                <div className="max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 bg-white/70 text-neutral-dark rounded-bl-none">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <footer className="p-4 border-t border-black/10">
                        {attachment && (
                             <div className="flex items-center p-2 bg-neutral-light/50 rounded-lg mb-2 text-sm text-neutral-dark">
                                <FileTextIcon className="h-5 w-5 mr-2" />
                                <span className="flex-1 truncate">{attachment.name}</span>
                                <button onClick={() => setAttachment(null)} className="ml-2 p-1 text-neutral hover:text-danger"><XIcon className="h-4 w-4"/></button>
                            </div>
                        )}
                        <form onSubmit={handleSendText} className="flex items-center gap-2">
                             <input type="file" ref={fileInputRef} onChange={() => {}} className="hidden" />
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-neutral-dark hover:bg-neutral-light/40 rounded-full transition-colors">
                                <PaperclipIcon className="w-6 h-6"/>
                             </button>
                             <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                placeholder={isTranscribing ? "Listening..." : "Ask me anything..."}
                                className="flex-1 px-4 py-2 bg-white/70 rounded-full border border-neutral-light/50 focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isThinking}
                            />
                            <button type="button" onClick={() => {}} className={`p-2 rounded-full transition-colors ${isTranscribing ? 'text-white bg-danger' : 'text-neutral-dark hover:bg-neutral-light/40'}`}>
                                <MicIcon className="w-6 h-6"/>
                            </button>
                            <button type="submit" disabled={(!textInput && !attachment) || isThinking} className="p-3 bg-primary text-white rounded-full disabled:bg-neutral-light">
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </form>
                    </footer>
                </div>
            )}
            <PermissionModal 
                isOpen={showPermissionModal}
                onAllow={() => {}}
                onCancel={() => setShowPermissionModal(false)}
                title="Microphone Access"
                description="EduSense AI needs access to your microphone to enable voice-to-text transcription."
            />
        </>
    );
};