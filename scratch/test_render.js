const { getNextPendingBackground } = require('../src/sheet_reader');
const { smartDownload } = require('../src/google_connector');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testRender() {
    try {
        console.log('🚀 [MusiChris Soul] - PRUEBA DE RENDERIZADO LOCAL (REVISIÓN FINAL)');
        const database = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/promises_developed.json'), 'utf8'));
        const soulItem = database.find(item => item.id == 38);
        
        if (!soulItem) throw new Error('ID 38 no encontrado.');
        console.log(`🎬 PROCESANDO: ${soulItem.reflection_title} (ID: ${soulItem.id})`);

        const landscapeInfo = await getNextPendingBackground();
        const backgroundUrl = landscapeInfo.url;
        
        const assetsDir = path.resolve(__dirname, '../assets');
        const outputDir = path.resolve(__dirname, 'test_output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const videoPath = path.join(assetsDir, 'test_bg.mp4');
        const audioPath = path.join(assetsDir, 'test_audio.mp3');
        const ffmpegBin = "/opt/homebrew/bin/ffmpeg";

        console.log('📡 Descargando activos para prueba...');
        await smartDownload(backgroundUrl, videoPath);
        await smartDownload(soulItem.audio_url, audioPath);
        
        console.log('📝 Generando superposiciones con el NUEVO motor gráfico...');
        const p1Card = path.join(assetsDir, 'p1_test.png');
        const p2Card = path.join(assetsDir, 'p2_test.png');
        const p3Card = path.join(assetsDir, 'p3_test.png');
        const creditsCard = path.join(assetsDir, 'credits_test.png');
        
        const runGraphics = (mode, output, title, body) => {
            spawnSync('python3', ['src/graphics_engine.py', mode, output, title, body]);
        };

        // Mapeo Narrativo Final: Resumen -> Revelación -> Esperanza
        console.log('   - Fase 1: Resumen/Contexto');
        runGraphics('phase1', p1Card, soulItem.verse_citation, soulItem.explanation);
        
        console.log('   - Fase 2: Revelación (Enseñanza)');
        runGraphics('phase2', p2Card, "REVELACIÓN", soulItem.text);
        
        console.log('   - Fase 3: Esperanza (Idea Central)');
        const esperanzaText = `"${soulItem.reflection_title}"\n¡Dios tiene el control!`;
        runGraphics('phase3', p3Card, "ESPERANZA", esperanzaText);
        
        runGraphics('outro', creditsCard, "", "");

        const intermediatePath = path.join(outputDir, 'temp_body.mp4');
        const outroPath = path.join(outputDir, 'temp_outro.mp4');
        const logoPath = path.join(assetsDir, 'Logo Hjalmar Animado.mp4');
        const finalPath = path.join(outputDir, 'SOUL_38_REVISION_FINAL.mp4');

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

        console.log('🎞️  Renderizando cuerpo (60s)...');
        execSync(`"${ffmpegBin}" -y -stream_loop -1 -i "${videoPath}" -ss 60 -i "${audioPath}" -i "${p1Card}" -i "${p2Card}" -i "${p3Card}" -filter_complex "${mainFilter}" -map 0:v -map 1:a -t 55 -r 30 -c:v libx264 -c:a aac -preset fast "${intermediatePath}"`);

        const outroFilter = `
            [0:v] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
                  eq=brightness=-0.3:contrast=1.3,vignette=angle=0.6 [bg];
            [1:v] scale=400:400:force_original_aspect_ratio=increase,crop=400:400,setsar=1,
                  geq=lum='p(X,Y)':a='if(gt(sqrt(pow(X-200,2)+pow(Y-200,2)),200),0,255)' [logo];
            [bg][logo] overlay='(W-w)/2':'(H-h)/2-280' [bg_logo];
            [bg_logo][3:v] overlay=0:0
        `.replace(/\s+/g, ' ').trim();

        console.log('🎬 Renderizando outro...');
        execSync(`"${ffmpegBin}" -y -stream_loop -1 -i "${videoPath}" -i "${logoPath}" -i "${audioPath}" -i "${creditsCard}" -filter_complex "${outroFilter}" -map 0:v -map 2:a -t 5 -r 30 -c:v libx264 -c:a aac "${outroPath}"`);

        console.log('🔗 Sincronización final...');
        execSync(`"${ffmpegBin}" -y -i "${intermediatePath}" -i "${outroPath}" -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -preset ultrafast "${finalPath}"`);

        console.log(`✅ RENDER FINALIZADO: ${finalPath}`);
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
    }
}

testRender();
