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
        
        const runGraphics = (mode, output, title, body) => {
            const result = spawnSync('python3', ['src/graphics_engine.py', mode, output, title, body]);
            if (result.error) console.error(`Error en graphics_engine: ${result.error}`);
            if (result.stderr.length > 0) console.error(`Python Stderr: ${result.stderr.toString()}`);
        };

        // LIMPIEZA DE TEXTO MULTI-LÍNEA Y PODA MAESTRA (Protocolo Flow v7.0)
        const processText = (txt, limit = 120) => {
            if (!txt) return "";
            
            // 1. UNIFICAR: Eliminar saltos de línea y espacios múltiples (v7.0 Heavy Duty)
            let clean = txt.replace(/[\s\n\r]+/g, " ").trim();
            
            // 2. ELIMINACIÓN DE BLOQUE: El regex ahora busca el bloque completo de preámbulo
            // Atrapa desde 'El sobrescrito' hasta el final de la mención al desierto o David.
            const preamblePattern = /El sobr?eescrito del salmo dice:?\s*["']?.*?(?:desierto de Judá|Salmo de David).*?["']?\.?\s*/gi;
            clean = clean.replace(preamblePattern, "");
            
            // 3. LIMPIEZA ADICIONAL: Eliminar "Salmo de David" si quedó suelto
            clean = clean.replace(/Salmo de David,?\s*/gi, "");
            
            // 4. PODA: Cortar a 120 caracteres para máxima legibilidad
            if (clean.length > limit) {
                const truncated = clean.substring(0, limit);
                const lastSpace = truncated.lastIndexOf(" ");
                return truncated.substring(0, lastSpace > 0 ? lastSpace : limit).trim() + "...";
            }
            return clean;
        };

        const contextText = processText(soulItem.explanation);
        const revelationText = processText(soulItem.text);
        
        // Mensaje de Esperanza Inspirador (Una sola idea fluida, sin emojis problemáticos)
        const pureReflection = soulItem.reflection_title.split('/')[0].trim();
        const hopeMsg = `En medio de tu ${pureReflection.toLowerCase()}, Su gracia te sostiene. Tu victoria viene de lo alto!`;

        const timestamp = Date.now();
        const p1Card = path.join(process.cwd(), `p1_${timestamp}.png`);
        const p2Card = path.join(process.cwd(), `p2_${timestamp}.png`);
        const p3Card = path.join(process.cwd(), `p3_${timestamp}.png`);
        const creditsCard = path.join(process.cwd(), `credits_${timestamp}.png`);

        const phases = {
            p1: { title: soulItem.verse_citation, body: contextText },
            p2: { title: "REVELACIÓN", body: revelationText },
            p3: { title: "ESPERANZA", body: hopeMsg }
        };
        
        runGraphics('phase1', p1Card, phases.p1.title, phases.p1.body);
        runGraphics('phase2', p2Card, phases.p2.title, phases.p2.body);
        runGraphics('phase3', p3Card, phases.p3.title, phases.p3.body);
        runGraphics('outro', creditsCard, "", "");

        const intermediatePath = path.join(outputDir, 'temp_reflection.mp4');
        const outroPath = path.join(outputDir, 'temp_outro.mp4');
        const logoPath = path.join(assetsDir, 'Logo Hjalmar Animado.mp4');

        // FILTRO PRINCIPAL (CON CARD Y PNG OVERLAYS DINÁMICOS)
        const mainFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.1:contrast=1.1,vignette=angle=0.5 [bg];
            [bg] split [b1][b2];
            [b2] crop=900:1100:(1080-900)/2:(1920-1100)/2, boxblur=25 [blurred];
            [b1][blurred] overlay=(W-w)/2:(H-h)/2 [card_base];
            [card_base] drawbox=y='(ih-1100)/2':x='(iw-900)/2':w=900:h=1100:t=fill:c=black@0.4 [final_bg];
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
