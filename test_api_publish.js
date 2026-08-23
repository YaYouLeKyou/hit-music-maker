const http = require('http');

const data = JSON.stringify({
    stylePrompt: 'afro-pop, 102 BPM, french vocals - test lien Suno',
    blocks: [{ type: 'Refrain', text: 'Test publication via API avec lien Suno' }],
    generatedTheme: 'Test API lien Suno réel',
    artistUsed: 'Test Artiste API',
    audioUrl: 'https://suno.com/s/DXLUZ8EG5CFLpuGP'  // Ton lien Suno
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

console.log('Envoi de la requête à /api/publish avec le lien Suno...');

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        
        // Essaye de parser la réponse JSON pour plus de détails
        try {
            const parsed = JSON.parse(responseData);
            if (parsed.results) {
                console.log('\n--- Résultats détaillés ---');
                console.log('Facebook:', parsed.results.facebook ? 'OK' : 'ÉCHEC');
                console.log('Instagram:', parsed.results.instagram ? 'OK' : 'ÉCHEC');
            }
        } catch (e) {
            console.log('Réponse non-JSON reçue');
        }
    });
});

req.on('error', (error) => {
    console.error(`Erreur de requête: ${error.message}`);
});

req.write(data);
req.end();