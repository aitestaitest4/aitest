const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const youtubedl = require("youtube-dl-exec");

exports.extractChapter = async (req, res) => {
  try {
    const { videoLink } = req.body;
    const pythonPath = "/usr/lib/python3.9";
    youtubedl(videoLink, {
      output: "video.mp4",
      pythonPath: pythonPath,
      // additional options can be specified here
    })
      .then((output) => {
        console.log("Video downloaded:", output);
      })
      .catch((err) => {
        console.error("Error downloading video:", err);
      });

    if (!videoLink) {
      return res.status(400).json({ error: "Video link is required." });
    }

    // Fetch video details using youtube-dl-exec with specified Python version
    const videoInfo = await youtubedl(videoLink, {
      dumpSingleJson: true,
      noWarnings: true,
      defaultSearch: "ytsearch",
      //   pythonPath: "/usr/bin/python3.9", // Specify Python 3.9 path
    });

    // Log video information to console
    console.log("Video Information:", videoInfo);

    const requestData = {
      anthropic_version: "vertex-2023-10-16",
      stream: false,
      max_tokens: 4096,
      temperature: 0.5,
      top_p: 0.95,
      top_k: 1,
      messages: [
        {
          role: "user",
          content: `Please extract chapters from the following YouTube video and present them in a pointwise format: ${videoLink}`,
        },
      ],
    };

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const accessToken = await auth.getAccessToken();

    const ENDPOINT = "us-east5-aiplatform.googleapis.com";
    const LOCATION_ID = "us-east5";
    const PROJECT_ID = "oxygreen";
    const MODEL_ID = "claude-3-5-sonnet-v2";
    const METHOD = "rawPredict";

    const url = `https://${ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/anthropic/models/${MODEL_ID}:${METHOD}`;

    const maxRetries = 3;
    let attempt = 0;
    let response;

    while (attempt < maxRetries) {
      try {
        response = await axios.post(url, requestData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        });
        break; // Exit loop if request is successful
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers["retry-after"] || 2; // Default to 2 seconds if not specified
          console.log(
            `Rate limit exceeded. Retrying after ${retryAfter} seconds...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          attempt++;
        } else if (
          error.stderr &&
          error.stderr.includes(
            "ImportError: You are using an unsupported version of Python"
          )
        ) {
          console.error(
            "Unsupported Python version. Please ensure Python 3.9 or higher is installed."
          );
          return res.status(500).json({
            error:
              "Internal server error: Unsupported Python version. Please contact the administrator.",
          });
        } else {
          throw error; // Rethrow if not a handled error
        }
      }
    }

    if (!response) {
      return res
        .status(500)
        .json({ error: "Failed to get a response after retries." });
    }

    // Format the chapters into a pointwise list
    const chapters = response.data; // Adjust this line based on actual response structure
    const formattedChapters = chapters.map((chapter, index) => ({
      chapterNumber: index + 1,
      title: chapter.title || `Chapter ${index + 1}`,
      description: chapter.description || "No description available.",
    }));

    res.status(200).json({ chapters: formattedChapters });
  } catch (error) {
    console.error("Error extracting chapters:", error);
    res.status(500).json({
      error: error.message || "Failed to extract chapters from video.",
    });
  }
};
