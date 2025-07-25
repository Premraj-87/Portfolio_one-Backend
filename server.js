const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS: Allow only your frontend domain (update this for production)
app.use(cors({
  origin: ["https://portfolio-one-premraj-87.vercel.app", "http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true,
}));

// Middleware
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Portfolio Backend Server is running!", 
    status: "active",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide name, email, and message." 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.MY_EMAIL,
      subject: `Portfolio Contact: Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Portfolio Contact Message
          </h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong style="color: #333;">Name:</strong> ${name}</p>
            <p><strong style="color: #333;">Email:</strong> <a href="mailto:${email}" style="color: #4CAF50;">${email}</a></p>
          </div>
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #555;">${message}</p>
          </div>
          <div style="margin-top: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
            <small style="color: #666;">
              Sent from Portfolio Contact Form at ${new Date().toLocaleString()}
            </small>
          </div>
        </div>
      `,
      replyTo: email,
    });

    console.log(`📧 Message sent successfully from ${name} (${email})`);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Portfolio Backend Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email service configured for: ${process.env.MY_EMAIL || 'Not configured'}`);
});
