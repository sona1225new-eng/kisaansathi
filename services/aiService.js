const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a message",
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const result = await model.generateContent(message);

        const response = result.response.text();

        return res.status(200).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error("Gemini API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get response from Gemini",
            error: error.message,
        });
    }
};

module.exports = {
    chatWithAI,
};