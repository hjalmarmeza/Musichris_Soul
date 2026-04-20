const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegBin = "/opt/homebrew/bin/ffmpeg"; 
const georgiaFont = "Georgia"; 

async function main() {
    try {
        console.log('🧪 [LAB] - PRUEBA DE FLUJO v5 (FONDO GARANTIZADO)');
        const database = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/promises_developed.json'), 'utf8'));
        const soulItem = database.find(item => item.id == 20); 

        const assetsDir = path.resolve(__dirname, '../assets');
        const outputDir = path.resolve(__dirname, '../output');
        const videoPath = path.join(assetsDir, 'test_loop_bg.mp4');
        const audioPath = path.join(assetsDir, 'test_audio.mp3');
        const outputPath = path.join(outputDir, `VERIFICACION_FLUJO_DIAMOND.mp4`);

        // 1. Generamos un fondo de color sólido para asegurar que FFmpeg tenga qué comer
        console.log('🎞️  Generando fondo de seguridad (65s)...');
        execSync(`"${ffmpegBin}" -y -f lavfi -i color=c=blue:s=1080x1920:d=65 -pix_fmt yuv420p "${videoPath}"`);

        // 2. Descargamos el audio de Cloudinary
        console.log('🎶 Bajando Audio de Cloudinary...');
        execSync(`curl -L -o "${audioPath}" "${soulItem.audio_url}"`);

        // 3. Renderizamos las 4 fases
        const cleanForFF = (txt) => (txt || '').replace(/'/g, "'\\\\\\''").replace(/:/g, "\\:");
        const f1 = cleanForFF(soulItem.text);
        const f1c = cleanForFF(soulItem.verse_citation);
        const f2 = cleanForFF(soulItem.explanation);
        const f3 = cleanForFF(soulItem.teaching);

        const filter = `drawtext=text='${f1}':fontcolor=white:fontsize=55:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,2,19)',drawtext=text='${f1c}':fontcolor=yellow:fontsize=40:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2+300:enable='between(t,2,19)',drawtext=text='${f2}':fontcolor=white:fontsize=55:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,20,39)',drawtext=text='REVELACION':fontcolor=yellow:fontsize=40:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2+300:enable='between(t,20,39)',drawtext=text='${f3}':fontcolor=white:fontsize=55:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,40,54)',drawtext=text='ESPERANZA':fontcolor=yellow:fontsize=40:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2+300:enable='between(t,40,54)',drawtext=text='@Musichris_Studio':fontcolor=white:fontsize=80:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2-100:enable='between(t,55,65)',drawtext=text='Suscribete ahora':fontcolor=cyan:fontsize=45:fontfile='${georgiaFont}':x=(w-text_w)/2:y=(h-text_h)/2+200:enable='between(t,55,65)'`;

        console.log('📽️  Fusionando todo en Master Final...');
        execSync(`"${ffmpegBin}" -y -i "${videoPath}" -i "${audioPath}" -vf "${filter}" -map 0:v -map 1:a -t 65 -r 30 -c:v libx264 -c:a aac -preset fast "${outputPath}"`);

        console.log(`\n✅ PRUEBA COMPLETADA`);
        console.log(`📂 ARCHIVO LISTO: ${outputPath}`);

    } catch (error) { 
        console.error('❌ ERROR:', error.message);
    }
}
main();
