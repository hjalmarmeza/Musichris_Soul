const axios = require('axios');
const config = require('./config');

/**
 * Musichris Soul - Telegram Messenger
 * Sends real-time notifications about production status via HTML.
 */

async function sendSoulNotification(data) {
    const token = process.env.TELEGRAM_TOKEN || config.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || config.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('⚠️ Telegram Token o Chat ID no configurados. Saltando notificación.');
        return;
    }

    const cleanTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const youtubeLink = data.youtube_id ? `\n\n<b>🌍 YouTube:</b> https://youtu.be/${data.youtube_id}` : '';

    const message = `✨ <b>MUSICHRIS SOUL — PRODUCCIÓN ELITE</b> ✨\n\n` +
                    `🎵 <b>Pieza:</b> ${cleanTitle}\n` +
                    `📖 <b>Cita:</b> ${data.verse_citation}\n\n` +
                    `✅ <b>Estado:</b> ¡Publicado y Distribuido!${youtubeLink}`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('📲 Notificación enviada a Telegram.');
    } catch (error) {
        console.error('❌ Error enviando a Telegram:', error.message);
    }
}

module.exports = { sendSoulNotification };
