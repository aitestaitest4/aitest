const aiplatform = require("@google-cloud/aiplatform");
const { PredictionServiceClient } = aiplatform.v1;
const { helpers } = aiplatform;
const fs = require("fs");
const util = require("util");

const generateImageController = async (req, res) => {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = "us-central1";
    const prompt = req.body.prompt || "a dog reading a newspaper";
    const aspectRatio = req.body.aspectRatio || "1:1";

    // Specifies the location of the api endpoint
    const clientOptions = {
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
    };

    // Instantiates a client
    const predictionServiceClient = new PredictionServiceClient(clientOptions);

    // Configure the parent resource
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;

    const promptText = {
      prompt: prompt,
    };
    const instanceValue = helpers.toValue(promptText);
    const instances = [instanceValue];

    const parameter = {
      sampleCount: 1,
      aspectRatio: aspectRatio,
      safetyFilterLevel: "block_some",
      personGeneration: "allow_adult",
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);
    const predictions = response.predictions;

    if (predictions.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No image was generated. Check the request parameters and prompt.",
      });
    }

    const generatedImages = [];
    let i = 1;

    for (const prediction of predictions) {
      const buff = Buffer.from(
        prediction.structValue.fields.bytesBase64Encoded.stringValue,
        "base64"
      );

      const writeFile = util.promisify(fs.writeFile);
      const filename = `output${i}.png`;
      await writeFile(filename, buff);

      generatedImages.push({
        filename,
        imageData: buff.toString("base64"),
      });

      i++;
    }

    return res.status(200).json({
      success: true,
      data: {
        images: generatedImages,
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating image",
      error: error.message,
    });
  }
};

module.exports = {
  generateImageController,
};
