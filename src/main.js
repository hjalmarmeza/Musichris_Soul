const { getSoulDatabase, getNextPendingBackground } = require('./sheet_reader');
const { smartDownload, updateSheetValue } = require('./google_connector');
const { generateSubtitleFile } = require('./engine');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- DETECCIÓN HÍBRIDA DE FFmpeg ---
let ffmpegBin = "/Users/hjalmarmeza/Library/Application Support/JDownloader 2/tools/mac/ffmpeg_10.10+/ffmpeg";
if (!fs.existsSync(ffmpegBin)) {
    ffmpegBin = "ffmpeg"; // Fallback para GitHub Actions o sistema
}
const georgiaFont = "/System/Library/Fonts/Supplemental/Georgia.ttf";

async function main() {
    try {
        console.log('🚀 [MusiChris Soul] - PRODUCCIÓN DE GRADO SHORT-SOVEREIGN v15.0');
        const database = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/promises_developed.json'), 'utf8'));
        if (database.length === 0) throw new Error("Base de datos vacía. Revisa conexiones API.");
        
        // --- NUEVA LÓGICA DE CONTROL REMOTO ---
        const targetId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1];
        const soulItem = targetId 
            ? database.find(item => item.id == targetId) 
            : database[Math.floor(Math.random() * database.length)];
        
        if (!soulItem) throw new Error(`Pieza con ID ${targetId} no encontrada.`);

        console.log(`🎬 PRODUCIENDO: ${soulItem.reflection_title} (ID: ${soulItem.id})`);
        const landscapeInfo = await getNextPendingBackground();
        const backgroundUrl = landscapeInfo.url;
        
        const assetsDir = path.resolve(__dirname, '../assets');
        const outputDir = path.resolve(__dirname, '../output');
        const videoPath = path.join(assetsDir, 'background_temp.mp4');
        const audioPath = path.join(assetsDir, 'music_temp.mp3');
        
        const fileName = `SOUL_${soulItem.reflection_title.replace(/[ /?]/g, '_')}_FINAL.mp4`;
        const outputPath = path.join(outputDir, fileName);

        console.log(`🌿 Obteniendo Paisaje Real: ${backgroundUrl.substring(0, 50)}...`);
        await smartDownload(backgroundUrl, videoPath);
        console.log(`🎶 Obteniendo Audio Ministerial: ${soulItem.audio_url.substring(0, 50)}...`);
        await smartDownload(soulItem.audio_url, audioPath);
        
        await generateSubtitleFile(soulItem);

        const intermediatePath = path.join(outputDir, 'temp_reflection.mp4');
        const outroPath = path.join(outputDir, 'temp_outro.mp4');
        const logoPath = path.join(assetsDir, 'Logo Hjalmar Animado.mp4');

        console.log('🎞️  Componiendo Reflexión (60s con Música)...');
        const mainFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.1:contrast=1.1,vignette=angle=0.5 [bg];
            [bg] split [b1][b2];
            [b2] crop=900:1100:(1080-900)/2:(1920-1100)/2, boxblur=25 [blurred];
            [b1][blurred] overlay=(W-w)/2:(H-h)/2 [card_base];
            [card_base] drawbox=y='(ih-1100)/2':x='(iw-900)/2':w=900:h=1100:t=fill:c=black@0.4 [final_bg];
            [final_bg] ass=filename=assets/current_production.ass
        `.replace(/\s+/g, ' ').trim();

        // IMPORTANTE: Mapear el video (0:v) y el audio (1:a)
        execSync(`"${ffmpegBin}" -y -i "${videoPath}" -i "${audioPath}" -filter_complex "${mainFilter}" -map 0:v -map 1:a -t 60 -r 30 -c:v libx264 -c:a aac -preset fast -pix_fmt yuv420p "${intermediatePath}"`);

        console.log('🎬 Orquestando Outro (Con Música y Suscripción)...');
        const outroFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.3:contrast=1.3,vignette=angle=0.6 [bg];
            [1:v] scale=400:400:force_original_aspect_ratio=increase,crop=400:400,setsar=1,
                  geq=lum='p(X,Y)':a='if(gt(sqrt(pow(X-200,2)+pow(Y-200,2)),200),0,255)' [logo];
            [bg][logo] overlay='(W-w)/2':'(H-h)/2-250',
            drawtext=text='@Musichris_Studio':fontcolor=white:fontsize=78:fontfile='${georgiaFont}':x='(w-text_w)/2':y='H/2+250',
            drawtext=text='¡Caminemos juntos en fe!':fontcolor=white:fontsize=48:fontfile='${georgiaFont}':box=1:boxcolor=white@0.15:boxborderw=25:x='(w-text_w)/2':y='H/2+420',
            drawtext=text='Suscríbete para más reflexiones':fontcolor=white:fontsize=42:fontfile='${georgiaFont}':box=1:boxcolor=white@0.2:boxborderw=20:x='(w-text_w)/2':y='H/2+560'
        `.replace(/\s+/g, ' ').trim();

        // Usamos el audio también en el outro para que la concatenación no falle por falta de stream de audio
        execSync(`"${ffmpegBin}" -y -i "${videoPath}" -i "${logoPath}" -i "${audioPath}" -filter_complex "${outroFilter}" -map 0:v -map 2:a -t 5 -r 30 -c:v libx264 -c:a aac -pix_fmt yuv420p "${outroPath}"`);

        console.log('🔗 Sincronización Final (Master 65s con Audio Unificado)...');
        execSync(`"${ffmpegBin}" -y -i "${intermediatePath}" -i "${outroPath}" -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -preset ultrafast "${outputPath}"`);

        console.log(`✅ Marcando paisaje (Fila ${landscapeInfo.row}) como DONE...`);
        await updateSheetValue('1y6GYX2DwjZOJVBwKotKCh3aSVha3K6iQsr5_yG7al88', `Hoja 1!C${landscapeInfo.row}`, 'DONE');

        console.log(`\n✅ PRODUCCIÓN COMPLETADA: MÚSICA Y SUSCRIPCIÓN INTEGRADAS`);
        console.log(`📍 RESULTADO: ${outputPath}`);

    } catch (error) { console.error('❌ ERROR CRÍTICO:', error.message); }
}
main();
