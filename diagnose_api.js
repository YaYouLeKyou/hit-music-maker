require('dotenv').config();
const fetch = require('node-fetch');

const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '';
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';
const IG_USER_ID = process.env.INSTAGRAM_ACCOUNT_ID || '';
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function log(...args) { console.log('[DIAG]', ...args); }
async function error(...args) { console.error('[DIAG][ERREUR]', ...args); }

async function testFacebookToken() {
    log('=== TEST FaceBUG TOKEN ===');
    log('Page ID:', FB_PAGE_ID || 'NON CONFIGURÉ');
    log('Token:', FB_PAGE_ACCESS_TOKEN ? 'PRÉSENT (' + FB_PAGE_ACCESS_TOKEN.substring(0, 20) + '...)' : 'MANQUANT');
    
    try {
        const res = await fetch(`${GRAPH_BASE}/debug_token?input_token=${FB_PAGE_ACCESS_TOKEN}&access_token=${FB_PAGE_ACCESS_TOKEN}`);
        const data = await res.json();
        
        if (!res.ok || data.error) {
            throw new Error(data.error?.message || 'Erreur API');
        }
        
        log('Token valide:', data.data?.is_valid);
        log('Expire dans:', data.data?.expires_in ? `${Math.floor(data.data.expires_in / 3600)}h ${Math.floor((data.data.expires_in % 3600) / 60)}m` : 'Jamais');
        log('Scopes:', data.data?.scopes?.join(', ') || 'Non disponible');
        
        return true;
    } catch (err) {
        error('Token Facebook invalide:', err.message);
        return false;
    }
}

async function testFacebookPage() {
    log('=== TEST PAGE FACEBOOK ===');
    
    try {
        const res = await fetch(`${GRAPH_BASE}/${FB_PAGE_ID}?access_token=${FB_PAGE_ACCESS_TOKEN}&fields=name,id`);
        const data = await res.json();
        
        if (!res.ok || data.error) {
            throw new Error(data.error?.message || 'Erreur API');
        }
        
        log('Page access:', data.name);
        log('ID:', data.id);
        
        return true;
    } catch (err) {
        error('Impossible d\'accéder à la page:', err.message);
        return false;
    }
}

async function testInstagramAccount() {
    log('=== TEST COMPTE INSTAGRAM ===');
    log('Account ID:', IG_USER_ID || 'NON CONFIGURÉ');
    log('Token:', IG_ACCESS_TOKEN ? 'PRÉSENT (' + IG_ACCESS_TOKEN.substring(0, 20) + '...)' : 'MANQUANT');
    
    try {
        const res = await fetch(`https://graph.instagram.com/${IG_USER_ID}?access_token=${IG_ACCESS_TOKEN}&fields=name,username,account_type`);
        const data = await res.json();
        
        if (!res.ok || data.error) {
            throw new Error(data.error?.message || 'Erreur API');
        }
        
        log('Compte:', data.name);
        log('Username:', data.username);
        log('Type:', data.account_type);
        
        return true;
    } catch (err) {
        error('Impossible d\'accéder au compte Instagram:', err.message);
        return false;
    }
}

async function testImageUpload(urlImg) {
    log('=== TEST UPLOAD IMAGE ===');
    log('URL testée:', urlImg);
    
    try {
        const res = await fetch(urlImg, { method: 'HEAD' });
        log('Image accessible:', res.ok, `(${res.status})`);
        log('Content-Type:', res.headers.get('content-type'));
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        return true;
    } catch (err) {
        error('Image inaccessible:', err.message);
        return false;
    }
}

async function testFacebookPublication() {
    log('=== TEST PUBLICATION FACEBOOK ===');
    
    const testCaption = 'TEST: Publication de diagnostic');
    
    try {
        const res = await fetch(`${GRAPH_BASE}/${FB_PAGE_ID}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                message: testCaption,
                access_token: FB_PAGE_ACCESS_TOKEN
            })
        });
        
        const data = await res.json();
        
        if (!res.ok || data.error) {
            throw new Error(data.error?.message || JSON.stringify(data));
        }
        
        log('Publication réussie! Post ID:', data.id);
        log('Lien: https://facebook.com/' + data.id);
        
        return { success: true, id: data.id };
    } catch (err) {
        error('Échec publication:', err.message);
        return { success: false, error: err.message };
    }
}

async function runAllTests() {
    log('Démarrage diagnostic API...');
    log('');
    
    const fbTokenOk = await testFacebookToken();
    const fbPageOk = FB_PAGE_ID ? await testFacebookPage() : false;
    const igOk = await testInstagramAccount();
    const imgOk = await testImageUpload('https://picsum.photos/800/800');
    
    log('');
    log('=== RÉSUMÉ ===');
    log(`Facebook Token: ${fbTokenOk ? '✓ OK' : '✗ ÉCHOUÉ'}`);
    log(`Facebook Page: ${fbPageOk ? '✓ OK' : '✗ ÉCHOUÉ'}`);
    log(`Instagram Compte: ${igOk ? '✓ OK' : '✗ ÉCHOUÉ'}`);
    log(`Image Test: ${imgOk ? '✓ OK' : '✗ ÉCHOUÉ'}`);
    
    log('');
    if (fbTokenOk && fbPageOk) {
        log('--- Publication de test Facebook ---');
        await testFacebookPublication();
        await delay(2000);
    }
    
    log('');
    log('Diagnostic terminé.');
}

runAllTests().catch(err => {
    error('Erreur critique:', err);
    process.exit(1);
});