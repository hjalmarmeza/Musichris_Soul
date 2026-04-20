const { getSoulDatabase, getNextPendingBackground } = require('./sheet_reader');
const { smartDownload, updateSheetValue, appendSheetRow } = require('./google_connector');
const { generateSubtitleFile } = require('./engine');
const { uploadToYouTube } = require('./youtube_uploader');
const { execSync } = require('child_process');
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
        
        // METADATOS PARA YOUTUBE
        const title = `${soulItem.reflection_title} | MusiChris Studio 🕊️`;
        const description = `Reflexión: ${soulItem.reflection_title}\nMúsica: MusiChris Studio ✨\n\n#Musichris #Studio #Reflexion #Esperanza #Victoria`;
        
        if (!soulItem) throw new Error(`Pieza con ID ${targetId} no encontrada.`);

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
        
        await generateSubtitleFile(soulItem);

        const intermediatePath = path.join(outputDir, 'temp_reflection.mp4');
        const outroPath = path.join(outputDir, 'temp_outro.mp4');
        const logoPath = path.join(assetsDir, 'Logo Hjalmar Animado.mp4');

        // FILTRO PRINCIPAL (CON CARD Y ASS)
        const mainFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.1:contrast=1.1,vignette=angle=0.5 [bg];
            [bg] split [b1][b2];
            [b2] crop=900:1100:(1080-900)/2:(1920-1100)/2, boxblur=25 [blurred];
            [b1][blurred] overlay=(W-w)/2:(H-h)/2 [card_base];
            [card_base] drawbox=y='(ih-1100)/2':x='(iw-900)/2':w=900:h=1100:t=fill:c=black@0.4 [final_bg];
            [final_bg] ass=filename=assets/current_production.ass
        `.replace(/\s+/g, ' ').trim();

        // COMPOSICIÓN PRINCIPAL: Loop del paisaje y captura del CLÍMAX (ss 60)
        console.log('🎞️  Componiendo Cuerpo (Capturando Clímax desde 01:00)...');
        execSync(`"${ffmpegBin}" -y -stream_loop -1 -i "${videoPath}" -ss 60 -i "${audioPath}" -filter_complex "${mainFilter}" -map 0:v -map 1:a -t 60 -r 30 -c:v libx264 -c:a aac -preset fast -pix_fmt yuv420p "${intermediatePath}"`);

        console.log('🎬 Orquestando Outro (Con Música y Suscripción)...');
        const outroFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.3:contrast=1.3,vignette=angle=0.6 [bg];
            [1:v] scale=400:400:force_original_aspect_ratio=increase,crop=400:400,setsar=1,
                  geq=lum='p(X,Y)':a='if(gt(sqrt(pow(X-200,2)+pow(Y-200,2)),200),0,255)' [logo];
            [bg][logo] overlay='(W-w)/2':'(H-h)/2-280',
            drawtext=text='@Musichris_Studio':fontcolor=white:fontsize=82:fontfile='${georgiaFont}':x='(w-text_w)/2':y='H/2+220',
            drawtext=text='¡Caminemos juntos en fe!':fontcolor=white:fontsize=52:fontfile='${georgiaFont}':box=1:boxcolor=white@0.1:boxborderw=20:x='(w-text_w)/2':y='H/2+380',
            drawtext=text='Suscríbete ahora para más reflexiones':fontcolor=white:fontsize=44:fontfile='${georgiaFont}':box=1:boxcolor=white@0.15:boxborderw=15:x='(w-text_w)/2':y='H/2+520'
        `.replace(/\s+/g, ' ').trim();

        execSync(`"${ffmpegBin}" -y -stream_loop -1 -i "${videoPath}" -i "${logoPath}" -i "${audioPath}" -filter_complex "${outroFilter}" -map 0:v -map 2:a -t 5 -r 30 -c:v libx264 -c:a aac -pix_fmt yuv420p "${outroPath}"`);

        console.log('🔗 Sincronización Final (Master 65s)...');
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
