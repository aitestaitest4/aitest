const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const { createResponse } = require("../services/responseService");

const credentials = {
  type: "service_account",
  project_id: "oxygreen",
  private_key_id: "05446fbafea201af86faab3e9953e0d14dbf2e6b",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDy/CWv2igwao0y\nTxlE2mI/bB/oFuYtirDKDHcG4GSv+ghSbJ5sGM114ffEJ4NTg6XLchK0k3jbTzt0\nUIpaikPdvTXCkfsxvCUsQrr2u//1ifN9PD7oRY1pl68suJvxfxVFEOfUUhIwNtvH\nKrGXHwkP8yuJzjBLVTh7+vNaHEEESAaXLtX+ya/pAXS5HAhUgtf6xPUrvHmx8hSZ\nbe5skw06bDcciHBALq31po0dvq4I69dvv03DYYrj8kv/7SY8GpCXu93XPK/eCK8r\ntSq4Vc3qqcj/Pwj95I2lnR2S2HLGRqnweEiSCPAoJUOmCLy+ECoBHbHKsgLfc8Hp\n+KoJOJ2lAgMBAAECgf8QnCv3WXJl3OLKDZ4slsEglMOZmfciJdjv9uosDirT3MO0\n3rf1q7xf0pKdVhYkH1u2DJY6wdoBI+lsihTrG4iIH+cM5e3F+JaR7/3X4AIfRs7e\nQMAMILUKAtR2uifu2kEZ943hdbrIkPd1JfX93qE/9d+EDBRBEhJKZ107S7MmF6RB\nRXDRL+N9HZ3hEZEhpQevAaLNVMTQzyfdIhGh4RvvlRoXS8qCOyGj6srSVMQIcCOe\nBGKHds7RlIrNnpAoNoqaFUVeJaK8e5Kd+N3V+DLV/EE2/KQ8GqU9hMKkwSxJl923\n21PediTNwR4LfPDgrDS+Qc/x+tr5GaXEJSJa1cMCgYEA/YAAAdktwQBd6kTh7TJM\nQlgKU6WMScI9rXM1ELbR15VBtNQSNgo8/avSPbeDJOD4pIBHhPq+e2R84v1VZ5Hl\nNicA0z1WNUUldUCzjHssjkTN6I3+D98uLe3HyzjjtvWTTHVdWVYMucTJYNmoA+AV\nI4MaL26JC67arDXOwDoQj7MCgYEA9WGZrkhPx8QBFYAk86LGgjR7cSBFF9ie4PYc\nl/+nvAFzGViVNcCX3g6ayD/bLA8Gn9c9PSKeIU3lKOL4yT/EvDu1lkqkmY/XZFgQ\nfHoSzXdIQ+oP3+87yGT54kPLiAABk3CH+o+G/07oAv4JKIvci2FL1yv//zE/jK/i\nOkSisUcCgYAqh3X42WnOrnQTIJlSxRR8MO8Sl3yQx1C3r9NgSXutEnJilw2zGUag\nPFpaVlZfMoskdg0Jp1ObugElx+CzLovo6OQ/jFPRPheJs2AsGmIgQDTXZjMQkJ3b\nwL+7PYEeqdabhjkyCri51eT/JaUFeWuyeIVFHeNKHXy8VY6pO1SZ9wKBgQDqnO/4\ncBE/uksjCIvMGtVcBtwD9Mu7GhYGl6oNNpZkrqojEMxRQZyy5xnc3xkqjg9SYtSd\nkGzLARRbPHCM0xjCtQBQ+3tXi+1wdrcEnR8/Lo58yN12yeFKICm/yfxfQ0o+c3i/\n+90iXIp+2e9dwiQTa+q8h8hTcf4GAOD3v0oi3wKBgA6+a83sF3CpH3kbm/mDXt+j\ncfl6JkSA1ZcpIrH/A6V3+HEfPRFx96CjnGmmxcVJz7w1jUVhzgvNLMmUTdqYfIIm\nTKuSIi8jMW+9EfhS4Ax+wboI7nrMzm4W8W0TqDpbygcO6WvV+71yUP7QNiXjp3eP\n+24WvFTiY8nrs0qP9Jce\n-----END PRIVATE KEY-----\n",
  client_email: "oxygreen@appspot.gserviceaccount.com",
  client_id: "111047996082981543836",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/oxygreen%40appspot.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

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
      credentials: credentials,
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
