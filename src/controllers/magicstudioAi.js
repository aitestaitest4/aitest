const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const magicstudioAiEraseImage = async (req, res) => {
  console.log(req.body);
  try {
    // First get auth token
    const tokenResponse = await axios.post(
      "https://api.magicstudio.com/auth/token",
      {
        client_id: process.env.MAGIC_STUDIO_CLIENT_ID,
        client_secret: process.env.MAGIC_STUDIO_CLIENT_SECRET,
        expiry_days: 4,
      }
    );
    console.log(tokenResponse.data);

    const { token } = tokenResponse.data;

    // Download the image first
    // const imageResponse = await axios.get(
    //   "https://images.pexels.com/photos/22845514/pexels-photo-22845514/free-photo-of-flock-of-seagulls-flying-over-a-person-standing-at-a-harbor.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    //   { responseType: "arraybuffer" }
    // );

    const file_image = req.body.image_file;
    const file_mask = req.body.mask_file;
    const filename = req.body.filename;

    // Create form data
    const formData = new FormData();
    formData.append("image_file", file_image, "image.jpg");
    formData.append("mask_file", file_mask, "mask.jpg");
    formData.append("filename", filename, "filename.jpg");

    // Make request to magic eraser API using axios instead of request
    const response = await axios.post(
      "https://api.magicstudio.com/magiceraser/erase",
      formData,
      {
        headers: {
          accessToken: token,
          ...formData.getHeaders(),
        },
      }
    );
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  magicstudioAiEraseImage,
};
