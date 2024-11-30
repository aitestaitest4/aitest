const { VertexAI } = require("@google-cloud/vertexai");
const { Storage } = require("@google-cloud/storage");
const { createResponse } = require("../services/responseService");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const vertex_ai = new VertexAI({
  project: "oxygreen",
  location: "us-central1",
});

const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: "gemini-1.5-flash-002",
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

const ensureTempUploadsDir = () => {
  const tempDir = path.join(__dirname, "temp-uploads");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

const analyzeVideo = async (req, res) => {
  try {
    const { videoBuffer, prompt } = req.body;

    if (!videoBuffer || !prompt) {
      return res
        .status(400)
        .json(
          createResponse(400, null, "Video buffer and prompt are required")
        );
    }

    // Set up Google Cloud Storage
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      return res
        .status(500)
        .json(createResponse(500, null, "GCS bucket name is not configured."));
    }

    // Generate unique filename and paths
    const uniqueFilename = `${crypto.randomBytes(16).toString("hex")}.mp4`;
    const tempDir = ensureTempUploadsDir();
    const tempFilePath = path.join(tempDir, `temp-${uniqueFilename}`);
    const gcsFilename = `uploads/${uniqueFilename}`;

    // Save video buffer to temp file
    fs.writeFileSync(tempFilePath, videoBuffer);

    // Upload to GCS
    const file = storage.bucket(bucketName).file(gcsFilename);
    await file.save(fs.readFileSync(tempFilePath), {
      metadata: {
        contentType: "video/mp4",
      },
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    const gcsUri = `gs://${bucketName}/${gcsFilename}`;

    const request = {
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: gcsUri,
                mimeType: "video/mp4",
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(request);

    let aggregatedResponse = "";
    for await (const item of streamingResp.stream) {
      aggregatedResponse += item;
    }

    const responseContent = await streamingResp.response;

    return res.status(200).json(
      createResponse(
        200,
        {
          analysis: responseContent,
        },
        "Video analysis successful"
      )
    );
  } catch (error) {
    console.error("Error in video analysis:", error);
    return res
      .status(500)
      .json(
        createResponse(500, null, "Error analyzing video: " + error.message)
      );
  }
};

module.exports = {
  analyzeVideo,
};
