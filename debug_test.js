require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

const { generateFallbackCover } = require('./cover_fallback.js');
const { publishToAllSocial } = require('./social_publisher.js');

(async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hit-test-'));
    const coverPath = generateFallbackCover(tmpDir);
    const coverBuffer = fs.readFileSync(coverPath);
    const base64 = coverBuffer.toString('base64');
    
    console.log('=== Configuration ===');
    console.log('FB_PAGE_ID:', process.env.FACEBOOK_PAGE_ID?.slice(0, 50) + '...');
    console.log('IG_USER_ID:', process.env.INSTAGRAM_ACCOUNT_ID?.slice(0, 50) + '...');
    console.log('Token same?', process.env.FB_PAGE_ACCESS_TOKEN === process.env.INSTAGRAM_ACCESS_TOKEN ? 'YES' : 'NO');
    console.log('=== Fin Config ===\n');

    const hit = {
        date: new Date().toISOString(),
        provider: 'manual-suno',
        generatedTheme: 'Test Instagram publication',
        artistUsed: 'Test Testeur',
        stylePrompt: 'afro-pop, 102 BPM, french vocals, test',
        blocks: [{ type: 'Refrain', text: 'Test lyrics line for verification' }],
        coverPath,
        music: { audioUrl: 'https://example.com/audio.mp3' }
    };

    console.log('Cover path:', coverPath);
    console.log('Cover exists:', fs.existsSync(coverPath));
    console.log('Cover size:', coverBuffer.length, 'bytes\n');

    try {
        const results = await publishToAllSocial(hit);
        console.log('\n=== Résultats ===');
        console.log('Facebook:', results.facebook);
        console.log('Instagram:', results.instagram);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        try { fs.unlinkSync(coverPath); } catch (_) {}
        try { fs.rmdirSync(tmpDir); } catch (_) {}
    }
})();