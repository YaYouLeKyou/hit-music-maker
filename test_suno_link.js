require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

const { generateFallbackCover } = require('./cover_fallback.js');
const { publishToAllSocial } = require('./social_publisher.js');

(async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hit-test-'));
    const coverPath = generateFallbackCover(tmpDir);
    
    // Ton lien Suno spécifique
    const sunoLink = 'https://suno.com/s/DXLUZ8EG5CFLpuGP';
    
    console.log('=== Test avec ton lien Suno ===');
    console.log('Suno Link:', sunoLink);
    console.log('FB_PAGE_ID:', process.env.FACEBOOK_PAGE_ID?.slice(0, 30) + '...');
    console.log('IG_USER_ID:', process.env.INSTAGRAM_ACCOUNT_ID?.slice(0, 30) + '...');
    console.log('Token FB:', !!process.env.FB_PAGE_ACCESS_TOKEN ? 'Définis' : 'Manquant');
    console.log('Token IG:', !!process.env.INSTAGRAM_ACCESS_TOKEN ? 'Définis' : 'Manquant');
    console.log('');

    const hit = {
        date: new Date().toISOString(),
        provider: 'manual-suno',
        generatedTheme: 'Test avec lien Suno réel',
        artistUsed: 'Test Artiste Suno',
        stylePrompt: 'afro-pop, 102 BPM, french vocals - test lien Suno',
        blocks: [{ type: 'Refrain', text: 'Test publication avec lien Suno réel' }],
        coverPath,
        music: { audioUrl: sunoLink } // Ton lien Suno ici
    };

    console.log('Cover path:', coverPath);
    console.log('Cover exists:', fs.existsSync(coverPath));
    console.log('');

    try {
        const results = await publishToAllSocial(hit);
        console.log('\n=== Résultats ===');
        console.log('Facebook:', results.facebook ? 'SUCCÈS' : 'ÉCHEC');
        if (results.facebook) console.log('  Post ID:', results.facebook.postId);
        if (results.facebook?.imageUrl) console.log('  Image URL:', results.facebook.imageUrl.substring(0, 80) + '...');
        
        console.log('Instagram:', results.instagram ? 'SUCCÈS' : 'ÉCHEC');
        if (results.instagram) console.log('  Post ID:', results.instagram.postId);
        
        if (!results.facebook && !results.instagram) {
            console.log('\n⚠️  Aucune publication réussie - vérifie les logs ci-dessus');
        }
    } catch (err) {
        console.error('Erreur lors de la publication:', err.message);
    } finally {
        // Nettoyage
        try { fs.unlinkSync(coverPath); } catch (_) {}
        try { fs.rmdirSync(tmpDir); } catch (_) {}
    }
})();