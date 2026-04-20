const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * YouTube Uploader for Musichris Soul
 * Optimized for rich theological metadata.
 */
async function uploadToYouTube(videoPath, soulData) {
    console.log(`🚀 Iniciando subida ministerial: ${soulData.reflection_title}...`);
    
    // --- LÓGICA DE NUBE: USAR SECRETOS ---
    const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;
    const GOOGLE_TOKEN = process.env.GOOGLE_TOKEN;

    if (!GOOGLE_CREDENTIALS || !GOOGLE_TOKEN) {
        throw new Error('❌ Error: Credenciales de Google (Secretos) no configuradas.');
    }

    const credentials = JSON.parse(GOOGLE_CREDENTIALS);
    const token = JSON.parse(GOOGLE_TOKEN);

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

    try {
        const res = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: soulData.youtube_title || `${soulData.title} | MusiChris Soul`,
                    description: soulData.youtube_description || 'Explora tu fe con Musichris Soul.',
                    categoryId: '10',
                    tags: ['MusichrisSoul', 'Devocional', 'Fe'],
                },
                status: {
                    privacyStatus: 'private',
                    selfDeclaredMadeForKids: false,
                },
            },
            media: {
                body: fs.createReadStream(videoPath),
            },
        });

        console.log(`✅ Vídeo subido con éxito. ID: ${res.data.id}`);
        return res.data.id;

    } catch (error) {
        console.error('❌ Error en YouTube:', error.message);
        throw error;
    }
}

module.exports = { uploadToYouTube };
