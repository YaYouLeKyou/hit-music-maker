require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

// Génère une vraie pochette PNG via generateFallbackCover
const { generateFallbackCover } = require('./cover_fallback.js');
const { publishToAllSocial } = require('./social_publisher.js');

(async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hit-test-'));
    const coverPath = generateFallbackCover(tmpDir, 'test afro-pop album cover');

    const hit = {
        date: new Date().toISOString(),
        provider: 'manual-suno',
        generatedTheme: 'Test theme',
        artistUsed: 'Test Artist',
        stylePrompt: 'test afro-pop, 102 BPM, french vocals',
        blocks: [{ type: 'Couplet 1', text: 'Test lyrics line' }],
        coverPath,
        music: { audioUrl: 'https://example.com/audio.mp3' }
    };

    console.log('Cover path:', coverPath);
    console.log('Cover exists:', fs.existsSync(coverPath));
    console.log('Cover size:', fs.statSync(coverPath).size);

    try {
        const results = await publishToAllSocial(hit);
        console.log('Results:', JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Cleanup
        try { fs.unlinkSync(coverPath); } catch (_) {}
        try { fs.rmdirSync(tmpDir); } catch (_) {}
    }
})();