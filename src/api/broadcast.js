import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qbxjinmitrekmuygjeug.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGppbm1pdHJla211eWdqZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mzc5MDcsImV4cCI6MjA2MDIxMzkwN30.xpkRAguLyuUiA39m0LLGTWyRkT6gY65osqMn_8FZsNg";

export default async function handler(req, res) {
  try {
    console.log("broadcast");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const myChannel = supabase.channel("test-channel");

    // Await the send operation to ensure you catch errors.
    const resp = await myChannel.send({
      type: "broadcast",
      event: "shout",
      payload: { message: "testy" },
    });

    console.log("Broadcast response:", resp);
    // Respond to the client after successful broadcasting.
    res.status(200).json({ success: true, response: resp });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
