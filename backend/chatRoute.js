// backend/chatRoute.js
//
// 1. npm install express cors @anthropic-ai/sdk dotenv
// 2. Add ANTHROPIC_API_KEY=sk-ant-... to your .env file
// 3. Mount this router in your main server file (see server.js example below)

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const router = express.Router();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // never expose this key in frontend code
});

// Customize this with your actual FAQ/support info so answers stay grounded
const SYSTEM_PROMPT = `You are a friendly customer support assistant for [Your Company Name].
Answer questions clearly and concisely based on the info below. If you don't know
the answer, say so and suggest the user contact support@yourcompany.com.

FAQ / Company info:
- Business hours: Mon-Fri, 9am-6pm
- Shipping takes 3-5 business days
- Returns accepted within 30 days
- (Replace this section with your real product/company details)
`;

router.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: "user"|"assistant", content: "..." }]

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const reply = response.content[0].text;
    res.json({ reply });
  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;

/* ---------------- server.js (example) ----------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const chatRoute = require("./chatRoute");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", chatRoute);

app.listen(5000, () => console.log("Server running on port 5000"));
------------------------------------------------------- */
