const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const { createResponse } = require("../services/responseService");

exports.convertTextToAudio = async (req, res) => {
  try {
    const { text, format, languageType } = req.body.input;
    if (!text) {
      return res
        .status(400)
        .json(createResponse(400, null, "No text provided for synthesis."));
    }

    // Initialize client with credentials from environment variable
    const client = new TextToSpeechClient({
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    let voiceConfig;
    if (languageType === "english-male") {
      voiceConfig = { languageCode: "en-IN", name: "en-IN-Journey-D" };
    } else if (languageType === "female-english") {
      voiceConfig = { languageCode: "en-IN", name: "en-IN-Standard-A" };
    } else if (languageType === "female-marathi") {
      voiceConfig = { languageCode: "mr-IN", name: "mr-IN-Standard-A" };
    } else if (languageType === "male-marathi") {
      voiceConfig = { languageCode: "mr-IN", name: "mr-IN-Wavenet-B" };
    } else {
      // Default voice configuration
      voiceConfig = { languageCode: "en-IN", name: "en-IN-Standard-A" };
    }

    const synthesisRequest = {
      input: { text: text },
      voice: voiceConfig,
      audioConfig: { audioEncoding: format === "mp3" ? "MP3" : "LINEAR16" },
    };

    const [response] = await client.synthesizeSpeech(synthesisRequest);
    const audioContent = response.audioContent;

    if (!audioContent) {
      return res
        .status(500)
        .json(createResponse(500, null, "Audio synthesis failed."));
    }

    // Encode the audio content to base64
    const audioBase64 = audioContent.toString("base64");

    const mimeType = format === "mp3" ? "audio/mpeg" : "audio/wav";

    // Return the base64 audio in a JSON response
    return res.json(
      createResponse(
        200,
        { audio: audioBase64, mimeType },
        "Audio synthesis successful."
      )
    );
  } catch (error) {
    console.error("Error in convertTextToAudio:", error);
    return res
      .status(500)
      .json(createResponse(500, null, "Internal server error."));
  }
};
