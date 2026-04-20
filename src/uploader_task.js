const { uploadToYouTube } = require('./google_connector');
const path = require('path');

async function runUpload() {
    const videoPath = path.resolve(__dirname, '../output/SOUL_Victoria_sobre_la_muerte_FINAL.mp4');
    const title = "Victoria sobre la muerte";
    const description = `✨ MUSICHRIS SOUL ✨\n\n"Dios que libra de la muerte" 🕊️\n\n📖 Una nota de vida para tu alma.\n\n#MusichrisSoul #Worship #Paz #Fe #ChristianMusic`;

    try {
        console.log('📡 [TASK] Iniciando subida solicitada por Hjalmar...');
        const result = await uploadToYouTube(videoPath, title, description);
        console.log(`\n✅ [ÉXITO] El video ya está en YouTube!`);
        console.log(`🔗 Ver aquí: https://youtu.be/${result.id}`);
    } catch (error) {
        console.error('❌ Error en la subida:', error.message);
    }
}

runUpload();
