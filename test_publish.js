var data = {
    stylePrompt: "test afro-pop, 102 BPM, french vocals",
    blocks: [{ type: "Couplet 1", text: "Test lyrics line" }],
    generatedTheme: "Test theme",
    artistUsed: "Test Artist",
    audioUrl: "https://example.com/audio.mp3"
};

fetch("http://localhost:3000/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
})
.then(function(r) { return r.json(); })
.then(function(d) { console.log("Response:", JSON.stringify(d, null, 2)); })
.catch(function(e) { console.error("Error:", e.message); });
