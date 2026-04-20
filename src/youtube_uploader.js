const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * YouTube Uploader for Musichris Soul
 * Optimized for rich theological metadata.
 */
async function uploadToYouTube(videoPath, soulData) {
    console.log(`🚀 Iniciando subida ministerial: ${soulData.title}...`);
    
    if (!fs.existsSync('credentials.json') || !fs.existsSync('token.json')) {
        console.error('❌ Error: Credenciales faltantes.');
        return null;
    }

    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const token = JSON.parse(fs.readFileSync('token.json'));
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
