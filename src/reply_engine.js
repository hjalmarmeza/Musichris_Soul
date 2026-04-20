const axios = require('axios');

async function generateReply(commentText, videoTitle) {
    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-0de3fa327d1e4f2e911787c14bacdcaa";
    const baseURL = "https://api.deepseek.com/v1";

    try {
        console.log(`🤖 DeepSeek está analizando el comentario: "${commentText}"...`);
        
        const response = await axios.post(`${baseURL}/chat/completions`, {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente ministerial para MusiChris Studio. Tu tono es esperanzador, alegre, sabio y lleno de fe. Responde a los comentarios de YouTube de forma breve (máximo 2-3 frases), cordial y espiritual. Usa la misma terminología que el video si se proporciona."
                },
                {
                    role: "user",
                    content: `Video: "${videoTitle}"\nComentario: "${commentText}"\nGenera una respuesta ministerial para este usuario.`
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ Error en DeepSeek:", error.response?.data || error.message);
        return "¡Gracias por tu comentario! Que Dios te bendiga grandemente. 🕊️✨";
    }
}

module.exports = { generateReply };
