const { getSoulDatabase } = require('./sheet_reader');
const fs = require('fs');
const path = require('path');

/**
 * Musichris Soul - JSON Synchronizer
 * Downloads data from Google Sheets and updates promises.json
 */

async function syncSheetsToJson() {
    console.log('🔄 Iniciando sincronización de Hoja de Cálculo a JSON...');
    
    try {
        const soulDatabase = await getSoulDatabase();
        if (soulDatabase.length === 0) {
            console.error('❌ No se pudo obtener información de las hojas. Revisa las URLs en config.js');
            return;
        }

        const jsonPath = path.join(__dirname, '../data/promises_developed.json');
        
        // Transformar al formato que espera el engine (con IDs y conteo de videos)
        const formattedData = soulDatabase.map((item) => ({
            id: item.id,
            title: item.title,
            reflection_title: item.reflection_title || item.title,
            verse_citation: item.verse_citation,
            text: item.text,
            explanation: item.explanation,
            audio_url: item.audio_url,
            video_count: item.video_count || 0
        }));

        fs.writeFileSync(jsonPath, JSON.stringify(formattedData, null, 2));

        console.log(`\n✨ ¡ÉXITO! Se han sincronizado ${formattedData.length} versos basados en tus canciones.`);
        console.log(`📂 Archivo actualizado en: ${jsonPath}`);
        console.log('🚀 Ahora tu app usará exclusivamente tus datos ministeriales.');

    } catch (error) {
        console.error('❌ Error fatal en la sincronización:', error.message);
    }
}

if (require.main === module) {
    syncSheetsToJson();
}

module.exports = { syncSheetsToJson };
