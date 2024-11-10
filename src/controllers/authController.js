require("dotenv").config();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { createResponse } = require("../services/responseService");
// const emailService = require("../services/email");
const { roles } = require("../constants");

exports.testRoute = async (req, res) => {
  return res.status(200).json(
    createResponse(200, "successful!", {
      message: "Testing Route",
    })
  );
};

exports.handleSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json(createResponse(400, "User already exists"));
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let verifytoken = Math.floor(10000 + Math.random() * 90000).toString();
    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      verifytoken,
      isActive: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Created Successfully!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <h1 style="color: #4CAF50;">AI-Powered Platform(ALL-IN-ONE)</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px;">Dear ${name},</p>
            <p style="font-size: 16px;">
              Welcome to our platform! Your account has been created successfully.
            </p>
            <p style="font-size: 16px;">
              Please verify your account by clicking the link below:
            </p>
            <p style="font-size: 16px;">
              <a href="http://localhost:3001/verify-account/${verifytoken}/${user._id}" style="color: #4CAF50;">Verify Account</a>
            </p>
            <p style="font-size: 16px;">Best Regards,<br/>The Team</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center;">
            <p style="font-size: 14px; color: #888;">© 2024 AI Plagiarism Detection, All rights reserved.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error.message);
        return res
          .status(500)
          .json(createResponse(500, "Failed to send email"));
      } else {
        return res
          .status(200)
          .json(createResponse(200, "Email sent successfully", { info }));
      }
    });

    return res.status(201).json(
      createResponse(201, "Signup successful!", {
        email,
        name: user.name,
        token,
      })
    );
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json(createResponse(500, "Server error"));
  }
};

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json(createResponse(401, "Invalid email or password"));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(createResponse(401, "Invalid email or password"));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    let resObj = {
      email,
      name: user.name,
      token,
    };
    if (user.role === roles.admin) {
      resObj.isAdmin = true;
    }
    if (!user.isActive) {
      return res.status(400).json(createResponse(400, "Account Not Active"));
    }
    return res
      .status(200)
      .json(createResponse(200, "Login Successfull!", resObj));
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json(createResponse(500, "Server error"));
  }
};

exports.handleLogout = async (req, res) => {
  try {
    return res.status(200).json(
      createResponse(200, "Logout successful!", {
        message: "Token invalidated, please remove it from client storage.",
      })
    );
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json(createResponse(500, "Server error"));
  }
};

exports.verifyAccount = async (req, res) => {
  const { verifytoken, userid } = req.params;

  try {
    let user = await User.findById(userid);
    if (!user) {
      return res.status(404).json(createResponse(404, "User not found"));
    }
    if (user.isActive) {
      return res
        .status(400)
        .json(createResponse(400, "Account already verified"));
    }
    if (user.verifytoken !== verifytoken) {
      return res
        .status(400)
        .json(createResponse(400, "Invalid verification token"));
    }

    // Mark the user as verified
    user.verifytoken = null;
    user.isActive = true;
    await user.save();

    return res
      .status(200)
      .json(createResponse(200, "Account verified successfully"));
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json(createResponse(500, "Invalid credentials"));
  }
};
