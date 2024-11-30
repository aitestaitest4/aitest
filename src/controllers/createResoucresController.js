const createResourcesController = async (req, res) => {
  try {
    const options = {
      method: "GET",
      headers: {
        "x-freepik-api-key": process.env.API_FREE_PIC_KEY,
      },
    };

    const response = await fetch(
      "https://api.freepik.com/v1/resources",
      options
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch resources");
    }

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while fetching resources",
    });
  }
};

const getIconsController = async (req, res) => {
  try {
    const options = {
      method: "GET",
      headers: {
        "x-freepik-api-key": process.env.API_FREE_PIC_KEY,
      },
    };

    const response = await fetch("https://api.freepik.com/v1/icons", options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch icons");
    }

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while fetching icons",
    });
  }
};

module.exports = {
  createResourcesController,
  getIconsController,
};
