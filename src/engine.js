const fs = require('fs');
const path = require('path');

/**
 * Musichris Soul - Cinematic Engine v16.0 (THE DIAMOND FLOW)
 * Sistema de 4 Fases: Hecho, Revelación, Enseñanza y Cierre.
 */
async function generateSubtitleFile(data) {
    const templatePath = path.join(__dirname, '../templates/style.ass');
    let template = fs.readFileSync(templatePath, 'utf8');

    const footerText = "MUSICHRIS | NOTA DE VIDA";
    const decorativeLine = "{\\fsp-5}————————————";

    const firstVerse = data.verse_citation.split(/[,;]/)[0].trim();

    // Generar secuencia de eventos para un flujo de 60 segundos con 3 diapositivas de contenido
    const events = [
        // Caja de fondo (Card)
        `Dialogue: 0,0:00:00.00,0:00:55.00,Card,,0,0,0,,{\\fad(500,500)} `,
        
        // FASE 1: EL HECHO / LA VISIÓN (2s - 19s)
        `Dialogue: 1,0:00:02.00,0:00:19.00,MainText,,0,0,0,,{\\fad(600,600)}${formatText(data.text || '', 24)}`,
        `Dialogue: 1,0:00:02.00,0:00:19.00,Citation,,0,0,0,,{\\fad(800,800)}${decorativeLine}\\N${firstVerse}`,
        
        // FASE 2: LA REVELACIÓN (Dato Maestro) (20s - 39s)
        `Dialogue: 1,0:00:20.00,0:00:39.00,MainText,,0,0,0,,{\\fad(600,600)}${formatText(data.explanation || '', 24)}`,
        `Dialogue: 1,0:00:20.00,0:00:39.00,Citation,,0,0,0,,{\\fad(800,800)}${decorativeLine}\\NREVELACIÓN`,

        // FASE 3: LA ENSEÑANZA / IMPACTO (40s - 54s)
        `Dialogue: 1,0:00:40.00,0:00:54.00,MainText,,0,0,0,,{\\fad(600,600)}${formatText(data.teaching || 'Dios tiene un propósito eterno para tu vida hoy.', 24)}`,
        `Dialogue: 1,0:00:40.00,0:00:54.00,Citation,,0,0,0,,{\\fad(800,800)}${decorativeLine}\\NENSEÑANZA`,

        // Pie de página
        `Dialogue: 2,0:00:01.00,0:00:55.00,Footer,,0,0,0,,{\\fad(2000,0)}${footerText}`
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
