const fs = require('fs');
const path = require('path');

/**
 * Musichris Soul - Cinematic Engine v15.0
 * EFICIENCIA VISUAL: Resumen de fase y ajuste de interlineado.
 */
async function generateSubtitleFile(data) {
    const templatePath = path.join(__dirname, '../templates/style.ass');
    let template = fs.readFileSync(templatePath, 'utf8');

    const footerText = "MUSICHRIS | NOTA DE VIDA";
    const decorativeLine = "{\\fsp-5}————————————";

    const firstVerse = data.verse_citation.split(/[,;]/)[0].trim();

    // Generar secuencia de eventos para un flujo de 60 segundos
    const events = [
        // Caja de fondo (Card)
        `Dialogue: 0,0:00:00.00,0:00:55.00,Card,,0,0,0,,{\\fad(500,500)} `,
        
        // FASE 1: Reflexión / Mensaje (2s - 25s)
        `Dialogue: 1,0:00:02.00,0:00:25.00,MainText,,0,0,0,,{\\fad(800,800)}${formatText(data.text, 25)}`,
        `Dialogue: 1,0:00:02.00,0:00:25.00,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\N${firstVerse}`,
        
        // FASE 2: Revelación Teológica (Contexto) (26s - 54s)
        `Dialogue: 1,0:00:26.00,0:00:54.00,MainText,,0,0,0,,{\\fad(800,800)}${formatText(data.explanation, 25)}`,
        `Dialogue: 1,0:00:26.00,0:00:54.00,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\N${data.reflection_title}`,

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
    return lines.join('\\N'); // REDUCIDO A UN SOLO SALTO para evitar que se escape de pantalla
}

module.exports = { generateSubtitleFile };
