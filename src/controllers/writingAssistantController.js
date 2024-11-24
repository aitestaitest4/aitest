const { VertexAI } = require("@google-cloud/vertexai");
// const { google } = require("googleapis");

// const auth = new google.auth.GoogleAuth({
//   scopes: ["https://www.googleapis.com/auth/cloud-platform"],
// });

const vertex_ai = new VertexAI({
  project: "oxygreen",
  location: "us-central1",
});
const model = "gemini-1.5-flash-002";

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0,
    topP: 0.95,
  },
  safetySettings: [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
  ],
  tools: [
    {
      googleSearchRetrieval: {},
    },
  ],
});

const fetch = require("node-fetch");

exports.generatePresentation = async (req, res) => {
  try {
    const { instructions } = req.body;
    // const fileLink = req.fileLink;

    // console.log("fileLink", fileLink);

    if (!instructions) {
      return res.status(400).json({ error: "Instructions are required." });
    }

    // if (!fileLink) {
    //   return res.status(400).json({ error: "File link is required." });
    // }

    // Fetch the file from the provided link
    // const response = await fetch(fileLink);
    // if (!response.ok) {
    //   throw new Error("Failed to fetch the file from the provided link.");
    // }

    // const buffer = await response.buffer();
    // const base64Data = buffer.toString("base64");

    // const mimeType = response.headers.get("content-type") || "application/pdf";

    // const document1 = {
    //   inlineData: {
    //     mimeType: "application/pdf",
    //     data: base64Data,
    //   },
    // };

    const text1 = {
      text: instructions,
    };

    const reqContent = {
      contents: [{ role: "user", parts: [text1] }],
    };

    const streamingResp = await generativeModel.generateContentStream(
      reqContent
    );

    let aggregatedResponse = "";

    for await (const item of streamingResp.stream) {
      aggregatedResponse += item;
    }

    const responseContent = await streamingResp.response;

    res.status(200).json({ presentation: responseContent });
  } catch (error) {
    console.error("Error generating presentation:", error);
    res.status(500).json({ error: "Failed to generate presentation." });
  }
};
