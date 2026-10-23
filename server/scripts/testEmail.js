
require("dotenv").config();

const { sendOrderStatusEmail } = require("../utils/emailService");

async function testEmail() {
  try {
    if (!process.env.EMAIL_USER) {
      throw new Error("EMAIL_USER is missing from .env");
    }

    const result = await sendOrderStatusEmail({
      to: process.env.EMAIL_USER,
      customerName: "Tokyo Trendz Test",
      orderNumber: "TEST-001",
      status: "confirmed",
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", result.messageId);
    console.log("Check the inbox and spam folder of:", process.env.EMAIL_USER);
  } catch (error) {
    console.error("Email test failed:");
    console.error(error.message);
    process.exitCode = 1;
  }
}

testEmail();
