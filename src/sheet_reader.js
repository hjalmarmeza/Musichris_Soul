const { getSoulSheetsData } = require('./google_connector');

async function getSoulDatabase() {
    console.log('📡 [API-MASTER-SYNC] Sincronizando Ecosistema Elite...');
    const audioCatalog = await getSoulSheetsData('19zXfIiAZktXXyixZ1HdcW1IO9bOBn8S8sRPZAXUVZbE', 'Hoja 2!A:E');
    const theologyMaster = await getSoulSheetsData('1oTVSF7CjrCtnk3pHdBIRE8gzhE9zKDM5NJFyWV-qsJs', 'Hoja 4!A:L');

    if (!theologyMaster.length) return [];
    
    // Índices Maestros
    const idxTitleTheo = 1;      // Título
    const idxThemeTheo = 7;      // Temática Central
    const idxVerseTheo = 2;      // Verso Bíblico
    const idxContentTheo = 4;    // Contenido Bíblico
    const idxContextTheo = 3;    // Contexto Histórico
    const idxTitleAud = 2;       // Título en Audio Catalog (Col C)
    const idxUrlAud = 3;         // URL en Audio Catalog (Col D)

    return theologyMaster.slice(1).map(theo => {
        const songTitle = (theo[idxTitleTheo] || '').trim();
        if (!songTitle) return null;

        const audioData = audioCatalog.find(c => (c[idxTitleAud] || '').trim().toLowerCase() === songTitle.toLowerCase());
        if (!audioData) return null;

        return {
            title: songTitle,
            reflection_title: theo[idxThemeTheo] || 'Nota de Vida',
            verse_citation: (theo[idxVerseTheo] || '').split(/[,;\/]/)[0].trim(), // Solo la primera cita (soporta , ; /)
            text: theo[idxContentTheo] || '',
            explanation: theo[idxContextTheo] || '',
            audio_url: audioData[idxUrlAud]
        };
    }).filter(i => i && i.audio_url);
}

async function getNextPendingBackground() {
    console.log('📡 [API-SHEETS] Buscando paisaje real en Hoja Soul...');
    const backgrounds = await getSoulSheetsData('1y6GYX2DwjZOJVBwKotKCh3aSVha3K6iQsr5_yG7al88', 'Hoja 1!A:E');
    
    // Buscamos el primero que diga 'pending' (ignorando encabezado)
    for (let i = 1; i < backgrounds.length; i++) {
        if ((backgrounds[i][2] || '').toLowerCase() === 'pending') {
            return {
                url: backgrounds[i][1],
                row: i + 1 // Guardamos la fila real para marcarla como DONE luego
            };
        }
    }
    
    // Si no hay pendientes, devolvemos el primero como fallback (fila 2)
    return { url: backgrounds[1][1], row: 2 }; 
}

module.exports = { getSoulDatabase, getNextPendingBackground };
