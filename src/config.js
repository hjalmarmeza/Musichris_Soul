module.exports = {
    // Hoja 1: Catálogo Maestro (Canciones y URLs)
    CATALOG_SHEET_URL: 'https://docs.google.com/spreadsheets/d/19zXfliAZktXYixZ1HdcW1IO9bOBn8S8sRPZAXUVZbE/gviz/tq?tqx=out:csv&sheet=Hoja%202',
    
    // Hoja 2: Teología (Versos y Explicaciones)
    THEOLOGY_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1oTVSF7CjrCtnk3pHdBIRE8gzhE9zKDM5NJFyWV-qsJs/gviz/tq?tqx=out:csv&sheet=Hoja%204',
    
    // Hoja 3: Fondos de Países (Paisajes)
    BACKGROUND_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1y6GYX2DwjZOJVBwKotKCh3aSVha3K6iQsr5_yG7al88/gviz/tq?tqx=out:csv&sheet=Hoja%201',
    
    // Configuración de Video
    OUTPUT_FOLDER: './output',
    ASSETS_FOLDER: './assets',
    DEFAULT_BACKGROUND: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
    LOGO_PATH: './assets/logo_animado.mp4',
    
    // Capas de Subtítulos (ASS)
    STYLES_PATH: './templates/style.ass',

    // Notificaciones de Telegram (SentryMezaBot)
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || null,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || null
};
