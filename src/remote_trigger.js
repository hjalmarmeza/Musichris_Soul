const axios = require('axios');
const { exec } = require('child_process');
const config = require('./config');

/**
 * MUSICHRIS SOUL — REMOTE TRIGGER SCRIPT
 * Dejar corriendo en el Mac para procesar órdenes del móvil.
 */

const TOKEN = config.TELEGRAM_TOKEN;
let lastUpdateId = 0;

console.log('📡 [Remote Trigger] - Escuchando órdenes ministeriales...');

async function checkTelegram() {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const updates = response.data.result;

        for (const update of updates) {
            lastUpdateId = update.update_id;
            const message = update.message ? update.message.text : '';

            // Detectamos el comando del móvil
            if (message && message.startsWith('[SOUL_TRIGGER]:')) {
                const songId = message.split(':')[1].trim();
                console.log(`🚀 ¡ORDEN RECIBIDA! Iniciando producción para ID: ${songId}`);
                
                // Ejecutamos el motor principal con el ID solicitado
                exec(`node src/main.js --id=${songId}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ Error en producción: ${error.message}`);
                        return;
                    }
                    console.log(`✅ Producción finalizada:\n${stdout}`);
                });
            }
        }
    } catch (error) {
        console.error('⚠️ Error conectando con Telegram (reintentando...):', error.message);
    }
    
    // Polling infinito
    setTimeout(checkTelegram, 3000);
}

checkTelegram();
