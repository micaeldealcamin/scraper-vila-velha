const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const RSS = require('rss');

async function extrair() {
    console.log("🛰️ Iniciando captura com Node.js...");
    try {
        const response = await axios.get('https://www.vilavelha.es.gov.br/noticias', {
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
        });

        const $ = cheerio.load(response.data);
        const feed = new RSS({ title: 'Notícias Vila Velha', site_url: 'https://www.vilavelha.es.gov.br' });

        $('.col-xs-12.col-sm-6.col-lg-4.px-lg-5').each((i, el) => {
            if (i < 10) {
                const titulo = $(el).find('h4').text().trim();
                const link = 'https://www.vilavelha.es.gov.br' + $(el).find('a').attr('href');
                feed.item({ title: titulo, url: link, date: new Date() });
            }
        });

        fs.writeFileSync('feed_vila_velha_vv.xml', feed.xml());
        console.log("✅ Arquivo XML gerado!");
    } catch (e) {
        console.error("❌ Erro:", e.message);
        // Cria arquivo vazio para não dar erro no Git
        fs.writeFileSync('feed_vila_velha_vv.xml', '<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Vazio</title></channel></rss>');
    }
}
extrair();
