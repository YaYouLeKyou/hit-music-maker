const http = require('http');

const data = JSON.stringify({
    stylePrompt: 'test afro-pop, 102 BPM, french vocals',
    blocks: [{ type: 'Couplet 1', text: 'Test lyrics line' }],
    generatedTheme: 'Test theme',
    artistUsed: 'Test Artist',
    audioUrl: 'https://example.com/audio.mp3'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/publish',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
    });
});

req.on('error', (error) => console.error(`Error: ${error}`));
req.write(data);
req.end();