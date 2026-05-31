import nodemailer from "nodemailer";
import Contact from "../models/Contact.js";

// Validate email config exists
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn(
    "⚠️  EMAIL_USER or EMAIL_PASSWORD not set. Contact form emails will not work.",
  );
}

// Configure email service (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate message length
    if (message.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Message must be at least 10 characters" });
    }

    // Save to database
    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();

    // Only send emails if EMAIL_USER is configured
    if (!process.env.EMAIL_USER) {
      return res.json({
        success: true,
        message: "Message saved (email notifications disabled)",
      });
    }

    // Send email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Reply to: ${email}
        </p>
      `,
    };

    // Send email to user confirmation
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your message - Resume ATS Analyzer",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We received your message and will get back to you within 24 hours.</p>
        <hr>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Best regards,<br>Resume ATS Analyzer Team</p>
      `,
    };

    // Send emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(userMailOptions);

    res.json({
      success: true,
      message: "Message sent successfully! Check your email for confirmation.",
    });
  } catch (err) {
    console.error("Contact Message Error:", err);
    res.status(500).json({ error: err.message || "Failed to send message" });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    console.error("Get Contacts Error:", err);
    res.status(500).json({ error: err.message });
  }
};
