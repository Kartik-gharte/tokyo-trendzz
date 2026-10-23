
require("dotenv").config();

const http = require("http");
const { URL } = require("url");
const { google } = require("googleapis");

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const required = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "EMAIL_USER"
];

for (const key of required) {
    if (!process.env[key]) {
        console.error(`Missing ${key} in server/.env`);
        process.exit(1);
    }
}

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://mail.google.com/"]
});

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname !== "/oauth2callback") {
        res.writeHead(404);
        return res.end("Not found");
    }

    const error = url.searchParams.get("error");
    const code = url.searchParams.get("code");

    if (error || !code) {
        res.writeHead(400);
        res.end("Google authorization was not completed.");
        console.error("Authorization failed:", error || "Missing code");
        server.close();
        return;
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(`
            <!doctype html>
            <html>
              <body style="font-family:Arial;padding:30px">
                <h2>Tokyo Trendz Gmail authorization received</h2>
                <p>You can return to your terminal.</p>
              </body>
            </html>
        `);

        if (!tokens.refresh_token) {
            console.error(
                "No refresh token returned. Revoke the existing grant " +
                "for this app in your Google Account and authorize again."
            );
        } else {
            console.log("\nAuthorization successful.");
            console.log("\nAdd this line to server/.env:\n");
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log("\nKeep this token private.");
        }

        server.close();
    } catch (err) {
        console.error("OAuth token exchange failed:", err.message);

        if (!res.headersSent) {
            res.writeHead(500);
            res.end("Authorization failed. Check your terminal.");
        }

        server.close();
    }
});

server.on("error", (err) => {
    console.error("Could not start callback server:", err.message);
});

server.listen(PORT, "127.0.0.1", () => {
    console.log("Open this Google authorization URL in your browser:\n");
    console.log(authUrl);
});
