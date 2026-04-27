const { getSoulSheetsData } = require('./google_connector');

// Utility for human-like title matching (ignores v2, v3, punctuation, casing, and accents)
const smartNormalize = (s) => {
    if (!s) return '';
    return s.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar tildes
        .replace(/\s+v\d+$/i, '')                       // Quitar " v2", " v1" al final
        .replace(/\((.*?)\)/g, '')                      // Quitar todo lo entre paréntesis
        .replace(/[^a-z0-9]/g, '')                      // Quitar TODO lo que no sea letra o número
        .trim();
};

async function getSoulDatabase() {
    console.log('📡 [API-MASTER-SYNC] Sincronizando Ecosistema Elite...');
    const audioCatalog = await getSoulSheetsData('19zXfliAZktXYixZ1HdcW1IO9bOBn8S8sRPZAXUVZbE', 'Hoja 2!A:E');
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

    const normalizedCatalog = audioCatalog.map(ac => ({
        original: ac[idxTitleAud],
        clean: smartNormalize(ac[idxTitleAud]),
        row: ac
    }));

    return theologyMaster.slice(1).map(theo => {
        const songTitle = (theo[idxTitleTheo] || '').trim();
        if (!songTitle) return null;

        const cleanTarget = smartNormalize(songTitle);
        const audioMatch = normalizedCatalog.find(nc => nc.clean === cleanTarget || cleanTarget.includes(nc.clean) || nc.clean.includes(cleanTarget));
        
        if (!audioMatch) return null;

        return {
            title: songTitle,
            reflection_title: theo[idxThemeTheo] || 'Nota de Vida',
            verse_citation: (theo[idxVerseTheo] || '').split(/[,;\/]/)[0].trim(), // Solo la primera cita (soporta , ; /)
            text: theo[idxContentTheo] || '',
            explanation: theo[idxContextTheo] || '',
            audio_url: audioMatch.row[idxUrlAud]
        };
    }).filter(i => i && i.audio_url);
}

async function getNextPendingBackground() {
    console.log('📡 [API-SHEETS] Buscando paisaje real en Hoja Soul...');
    const backgrounds = await getSoulSheetsData('1y6GYX2DwjZOJVBwKotKCh3aSVha3K6iQsr5_yG7al88', 'Hoja 1!A:E');
    
    // Buscamos el primero que diga 'pending' y tenga URL válida
    for (let i = 1; i < backgrounds.length; i++) {
        const url = (backgrounds[i][1] || '').trim();
        const status = (backgrounds[i][2] || '').toLowerCase();
        
        if (status === 'pending' && url.startsWith('http')) {
            return {
                url: url,
                row: i + 1 
            };
        }
    }
    
    // Si no hay pendientes válidos, buscamos CUALQUIERA que tenga URL (fila 2 en adelante)
    for (let i = 1; i < backgrounds.length; i++) {
        const url = (backgrounds[i][1] || '').trim();
        if (url.startsWith('http')) return { url: url, row: i + 1 };
    }

    throw new Error("No se encontraron paisajes con URLs válidas en la Hoja de Soul.");
}

module.exports = { getSoulDatabase, getNextPendingBackground };
