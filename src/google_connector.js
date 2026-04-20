const { google } = require('googleapis');
const fs = require('fs');
const axios = require('axios');

/**
 * Musichris Soul - Google Cloud Connector
 * Optimized for GitHub Actions (Uses Secrets instead of local files)
 */
async function getAuth() {
    const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;
    const GOOGLE_TOKEN = process.env.GOOGLE_TOKEN;

    if (!GOOGLE_CREDENTIALS || !GOOGLE_TOKEN) {
        throw new Error('❌ Error: Credenciales de Google (Secretos) no configuradas en el entorno.');
    }

    const creds = JSON.parse(GOOGLE_CREDENTIALS);
    const token = JSON.parse(GOOGLE_TOKEN);
    
    const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials(token);
    return auth;
}

async function smartDownload(url, outputPath) {
    if (url.includes('drive.google.com') || url.includes('/uc?')) {
        return downloadDriveFile(url, outputPath);
    }
    
    console.log(`🌐 [HTTP-DL] Descargando de servidor externo: ${url.substring(0, 50)}...`);
    const response = await axios({ method: 'get', url: url, responseType: 'stream' });

    return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(outputPath);
        response.data.pipe(dest).on('finish', () => resolve(outputPath)).on('error', reject);
    });
}

async function downloadDriveFile(fileUrl, outputPath) {
    const auth = await getAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    let fileId = '';
    const match = fileUrl.match(/\/d\/([\w-]+)/) || fileUrl.match(/id=([\w-]+)/);
    if (match) fileId = match[1];
    else throw new Error("ID de Google Drive no encontrado: " + fileUrl);

    const dest = fs.createWriteStream(outputPath);
    const res = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' });

    return new Promise((resolve, reject) => {
        res.data.pipe(dest).on('finish', () => resolve(outputPath)).on('error', reject);
    });
}

async function getSoulSheetsData(spreadsheetId, range) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return res.data.values || [];
}

async function updateSheetValue(spreadsheetId, range, value) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values: [[value]] }
    });
}

async function appendSheetRow(spreadsheetId, range, values) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    console.log(`📝 Registrando Victoria en: ${range}...`);
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
    });
}

async function uploadToYouTube(videoPath, soulItem) {
    const auth = await getAuth();
    const youtube = google.youtube({ version: 'v3', auth });
    
    console.log('[YOUTUBE] Iniciando subida de video ministerial:', soulItem.reflection_title);
    
    const fileSize = fs.statSync(videoPath).size;
    const res = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: `${soulItem.reflection_title} | MusiChris Soul 🕊️`,
                description: `Soberanía Ministerial: ${soulItem.reflection_title}\nCita: ${soulItem.verse_citation}\n\nExplora tu fe con MusiChris Soul.`,
                categoryId: '10'
            },
            status: {
                privacyStatus: 'private', 
                selfDeclaredMadeForKids: false
            }
        },
        media: {
            body: fs.createReadStream(videoPath)
        }
    }, {
        onUploadProgress: evt => {
            const progress = (evt.bytesRead / fileSize) * 100;
            process.stdout.write(`\r[YOUTUBE] Progreso de Subida: ${Math.round(progress)}%`);
        }
    });
    
    console.log('\n[YOUTUBE] ¡Subida exitosa! YouTube ID:', res.data.id);
    return res.data.id;
}

module.exports = { smartDownload, getSoulSheetsData, updateSheetValue, appendSheetRow, uploadToYouTube };
