const fs = require('fs');
const path = require('path');

/**
 * Musichris Soul - Cinematic Engine v18.3 (DIAMOND VISIBILITY)
 * Blindaje total para que las 4 fases brillen con luz propia.
 */
async function generateSubtitleFile(data) {
    const templatePath = path.join(__dirname, '../templates/style.ass');
    let template = fs.readFileSync(templatePath, 'utf8');

    const footerText = "MUSICHRIS | NOTA DE VIDA";
    const decorativeLine = "{\\fsp-5}————————————";

    const firstVerse = data.verse_citation.split(/[,;]/)[0].trim();

    // Usamos diferentes CAPAS (Layers) para cada fase para evitar que FFmpeg oculte texto accidentalmente
    const events = [
        `Dialogue: 0,0:00:00.00,0:01:05.00,Card,,0,0,0,,{\\fad(500,500)} `,
        
        // FASE 1: EL HECHO (Capa 1)
        `Dialogue: 1,0:00:02.00,0:00:19.50,MainText,,0,0,0,,{\\fad(800,800)}${formatText(data.text || '', 24)}`,
        `Dialogue: 1,0:00:02.00,0:00:19.50,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\N${firstVerse}`,
        
        // FASE 2: LA REVELACIÓN (Capa 2 - Empezamos 0.5s después para limpiar pantalla)
        `Dialogue: 2,0:00:20.00,0:00:39.50,MainText,,0,0,0,,{\\fad(800,800)}${formatText(data.explanation || '', 24)}`,
        `Dialogue: 2,0:00:20.00,0:00:39.50,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\NREVELACIÓN`,

        // FASE 3: LA ENSEÑANZA (Capa 3)
        `Dialogue: 3,0:00:40.00,0:00:54.50,MainText,,0,0,0,,{\\fad(800,800)}{\\c&H00FFFF&}${formatText(data.teaching || '', 24)}`,
        `Dialogue: 3,0:00:40.00,0:00:54.50,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\NESPERANZA`,

        // FASE 4: EL CIERRE (Capa 1 - Posición fija central)
        `Dialogue: 1,0:00:55.00,0:01:04.00,Footer,,0,0,0,,{\\fad(800,800)}{\\an5\\pos(540,1650)}@Musichris_Studio\\N{\\fscx85\\fscy85}¡Caminemos juntos en fe!\\N{\\fscx75\\fscy75\\c&H00FFFF&}Suscríbete ahora para más reflexiones`,

        // Pie de página constante
        `Dialogue: 5,0:00:01.00,0:00:54.50,Footer,,0,0,0,,{\\fad(2000,0)}${footerText}`
    ];

    const finalContent = template + events.join('\n');
    const assPath = path.join(__dirname, '../assets/current_production.ass');
    fs.writeFileSync(assPath, finalContent);
    return assPath;
}

function formatText(text, maxChars) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    words.forEach(word => {
        if ((currentLine + word).length > maxChars) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    lines.push(currentLine.trim());
    return lines.join('\\N'); 
}

module.exports = { generateSubtitleFile };
