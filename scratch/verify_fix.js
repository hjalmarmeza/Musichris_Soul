const { getNextPendingBackground } = require('../src/sheet_reader');

async function test() {
    console.log('🧪 Probando recuperación de paisajes...');
    try {
        const bg = await getNextPendingBackground();
        console.log('✅ Paisaje encontrado:');
        console.log(JSON.stringify(bg, null, 2));
    } catch (e) {
        console.error('❌ Error en la prueba:', e.message);
    }
}

test();
