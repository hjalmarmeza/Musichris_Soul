const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const assetsDir = path.resolve(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

const runGraphics = (mode, output, title, body) => {
    console.log(`Generating ${mode}...`);
    const result = spawnSync('python3', ['src/graphics_engine.py', mode, output, title, body]);
    if (result.error) console.error(`Error: ${result.error}`);
    if (result.stderr.length > 0) console.error(`Python Stderr: ${result.stderr.toString()}`);
};

const text1 = "El sobrescrito del salmo dice 'salmo de david, cuando estaba en el desierto de judá' probablemente huyendo de su hijo absalón. Un rey acostumbrado a la comodidad del palacio ahora durmiendo en la arena.";
const title1 = "Salmo 63";

const smartLimit = (text, maxChars = 200) => {
    if (!text || text.length <= maxChars) return text;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length >= 2) {
        const draft = (sentences[0] + sentences[1]).trim();
        if (draft.length <= maxChars + 50) return draft;
    }
    return text.substring(0, maxChars).trim() + "...";
};

runGraphics('phase1', path.join(assetsDir, 'test_p1.png'), title1, smartLimit(text1, 160));
runGraphics('outro', path.join(assetsDir, 'test_outro.png'), "", "");

console.log("Done. Check assets/test_p1.png");
