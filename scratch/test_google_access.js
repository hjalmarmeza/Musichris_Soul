const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testAccess() {
    console.log('🔍 Iniciando Diagnóstico de Acceso...');
    
    const credsPath = path.join(__dirname, '../credentials.json');
    const tokenPath = path.join(__dirname, '../token.json');
    
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    
    const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials(token);
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const ids = [
        { name: 'DB_Musichris_app (Audio)', id: '19zXfliAZktXYixZ1HdcW1IO9bOBn8S8sRPZAXUVZbE' },
        { name: 'Theology Sheet (Contexto)', id: '1oTVSF7CjrCtnk3pHdBIRE8gzhE9zKDM5NJFyWV-qsJs' }
    ];

    for (const item of ids) {
        try {
            console.log(`\n⏳ Probando acceso a: ${item.name}...`);
            const res = await sheets.spreadsheets.get({ spreadsheetId: item.id });
            console.log(`✅ ¡ÉXITO! Título: ${res.data.properties.title}`);
        } catch (err) {
            console.log(`❌ ERROR en ${item.name}: ${err.message}`);
        }
    }
}

testAccess();
