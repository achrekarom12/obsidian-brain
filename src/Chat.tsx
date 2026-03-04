import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { BrainSettings } from './settings';
import { createBrainAgent } from './agent';
import { getLogger } from './logger';
import { Notice } from 'obsidian';



interface ChatProps {
    settings: BrainSettings;
}

export const Chat = ({ settings }: ChatProps) => {
    const [messages, setMessages] = useState<{ id: string, role: 'user' | 'assistant', content: string, isError?: boolean }[]>([]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const logger = getLogger();
        await logger.log("User sent message:", input);

        const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg = { id: aiMsgId, role: 'assistant' as const, content: '' };
        setMessages(prev => [...prev, aiMsg]);

        try {
            const agent = createBrainAgent(settings);
            logger.log("Agent created", { agent });
            // const result = await agent.stream(input);
            const result = await agent.generate(input);

            let fullContent = '';
            // for await (const chunk of result.textStream) {
            //     logger.log(`Agent chunk received: ${chunk}`);
            //     fullContent += chunk;
            // }
            await logger.log(`Agent response: ${result.response}`);

            setMessages(prev => prev.map(msg =>
                msg.id === aiMsgId ? { ...msg, content: fullContent } : msg
            ));

            await logger.log("Agent response finished", { length: fullContent.length });

        } catch (error) {
            await logger.error("Mastra Agent Error:", error);
            const errMsg = error instanceof Error ? error.message : "An unknown error occurred";
            new Notice("Brain ERROR: " + errMsg, 5000);
            setMessages(prev => prev.map(msg =>
                msg.id === aiMsgId ? { ...msg, content: `Error: ${errMsg}. Please check your settings and AI provider keys.`, isError: true } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="brain-chat-container">
            <div className="brain-chat-history" ref={scrollRef}>
                {messages.map((m) => (
                    <div key={m.id} className={`brain-chat-msg-wrap ${m.role === 'user' ? 'user' : 'ai'} ${m.isError ? 'error' : ''}`}>
                        <div className="brain-chat-msg-text">
                            {m.isError ? (
                                <div className="error-content">
                                    <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>⚠️ Error</span>
                                    {m.content}
                                </div>
                            ) : m.content}
                        </div>
                    </div>

                ))}

                {isLoading && messages[messages.length - 1]?.content === '' && (
                    <div className="brain-chat-msg-wrap ai">
                        <div className="brain-chat-msg-text">...</div>
                    </div>
                )}
            </div>

            <div className="brain-chat-input-container">
                <input
                    className="brain-chat-input"
                    value={input}
                    placeholder="Type to chat..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            void handleSend();
                        }
                    }}
                    disabled={isLoading}
                />
                <button
                    className="brain-chat-send-btn"
                    onClick={() => { void handleSend(); }}
                    disabled={isLoading}
                >
                    {isLoading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
};
