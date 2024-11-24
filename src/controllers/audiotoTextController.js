const { SpeechClient } = require("@google-cloud/speech");
const { Storage } = require("@google-cloud/storage");
const { createResponse } = require("../services/responseService");
const path = require("path");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { Readable } = require("stream");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

const ensureTempUploadsDir = () => {
  const tempDir = path.join(__dirname, "temp-uploads");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

exports.convertAudioToText = async (req, res) => {
  try {
    // Check if an audio file is provided
    if (!req.fileLink) {
      return res
        .status(400)
        .json(createResponse(400, null, "No audio file uploaded."));
    }

    // Set up Google Cloud configurations
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const speechClient = new SpeechClient({ projectId });
    const storage = new Storage({ projectId });
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      return res
        .status(500)
        .json(createResponse(500, null, "GCS bucket name is not configured."));
    }

    // Ensure the temp-uploads directory exists
    const tempDir = ensureTempUploadsDir();

    // Use .wav extension since we convert to WAV format
    const uniqueFilename = `${crypto.randomBytes(16).toString("hex")}.wav`;
    const tempFilePath = path.join(tempDir, `temp-${uniqueFilename}`);
    const gcsFilename = `uploads/${uniqueFilename}`;

    // Convert buffer to readable stream
    const audioStream = new Readable();
    audioStream.push(req.fileLink.buffer);
    audioStream.push(null);

    // Convert audio to mono and set sample rate to 44100 Hz using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(audioStream)
        .audioChannels(1)
        .audioFrequency(44100)
        .toFormat("wav")
        .on("end", resolve)
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg stderr:", stderr);
          reject(err);
        })
        .save(tempFilePath);
    });

    // Upload the converted mono audio file to GCS
    const file = storage.bucket(bucketName).file(gcsFilename);
    const audioBuffer = fs.readFileSync(tempFilePath);

    // Save the file to GCS with correct MIME type
    await file.save(audioBuffer, {
      metadata: {
        contentType: "audio/wav",
      },
    });

    // Remove the temporary file after upload
    fs.unlinkSync(tempFilePath);

    // Configure the Speech-to-Text request with GCS URI
    const requestConfig = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 44100,
        languageCode: "en-US",
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        audioChannelCount: 1,
      },
      audio: {
        uri: `gs://${bucketName}/${gcsFilename}`,
      },
    };

    // Start the long-running recognize request
    const [operation] = await speechClient.longRunningRecognize(requestConfig);

    // Wait for the operation to complete
    const [response] = await operation.promise();

    // Process the results
    const transcription = response.results
      .map((result) =>
        result.alternatives
          .map((alternative) => alternative.transcript)
          .join("\n")
      )
      .join("\n");

    console.log("Transcription:", transcription);

    // Check if transcription was successful
    if (!transcription) {
      return res
        .status(500)
        .json(createResponse(500, null, "Transcription failed."));
    }

    // Respond with the transcribed text
    return res
      .status(200)
      .json(
        createResponse(
          200,
          { text: transcription },
          "Transcription successful."
        )
      );
  } catch (error) {
    console.error("Error in convertAudioToText:", error);

    // Handle specific INVALID_ARGUMENT error related to sample rate mismatch
    if (error.code === 3 && error.details.includes("sample_rate_hertz")) {
      return res
        .status(400)
        .json(
          createResponse(
            400,
            null,
            "Sample rate mismatch. Please upload an audio file with a sample rate of 44100 Hz."
          )
        );
    }

    return res
      .status(500)
      .json(createResponse(500, null, "Internal server error."));
  }
};
