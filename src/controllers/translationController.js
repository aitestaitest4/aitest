const { TranslationServiceClient } = require("@google-cloud/translate");
const { createResponse } = require("../services/responseService");

const projectId = "oxygreen";
const location = "us-central1";
const adaptiveMtDatasetId = "oxygreen_dataset"; // change this to any dataset ID
const strsToTranslate = []; // This will be populated from req.body

// Instantiates a client
const translationClient = new TranslationServiceClient();

exports.runAdaptiveMtProcess = async (req, res) => {
  try {
    const {
      displayName,
      sourceLanguageCode,
      targetLanguageCode,
      filePath,
      textsToTranslate,
    } = req.body;

    if (
      !displayName ||
      !sourceLanguageCode ||
      !targetLanguageCode ||
      !filePath ||
      !textsToTranslate
    ) {
      return res
        .status(400)
        .json(
          createResponse(
            400,
            null,
            "displayName, sourceLanguageCode, targetLanguageCode, filePath, and textsToTranslate are required."
          )
        );
    }

    if (sourceLanguageCode === targetLanguageCode) {
      return res
        .status(400)
        .json(
          createResponse(
            400,
            null,
            "sourceLanguageCode and targetLanguageCode must be different."
          )
        );
    }

    // Step 1: Create Adaptive MT Dataset
    const createRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      adaptiveMtDataset: {
        name: `projects/${projectId}/locations/${location}/adaptiveMtDatasets/${adaptiveMtDatasetId}`,
        displayName: displayName,
        sourceLanguageCode: sourceLanguageCode,
        targetLanguageCode: targetLanguageCode,
      },
    };

    let datasetResponse;
    try {
      [datasetResponse] = await translationClient.createAdaptiveMtDataset(
        createRequest
      );
      console.log("Dataset Created:", datasetResponse);
    } catch (error) {
      if (
        error.code === 6 &&
        error.message.includes("Dataset already exists.")
      ) {
        console.warn("Dataset already exists. Fetching the existing dataset.");
        const getRequest = {
          name: `projects/${projectId}/locations/${location}/adaptiveMtDatasets/${adaptiveMtDatasetId}`,
        };
        [datasetResponse] = await translationClient.getAdaptiveMtDataset(
          getRequest
        );
        console.log("Existing Dataset Retrieved:", datasetResponse);
      } else {
        console.error("Error creating dataset:", error);
        throw error;
      }
    }

    // Step 2: Import Adaptive MT File
    const importRequest = {
      parent: `projects/${projectId}/locations/${location}/adaptiveMtDatasets/${adaptiveMtDatasetId}`,
      importConfigs: [
        {
          mimeType: "text/plain",
          inputConfig: {
            gcsSource: {
              inputUris: [filePath],
            },
          },
        },
      ],
    };

    const [importResponse] = await translationClient.importAdaptiveMtFile(
      importRequest
    );
    console.log("File Imported:", importResponse);

    // Step 3: Translate
    const translateRequest = {
      parent: `projects/${projectId}/locations/${location}`,
      dataset: `projects/${projectId}/locations/${location}/adaptiveMtDatasets/${adaptiveMtDatasetId}`,
      contents: textsToTranslate, // Array of strings to translate
      mimeType: "text/plain",
      sourceLanguageCode: sourceLanguageCode,
      targetLanguageCode: targetLanguageCode,
      // Specify document source to resolve INVALID_ARGUMENT error
      documentSource: {
        gcsSource: {
          inputUri: filePath,
        },
      },
    };

    console.log("Translate Request:", translateRequest);

    const [translateResponse] = await translationClient.adaptiveMtTranslate(
      translateRequest
    );
    console.log("Translation Successful:", translateResponse);

    return res.status(200).json(
      createResponse(
        200,
        {
          dataset: datasetResponse,
          import: importResponse,
          translation: translateResponse,
        },
        "All operations completed successfully."
      )
    );
  } catch (error) {
    console.error("Error in adaptive MT process:", error);
    return res
      .status(500)
      .json(
        createResponse(500, null, "Failed to perform adaptive MT process.")
      );
  }
};
