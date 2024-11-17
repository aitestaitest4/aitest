const axios = require("axios");

const texttoImage = async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt,
      width = 512,
      height = 512,
      count = 1,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided." });
    }

    if (!negative_prompt) {
      return res.status(400).json({ error: "No negative prompt provided." });
    }

    const response = await axios.post(
      "https://genai-api.picsart.io/v1/text2image",
      {
        prompt,
        negative_prompt,
        width,
        height,
        count,
      },
      {
        headers: {
          "x-picsart-api-key": process.env.PICSART_API_KEY,
        },
      }
    );

    return res.status(202).json({
      status: 202,
      data: response.data,
    });
  } catch (error) {
    console.error("Error generating image:", error);

    if (error.response) {
      return res.status(error.response.status).json({
        error: "Failed to generate image",
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: "Failed to generate image",
      details: error.message,
    });
  }
};

const getTextToImageResult = async (req, res) => {
  try {
    const { inference_id } = req.params;

    if (!inference_id) {
      return res.status(400).json({ error: "No inference ID provided." });
    }

    const response = await axios.get(
      `https://genai-api.picsart.io/v1/text2image/inferences/${inference_id}`,
      {
        headers: {
          "x-picsart-api-key": process.env.PICSART_API_KEY,
        },
      }
    );

    return res.status(200).json({
      status: 200,
      data: response.data,
    });
  } catch (error) {
    console.error("Error getting image result:", error);

    if (error.response) {
      return res.status(error.response.status).json({
        error: "Failed to get image result",
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: "Failed to get image result",
      details: error.message,
    });
  }
};

module.exports = {
  texttoImage,
  getTextToImageResult,
};
