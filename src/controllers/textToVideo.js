const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Text to Video controller
const textToVideo = async (req, res) => {
  try {
    const { prompt } = req.body;
    let apiKey = process.env.HAILAUO_AI_API_KEY;
    let GroupId = process.env.HAILAO_GROUP_ID;

    // Submit video generation task
    const taskId = await invokeVideoGeneration(prompt, apiKey);

    console.log(taskId);

    // Poll for completion
    const { fileId, status } = await pollVideoGeneration(taskId, apiKey);

    console.log(fileId, status);

    if (status !== "Success" || !fileId) {
      return res.status(400).json({
        success: false,
        message: "Video generation failed",
      });
    }

    // Get video download URL
    const videoUrl = await fetchVideoResult(fileId, GroupId, apiKey);

    console.log(videoUrl);

    return res.status(200).json({
      success: true,
      message: "Video generated successfully",
      data: {
        videoUrl,
      },
    });
  } catch (error) {
    console.error("Error in textToVideo:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating video",
      error: error.message,
    });
  }
};

// Helper function to invoke video generation
async function invokeVideoGeneration(prompt, apiKey) {
  const response = await axios.post(
    "https://api.minimaxi.chat/v1/video_generation",
    {
      model: "video-01",
      prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`, // Added Bearer prefix
        "Content-Type": "application/json",
      },
    }
  );
  console.log(response);

  return response.data.task_id;
}

// Helper function to poll video generation status
async function pollVideoGeneration(taskId, apiKey) {
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes maximum polling time

  while (attempts < maxAttempts) {
    const response = await axios.get(
      `https://api.minimaxi.chat/v1/query/video_generation?task_id=${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`, // Added Bearer prefix
        },
      }
    );

    const { status, file_id } = response.data;

    if (status === "Success") {
      return { fileId: file_id, status };
    }

    if (status === "Fail" || status === "Unknown") {
      return { fileId: null, status };
    }

    // If still processing, wait and try again
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
    attempts++;
  }

  return { fileId: null, status: "Timeout" };
}

// Helper function to get video download URL
async function fetchVideoResult(fileId, GroupId, apiKey) {
  const response = await axios.get(
    `https://api.minimaxi.chat/v1/files/retrieve?GroupId=${GroupId}&file_id=${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`, // Added Bearer prefix
        authority: "api.minimaxi.chat",
      },
    }
  );

  return response.data.file.download_url;
}

module.exports = {
  textToVideo,
};
