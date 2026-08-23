const http = require('http');

const data = JSON.stringify({
    stylePrompt: 'afro-pop, 102 BPM, female french vocals',
    blocks: [
        { type: 'Intro', text: 'Salut c\'est le début' },
        { type: 'Refrain', text: 'Je danse toute la nuit' }
    ],
    audioUrl: 'https://suno.com/song/123abc'
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