// api/message.js

// A simple in-memory store to hold the last message
let lastMessage = null;

export default function handler(req, res) {
  if (req.method === "POST") {
    // Receive a message from one client
    const { message } = req.body;
    lastMessage = message;
    console.log("Message stored:", message);
    res.status(200).json({ success: true });
  } else if (req.method === "GET") {
    // Return the last stored message (if any)
    res.status(200).json({ message: lastMessage });
    // Optionally clear the stored message after reading
    lastMessage = null;
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
