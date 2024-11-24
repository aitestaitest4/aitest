const multer = require("multer");
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const axios = require("axios");

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_API_KEY);

exports.processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const imageBuffer = req.file.buffer;

    const request = {
      user_app_id: {
        user_id: process.env.CLARIFAI_USER_ID,
        app_id: process.env.CLARIFAI_APP_ID,
      },
      model_id: "general-image-recognition", // Add model ID
      inputs: [
        {
          data: {
            image: {
              base64: imageBuffer.toString("base64"),
            },
          },
        },
      ],
    };

    const response = await new Promise((resolve, reject) => {
      stub.PostModelOutputs(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    if (response.status.code !== 10000) {
      throw new Error(response.status.description);
    }

    const concepts = response.outputs[0].data.concepts.map((concept) => ({
      name: concept.name,
      value: concept.value,
    }));

    // Make request to Grok API with the concepts
    const grokResponse = await axios.post(
      `${process.env.XAI_BASE_URL}/v1/chat/completions`,
      {
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that analyzes image concepts.",
          },
          {
            role: "user",
            content: `Please analyze these image concepts: ${JSON.stringify(
              concepts
            )}`,
          },
        ],
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

    return res.json({
      status: 200,
      data: {
        concepts,
        analysis: grokResponse.data.choices[0].message.content,
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({
      error: "Failed to process image",
      details: error.message,
    });
  }
};

exports.describeImage = async (req, res) => {
  try {
    const fileLink = req.fileLink;

    const image_url = fileLink;

    console.log(image_url);

    // Create FormData and append image URL
    const formData = new FormData();
    formData.append("image_url", image_url);

    // Make request to Picsart API
    const response = await axios.post(
      "https://api.picsart.io/tools/1.0/describe",
      formData,
      {
        headers: {
          "X-Picsart-API-Key": process.env.PICSART_API_KEY,
          Accept: "application/json",
        },
      }
    );

    return res.json({
      status: 200,
      data: response.data,
    });
  } catch (error) {
    console.error("Error describing image:", error);
    return res.status(500).json({
      error: "Failed to describe image",
      details: error.message,
    });
  }
};
