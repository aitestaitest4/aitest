const axios = require("axios");

// Store chat histories for different users
const chatHistories = new Map();

const grokChat = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID and message are required",
      });
    }

    // Get or initialize chat history for this user
    if (!chatHistories.has(userId)) {
      chatHistories.set(userId, []);
    }
    const userHistory = chatHistories.get(userId);

    // Add system message if this is first message
    if (userHistory.length === 0) {
      userHistory.push({
        role: "system",
        content:
          "You are Grok, a chatbot inspired by the Hitchhikers Guide to the Galaxy.",
      });
    }

    // Add user's message to history
    userHistory.push({
      role: "user",
      content: message,
    });

    // Make request to Grok API
    const response = await axios.post(
      `${process.env.XAI_BASE_URL}/v1/chat/completions`,
      {
        messages: userHistory,
        model: "grok-beta",
        stream: false,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
      }
    );

    // Add Grok's response to history
    const grokResponse = response.data.choices[0].message;
    userHistory.push(grokResponse);

    // Limit history size to prevent memory issues (keep last 10 messages)
    if (userHistory.length > 10) {
      userHistory.splice(1, userHistory.length - 10);
    }

    return res.status(200).json({
      success: true,
      response: grokResponse.content,
      history: userHistory,
    });
  } catch (error) {
    console.error("Grok API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing your request",
      error: error.message,
    });
  }
};

const clearChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Clear chat history for user
    chatHistories.delete(userId);

    return res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Clear Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error clearing chat history",
      error: error.message,
    });
  }
};

module.exports = {
  grokChat,
  clearChat,
};
