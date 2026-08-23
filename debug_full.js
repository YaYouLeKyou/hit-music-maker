require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

// Patch pour logger tout ce qui est passé à publishToAllSocial
const originalPublishToAllSocial = require('./social_publisher.js').publishToAllSocial;

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

(async () => {
    console.log('=== Test de publication avec logs détaillés ===\n');
    
    const { generateFallbackCover } = require('./cover_fallback.js');
    const { publishToAllSocial } = require('./social_publisher.js');
    
    // Vérifier les variables d'environnement chargées
    console.log('Variables d'environnement chargées:');
    console.log('FB_PAGE_ACCESS_TOKEN:', process.env.FB_PAGE_ACCESS_TOKEN?.substring(0, 30) + '...');
    console.log('FACEBOOK_PAGE_ID:', process.env.FACEBOOK_PAGE_ID);
    console.log('INSTAGRAM_ACCESS_TOKEN:', process.env.INSTAGRAM_ACCESS_TOKEN?.substring(0, 30) + '...');
    console.log('INSTAGRAM_ACCOUNT_ID:', process.env.INSTAGRAM_ACCOUNT_ID);
    console.log('');
    
    // Simuler exactement ce que fait /api/publish dans server.js
    const tmpDir = os.tmpdir();
    console.log('tmpDir:', tmpDir);
    
    const coverPath = generateFallbackCover(tmpDir);
    console.log('Cover generated at:', coverPath);
    console.log('Cover exists:', fs.existsSync(coverPath));
    console.log('Cover size:', fs.statSync(coverPath).size, 'bytes');
    console.log('');
    
    const hit = {
        date: new Date().toISOString(),
        provider: 'manual-suno',
        generatedTheme: 'Test API lien Suno réel',
        artistUsed: 'Test Artiste API',
        stylePrompt: 'afro-pop, 102 BPM, french vocals - test lien Suno',
        blocks: [
            { type: 'Refrain', text: 'Test publication via API avec lien Suno' }
        ],
        coverPath,
        music: { audioUrl: 'https://suno.com/s/DXLUZ8EG5CFLpuGP' }
    };
    
    console.log('Hit object to be published:');
    console.log(JSON.stringify(hit, null, 2));
    console.log('\n=== Appel de publishToAllSocial ===\n');
    
    try {
        const results = await publishToAllSocial(hit);
        console.log('\n=== Résultats finaux ===');
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('Erreur pendant la publication:', err);
    } finally {
        // Nettoyage
        try { if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath); } catch (_) {}
    }
})();