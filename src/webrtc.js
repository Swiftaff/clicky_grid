// Function to send a message via a POST request
async function sendMessage() {
  const message = document.getElementById("messageInput").value;
  if (!message) return;
  try {
    const response = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const result = await response.json();
    console.log("Message sent:", result);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Function to poll for new messages using GET
async function pollMessage() {
  console.log("check for new message");
  try {
    const response = await fetch("/api/message");
    const data = await response.json();
    if (data.message) {
      document.getElementById("receivedMessage").textContent = data.message;
      console.log("Message received:", data.message);
    }
  } catch (error) {
    console.error("Error fetching message:", error);
  }
}

document.getElementById("sendButton").addEventListener("click", sendMessage);

// Poll for messages every 2 seconds
setInterval(pollMessage, 2000);
