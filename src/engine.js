const fs = require('fs');
const path = require('path');

/**
 * Musichris Soul - Cinematic Engine v14.0 (Retorno a 60s Profundos)
 */
async function generateSubtitleFile(data) {
    const templatePath = path.join(__dirname, '../templates/style.ass');
    let template = fs.readFileSync(templatePath, 'utf8');

    const footerText = "MUSICHRIS | NOTA DE VIDA";
    const decorativeLine = "{\\fsp-5}————————————";

    // Tomar solo la primera cita si hay varias (separadas por coma o punto y coma)
    const firstVerse = data.verse_citation.split(/[,;]/)[0].trim();

    // Generar secuencia de eventos para un flujo de 60 segundos
    const events = [
        // La CAJA oscura de fondo que dura casi todo el video
        `Dialogue: 0,0:00:00.00,0:00:55.00,Card,,0,0,0,,{\\fad(500,500)} `,
        
        // FASE 1: Verso Bíblico (2s - 25s) - Más tiempo para leer
        `Dialogue: 1,0:00:02.00,0:00:25.00,MainText,,0,0,0,,{\\fad(800,800)}${formatText(data.text, 28)}`,
        `Dialogue: 1,0:00:02.00,0:00:25.00,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\N${firstVerse}`,
        
        // FASE 2: Contexto / Reflexión (26s - 54s)
        `Dialogue: 1,0:00:26.00,0:00:54.00,MainText,,0,0,0,,{\\fad(800,800)}${formatText(data.explanation, 30)}`,
        `Dialogue: 1,0:00:26.00,0:00:54.00,Citation,,0,0,0,,{\\fad(1000,1000)}${decorativeLine}\\N${data.reflection_title}`,

        // Pie de página constante
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
    return lines.join('\\N\\N'); // Mantenemos el interlineado amplio solicitado
}

module.exports = { generateSubtitleFile };
