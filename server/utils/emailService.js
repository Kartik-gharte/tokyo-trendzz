
const nodemailer = require("nodemailer");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

const statusMessages = {
    placed: {
        subject: "Order placed",
        message: "Your order has been placed successfully."
    },
    confirmed: {
        subject: "Order confirmed",
        message: "Your order has been confirmed."
    },
    packed: {
        subject: "Order packed",
        message: "Your order has been packed and is preparing for dispatch."
    },
    shipped: {
        subject: "Order shipped",
        message: "Your order has been shipped."
    },
    out_for_delivery: {
        subject: "Order out for delivery",
        message: "Your order is out for delivery."
    },
    delivered: {
        subject: "Order delivered",
        message: "Your order has been delivered. Thank you for shopping with Tokyo Trendz!"
    },
    cancelled: {
        subject: "Order cancelled",
        message: "Your order has been cancelled."
    }
};

function createTransporter() {
    const required = [
        "EMAIL_USER",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REFRESH_TOKEN"
    ];

    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing ${key} in server/.env`);
        }
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN
        }
    });
}

async function sendOrderStatusEmail({
    to,
    customerName,
    orderNumber,
    status
}) {
    if (!to) {
        throw new Error("Customer email address is missing.");
    }

    const normalizedStatus = String(status || "").toLowerCase();
    const details = statusMessages[normalizedStatus];

    if (!details) {
        throw new Error(`Unsupported order status: ${normalizedStatus}`);
    }

    const safeName = escapeHtml(customerName || "Customer");
    const safeOrderNumber = escapeHtml(orderNumber || "N/A");
    const safeStatus = escapeHtml(
        normalizedStatus.replace(/_/g, " ")
    );

    const transporter = createTransporter();

    return transporter.sendMail({
        from: {
            name: process.env.EMAIL_FROM_NAME || "Tokyo Trendz",
            address: process.env.EMAIL_USER
        },
        to,
        subject: `Tokyo Trendz: ${details.subject} - Order ${orderNumber || "N/A"}`,
        text: [
            `Hello ${customerName || "Customer"},`,
            "",
            details.message,
            `Order number: ${orderNumber || "N/A"}`,
            `Status: ${normalizedStatus.replace(/_/g, " ")}`,
            "",
            "Thank you for shopping with Tokyo Trendz."
        ].join("\n"),
        html: `
            <!doctype html>
            <html>
              <body style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
                <div style="max-width:600px;margin:auto;padding:24px">
                  <h2>Tokyo Trendz</h2>
                  <p>Hello ${safeName},</p>
                  <p>${escapeHtml(details.message)}</p>
                  <p>
                    <strong>Order number:</strong> ${safeOrderNumber}<br>
                    <strong>Status:</strong> ${safeStatus}
                  </p>
                  <p>Thank you for shopping with Tokyo Trendz.</p>
                </div>
              </body>
            </html>
        `
    });
}

module.exports = { sendOrderStatusEmail };
