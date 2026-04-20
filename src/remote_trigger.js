const axios = require('axios');
const { exec } = require('child_process');
const config = require('./config');

/**
 * MUSICHRIS SOUL — REMOTE TRIGGER SCRIPT (V2 - ULTRA-SENSITIVE)
 * Dejar corriendo en el Mac para procesar órdenes del móvil.
 */

const TOKEN = config.TELEGRAM_TOKEN;
let lastUpdateId = -1; // -1 Para saltar mensajes antiguos y empezar de cero

console.log('🚀 [Master Listener] - Iniciando Motor de Escucha Remota...');
console.log('📡 Estado: Conectando con tu Bot de Telegram...');

async function checkTelegram() {
    try {
        // Usamos offset para obtener solo los mensajes nuevos a partir de ahora
        const url = `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}&limit=1&timeout=20`;
        const response = await axios.get(url);
        const updates = response.data.result;

        if (updates.length > 0) {
            for (const update of updates) {
                lastUpdateId = update.update_id;
                if (!update.message) continue;

                const message = update.message.text || '';
                console.log(`📩 Mensaje recibido: "${message}"`);

                if (message.startsWith('[SOUL_TRIGGER]:')) {
                    const songId = message.split(':')[1].trim();
                    console.log(`🔥 ¡ORDEN DE MISIÓN DETECTADA! Procesando ID: ${songId}`);
                    
                    // Notificar que empezamos
                    console.log('⚙️  Encendiendo FFmpeg y Google Connectors...');

                    exec(`node src/main.js --id=${songId}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`❌ ERROR CRÍTICO EN MAC: ${error.message}`);
                            return;
                        }
                        if (stderr) console.warn(`⚠️ Aviso: ${stderr}`);
                        console.log(`✅ PRODUCCIÓN FINALIZADA EXITOSAMENTE:\n${stdout}`);
                        console.log('----------------------------------------------------');
                        console.log('📡 Esperando siguiente orden...');
                    });
                }
            }
        }
    } catch (error) {
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            // Silencioso para errores de conexión comunes
        } else {
            console.error('⚠️ Error de comunicación:', error.message);
        }
    }
    
    // Polling rápido para respuesta inmediata
    setTimeout(checkTelegram, 1000);
}

// Inicializar el offset al mensaje más reciente para no procesar basura antigua
async function init() {
    try {
        const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=-1`);
        if (res.data.result.length > 0) {
            lastUpdateId = res.data.result[0].update_id;
        }
        console.log('✅ Conectado y Sincronizado. Tu Mac está LISTO para recibir órdenes del móvil.');
        checkTelegram();
    } catch (e) {
        console.error('❌ Error fatal al iniciar: Revisa tu conexión o el Token en config.js');
    }
}

init();
