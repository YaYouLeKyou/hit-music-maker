require('dotenv').config();
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Test the API endpoint
const testAPI = () => {
    const data = JSON.stringify({
        stylePrompt: 'afro-pop, 102 BPM, french vocals - test lien Suno',
        blocks: [{ type: 'Refrain', text: 'Test publication via API avec lien Suno' }],
        generatedTheme: 'Test API lien Suno réel',
        artistUsed: 'Test Artiste API',
        audioUrl: 'https://suno.com/s/DXLUZ8EG5CFLpuGP'
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

    console.log('=== Test direct du serveur /api/publish ===');
    console.log('Data envoyé:', data.substring(0, 100) + '...');
    console.log('');

    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Response complète: ${responseData}`);
            
            try {
                const parsed = JSON.parse(responseData);
                console.log('\n=== Analyse de la réponse ===');
                console.log('ok:', parsed.ok);
                if (parsed.results) {
                    console.log('Results.facebook:', parsed.results.facebook);
                    console.log('Results.instagram:', parsed.results.instagram);
                    
                    if (parsed.results.facebook === null && parsed.results.instagram === null) {
                        console.log('\n⚠️  ERREUR: Les deux publications ont échoué');
                    } else {
                        console.log('\n✅ Succès - au moins une publication a réussi');
                    }
                }
            } catch (e) {
                console.log('Erreur de parsing JSON:', e.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`Erreur de requête: ${error.message}`);
    });

    req.write(data);
    req.end();

    // Arrêter le serveur après 2 secondes
    setTimeout(() => {
        console.log('\n⏹️  Arrêt du serveur...');
        process.exit(0);
    }, 2000);
};

// Exécuter le test
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };