const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const removeImageBackground = async (req, res) => {
  try {
    const fileLink = req.fileLink;

    const image_url = fileLink;

    const formData = new FormData();
    formData.append("output_type", "cutout");
    formData.append("format", "PNG");
    formData.append("image_url", image_url);

    const response = await axios.post(
      "https://api.picsart.io/tools/1.0/removebg",
      formData,
      {
        headers: {
          accept: "application/json",
          "x-picsart-api-key": process.env.PICSART_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error removing background:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing background from image",
      error: error.message,
    });
  }
};

module.exports = {
  removeImageBackground,
};
