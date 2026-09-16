import { useState } from "react";

function AIChat() {
    const [userMessage, setUserMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!userMessage.trim() || loading) return;

        const message = userMessage.trim();

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: message,
            },
        ]);

        setUserMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    text: data.response,
                },
            ]);
        } catch (error) {
            console.error("AI Chat Error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    text: "Sorry, I could not connect to the AI. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-green-600 text-white p-4">
                <h2 className="text-xl font-bold">🌾 Kisaan Saathi AI</h2>
                <p className="text-sm opacity-90">
                    Ask me anything about farming
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-lg">👋 Namaste!</p>
                        <p className="text-sm mt-2">
                            Ask me about crops, diseases, weather, fertilizers or farming.
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === "user"
                                    ? "bg-green-600 text-white rounded-br-sm"
                                    : "bg-white text-gray-800 shadow rounded-bl-sm"
                                }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl shadow">
                            Thinking... 🤖
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-white border-t flex gap-2">
                <input
                    type="text"
                    value={userMessage}
                    onChange={(event) => setUserMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your farming question..."
                    className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                    onClick={sendMessage}
                    disabled={loading || !userMessage.trim()}
                    className="bg-green-600 text-white px-5 rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default AIChat;