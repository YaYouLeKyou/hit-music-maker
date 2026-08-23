require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || "EAAQpqvvDyb4BSQBHkxhx1RMR9tonrlre5RGZAEXMWBp3wPYUjjYuNNWPDNggnpDBXNdoI0AsroTD4uUNt12LbotAkBALZBxMynVLMZA1sMBDIjAq9vErR73AcZA6TcxCS2RPPviaIqdw6RTcbGx6JMO7vLFkX3LEwZANH8oyN6z2mmuFiVTkGk6238KtOwpXOngZDZD";
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "1309437248912521";
const IG_USER_ID = process.env.INSTAGRAM_ACCOUNT_ID || "17841436299535102";

async function verifyToken() {
    console.log('=== Vérification des tokens ===\n');
    
    // Vérifie le token Facebook
    console.log('1. Vérification token Facebook...');
    try {
        const fbRes = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${TOKEN}`);
        const fbData = await fbRes.json();
        console.log('   Facebook Token:', fbData.id ? `VALIDE (userID: ${fbData.id})` : `INVALIDE - ${JSON.stringify(fbData)}`);
    } catch (e) {
        console.log('   Erreur Facebook:', e.message);
    }
    
    // Vérifie le token pour la page
    console.log('\n2. Vérification permissions page...');
    try {
        const pageRes = await fetch(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}?access_token=${TOKEN}&fields=name`);
        const pData = await pageRes.json();
        console.log('   Page:', pData.name || `ERREUR - ${JSON.stringify(pData)}`);
    } catch (e) {
        console.log('   Erreur page:', e.message);
    }
    
    // Vérifie le token Instagram
    console.log('\n3. Vérification token Instagram...');
    try {
        const igRes = await fetch(`https://graph.facebook.com/v21.0/${IG_USER_ID}?access_token=${TOKEN}&fields=name`);
        const igData = await igRes.json();
        console.log('   Instagram Account:', igData.name || `ERREUR - ${JSON.stringify(igData)}`);
    } catch (e) {
        console.log('   Erreur Instagram:', e.message);
    }
    
    // Vérifie les permissions du token
    console.log('\n4. Permissions du token...');
    try {
        const permRes = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${TOKEN}`);
        const permData = await permRes.json();
        const perms = permData.data || [];
        console.log('   Permissions:', perms.map(p => p.permission + ' (' + p.status + ')').join(', '));
    } catch (e) {
        console.log('   Erreur permissions:', e.message);
    }
    
    console.log('\n=== Fin vérification ===\n');
}

// Test de publication réelle
async function testPublish() {
    console.log('=== Test de publication complète ===\n');
    
    const { publishToAllSocial } = require('./social_publisher.js');
    const { generateFallbackCover } = require('./cover_fallback.js');
    
    const tmpDir = os.tmpdir();
    const coverPath = generateFallbackCover(tmpDir);
    const coverContent = fs.readFileSync(coverPath);
    
    const hit = {
        date: new Date().toISOString(),
        provider: 'suno-test',
        generatedTheme: 'Test Publication Corrigé',
        artistUsed: 'Testeur API',
        stylePrompt: 'test afro-pop, 120 BPM, female vocals - test corrigé',
        blocks: [{ type: 'Refrain', text: 'Test parfait pour vérification' }],
        coverPath,
        music: { audioUrl: 'https://suno.com/s/DXLUZ8EG5CFLpuGP' }
    };
    
    try {
        console.log('Publication en cours...\n');
        const results = await publishToAllSocial(hit);
        
        console.log('\n=== RÉSULTATS DE LA PUBLICATION ===');
        if (results.facebook) {
            console.log('✅ Facebook:', results.facebook.postId);
            console.log('   URL:', `https://facebook.com/${results.facebook.postId}`);
        } else {
            console.log('❌ Facebook: ÉCHEC');
        }
        
        if (results.instagram) {
            console.log('✅ Instagram:', results.instagram.postId);
            console.log('   URL:', `https://instagram.com/p/${results.instagram.postId}`);
        } else {
            console.log('❌ Instagram: ÉCHEC');
        }
        
        if (!results.facebook && !results.instagram) {
            console.log('\n⚠️ Vérifiez les tokens dans .env');
        }
    } catch (err) {
        console.error('Erreur:', err.message);
    } finally {
        // Cleanup
        try { fs.unlinkSync(coverPath); } catch (_) {}
    }
}

(async () => {
    await verifyToken();
    console.log('\n');
    await testPublish();
})();