const { VertexAI } = require("@google-cloud/vertexai");
const { Storage } = require("@google-cloud/storage");
const { createResponse } = require("../services/responseService");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

const model = "gemini-1.5-flash-002";

const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95,
  },
  safetySettings: [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
  ],
});

exports.generateBlogPost = async (req, res) => {
  try {
    const prompt = req.body.prompt || "Generate a blog post about the image";
    const fileLink = req.file;

    console.log(fileLink);

    if (!fileLink) {
      return res
        .status(400)
        .json(createResponse(400, null, "Image file is required."));
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

    // Generate unique filename
    const uniqueFilename = `${crypto.randomBytes(16).toString("hex")}.${
      fileLink.mimetype.split("/")[1]
    }`;
    const gcsFilename = `uploads/${uniqueFilename}`;

    // Upload file to GCS
    const bucket = storage.bucket(bucketName);
    const gcsFile = bucket.file(gcsFilename);

    await gcsFile.save(fileLink.buffer, {
      metadata: {
        contentType: fileLink.mimetype,
      },
    });

    // Get public URL
    const imageUrl = `gs://${bucketName}/${gcsFilename}`;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFilename}`;

    const image = {
      fileData: {
        mimeType: fileLink.mimetype,
        fileUri: imageUrl,
      },
    };

    const text = { text: prompt };

    const reqContent = {
      contents: [{ role: "user", parts: [image, text] }],
    };

    const streamingResp = await generativeModel.generateContentStream(
      reqContent
    );

    console.log(streamingResp);

    let aggregatedResponse = "";
    for await (const item of streamingResp.stream) {
      if (item && typeof item.text === "function") {
        aggregatedResponse += item.text();
      } else {
        aggregatedResponse += item?.toString() || "";
      }
    }

    const responseContent = await streamingResp.response;
    const blogPost = responseContent.candidates[0].content.parts[0].text;

    return res
      .status(200)
      .json(
        createResponse(
          200,
          { blogPost, imageUrl: publicUrl },
          "Blog post generated successfully."
        )
      );
  } catch (error) {
    console.error("Error generating blog post:", error);
    return res
      .status(500)
      .json(createResponse(500, null, "Failed to generate blog post."));
  }
};
