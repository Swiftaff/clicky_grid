import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qbxjinmitrekmuygjeug.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieGppbm1pdHJla211eWdqZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mzc5MDcsImV4cCI6MjA2MDIxMzkwN30.xpkRAguLyuUiA39m0LLGTWyRkT6gY65osqMn_8FZsNg";

function broadcast() {
  console.log("broadcast");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const myChannel = supabase.channel("test-channel");
  const message = document.getElementById("messageInput").value;
  myChannel
    .send({ type: "broadcast", event: "shout", payload: { message } })
    .then((resp) => console.log(resp));
}

document.getElementById("sendButton").addEventListener("click", broadcast);
