const { getSoulDatabase, getNextPendingBackground } = require('./sheet_reader');
const { smartDownload, updateSheetValue, appendSheetRow } = require('./google_connector');
const { generateSubtitleFile } = require('./engine');
const { uploadToYouTube } = require('./youtube_uploader');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- DETECCIÓN HÍBRIDA DE FFmpeg ---
const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";
const georgiaFont = process.env.FONT_PATH || "georgia"; 

async function main() {
    try {
        console.log('🚀 [MusiChris Soul] - PRODUCCIÓN EN LA NUBE v15.3');
        const database = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/promises_developed.json'), 'utf8'));
        
        const targetId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1];
        const footerText = "MUSICHRIS | STUDIO";
        const soulItem = targetId 
            ? database.find(item => item.id == targetId) 
            : database[Math.floor(Math.random() * database.length)];
        
        // METADATOS OPTIMIZADOS PARA EL ALGORITMO DE YOUTUBE (SEO ELITE)
        soulItem.youtube_title = `${soulItem.title.toUpperCase()} - ${soulItem.verse_citation} | Reflexión Cristiana 🕊️ #shorts`;
        
        soulItem.youtube_description = `✨ ${soulItem.reflection_title} ✨\n\n` +
            `"${soulItem.text}"\n\n` +
            `Esta pieza ministerial basada en ${soulItem.verse_citation} ha sido creada para traer paz y esperanza a tu vida. ` +
            `La música y la reflexión se unen en MusiChris Studio para fortalecer tu fe en el camino.\n\n` +
            `🔔 ¡SUSCRÍBETE para recibir tu dosis diaria de esperanza!\n\n` +
            `#MusichrisStudio #ReflexionCristiana #DiosEsAmor #Esperanza #Fe #PromesasDeDios #ChristianMusic #Worship`;
        
        if (!soulItem) throw new Error(`Pieza con ID ${targetId} no encontrada.`);
        if (!soulItem.audio_url || !soulItem.audio_url.startsWith('http')) {
            throw new Error(`La pieza con ID ${soulItem.id} ("${soulItem.reflection_title}") no tiene una URL de audio válida (detectado: "${soulItem.audio_url}"). Por favor, actualiza el Audio Catalog.`);
        }

        console.log(`🎬 PRODUCIENDO: ${soulItem.reflection_title} (ID: ${soulItem.id})`);
        const landscapeInfo = await getNextPendingBackground();
        const backgroundUrl = landscapeInfo.url;
        
        const assetsDir = path.resolve(__dirname, '../assets');
        const outputDir = path.resolve(__dirname, '../output');
        
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const videoPath = path.join(assetsDir, 'background_temp.mp4');
        const audioPath = path.join(assetsDir, 'music_temp.mp3');
        
        const fileName = `SOUL_${soulItem.reflection_title.replace(/[ /?]/g, '_')}_FINAL.mp4`;
        const outputPath = path.join(outputDir, fileName);

        await smartDownload(backgroundUrl, videoPath);
        await smartDownload(soulItem.audio_url, audioPath);
        
        // --- MOTOR GRÁFICO DE ALTA FIDELIDAD (PNG OVERLAYS) ---
        console.log('📝 Generando superposiciones cinematográficas...');
        const p1Card = path.join(assetsDir, 'p1.png');
        const p2Card = path.join(assetsDir, 'p2.png');
        const p3Card = path.join(assetsDir, 'p3.png');
        const creditsCard = path.join(assetsDir, 'credits.png');
        
        // Función para limitar texto y asegurar legibilidad
        const smartLimit = (text, maxChars = 200) => {
            if (!text || text.length <= maxChars) return text;
            // Intentar cortar en el segundo punto seguido
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            if (sentences.length >= 2) {
                const draft = (sentences[0] + sentences[1]).trim();
                if (draft.length <= maxChars + 50) return draft;
            }
            return text.substring(0, maxChars).trim() + "...";
        };

        const runGraphics = (mode, output, title, body) => {
            const result = spawnSync('python3', ['src/graphics_engine.py', mode, output, title, body]);
            if (result.error) console.error(`Error en graphics_engine: ${result.error}`);
            if (result.stderr.length > 0) console.error(`Python Stderr: ${result.stderr.toString()}`);
        };

        // RE-MAPEO NARRATIVO VALIDADO: Contexto/Resumen -> Revelación/Enseñanza -> Esperanza/Idea Central
        console.log('   - Fase 1: Contexto/Resumen (La Promesa)');
        runGraphics('phase1', p1Card, soulItem.verse_citation, smartLimit(soulItem.explanation, 140));
        
        console.log('   - Fase 2: Revelación (Enseñanza Poderosa)');
        runGraphics('phase2', p2Card, "REVELACIÓN", smartLimit(soulItem.text, 140));
        
        console.log('   - Fase 3: Esperanza (Idea Central)');
        const esperanzaText = `"${soulItem.reflection_title}"\n¡Dios tiene el control!`;
        runGraphics('phase3', p3Card, "ESPERANZA", esperanzaText);
        
        console.log('   - Fase 4: Cierre');
        runGraphics('outro', creditsCard, "", "");

        const intermediatePath = path.join(outputDir, 'temp_reflection.mp4');
        const outroPath = path.join(outputDir, 'temp_outro.mp4');
        const logoPath = path.join(assetsDir, 'Logo Hjalmar Animado.mp4');

        // FILTRO PRINCIPAL (CON CARD Y PNG OVERLAYS DINÁMICOS)
        const mainFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.1:contrast=1.1,vignette=angle=0.5 [bg];
            [bg] split [b1][b2];
            [b2] crop=960:1200:(1080-960)/2:(1920-1200)/2, boxblur=25 [blurred];
            [b1][blurred] overlay=(W-w)/2:(H-h)/2 [card_base];
            [card_base] drawbox=y='(ih-1200)/2':x='(iw-960)/2':w=960:h=1200:t=fill:c=black@0.4 [final_bg];
            [final_bg][2:v] overlay=0:0:enable='between(t,2,19.5)' [f1];
            [f1][3:v] overlay=0:0:enable='between(t,20,39.5)' [f2];
            [f2][4:v] overlay=0:0:enable='between(t,40,54.5)'
        `.replace(/\s+/g, ' ').trim();

        console.log('🎞️  Componiendo Cuerpo (55s)...');
        execSync(`"${ffmpegBin}" -y -stream_loop -1 -i "${videoPath}" -ss 60 -i "${audioPath}" -i "${p1Card}" -i "${p2Card}" -i "${p3Card}" -filter_complex "${mainFilter}" -map 0:v -map 1:a -t 55 -r 30 -c:v libx264 -c:a aac -preset fast -pix_fmt yuv420p "${intermediatePath}"`);

        // FILTRO OUTRO (LOGO + PNG CREDITS)
        const outroFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.3:contrast=1.3,vignette=angle=0.6 [bg];
            [1:v] scale=400:400:force_original_aspect_ratio=increase,crop=400:400,setsar=1,
                  geq=lum='p(X,Y)':a='if(gt(sqrt(pow(X-200,2)+pow(Y-200,2)),200),0,255)' [logo];
            [bg][logo] overlay='(W-w)/2':'(H-h)/2-280' [bg_logo];
            [bg_logo][3:v] overlay=0:0
        `.replace(/\s+/g, ' ').trim();

        console.log('🎬 Orquestando Outro (Credits Premium)...');
        execSync(`"${ffmpegBin}" -y -stream_loop -1 -i "${videoPath}" -i "${logoPath}" -i "${audioPath}" -i "${creditsCard}" -filter_complex "${outroFilter}" -map 0:v -map 2:a -t 5 -r 30 -c:v libx264 -c:a aac -pix_fmt yuv420p "${outroPath}"`);

        console.log('🔗 Sincronización Final (Master 60s)...');
        execSync(`"${ffmpegBin}" -y -i "${intermediatePath}" -i "${outroPath}" -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -preset ultrafast "${outputPath}"`);

        await updateSheetValue('1y6GYX2DwjZOJVBwKotKCh3aSVha3K6iQsr5_yG7al88', `Hoja 1!C${landscapeInfo.row}`, 'DONE');

        console.log('📦 ENVIANDO A YOUTUBE...');
        const youtubeId = await uploadToYouTube(outputPath, soulItem);
        const youtubeUrl = `https://youtu.be/${youtubeId}`;

        await appendSheetRow('1y6GYX2DwjZOJVBwKotKCh3aSVha3K6iQsr5_yG7al88', 'Misiones!A:D', [
            new Date().toLocaleString(),
            soulItem.id,
            soulItem.reflection_title,
            youtubeUrl
        ]);

        console.log(`✅ MISIÓN CUMPLIDA EN YOUTUBE: ${youtubeId}`);

    } catch (error) { 
        console.error('❌ ERROR CRÍTICO EN NUBE:', error.message);
        process.exit(1); 
    }
}
main();
