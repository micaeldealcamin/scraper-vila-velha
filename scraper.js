const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const RSS = require('rss');

const BASE_URL = 'https://www.vilavelha.es.gov.br';
const NOTICIAS_URL = `${BASE_URL}/noticias`;

async function getNoticias() {
    try {
        console.log("🛰️ Conectando ao portal de Vila Velha com Node.js...");
        const { data } = await axios.get(NOTICIAS_URL, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const noticias = [];
        const cards = $('.col-xs-12.col-sm-6.col-lg-4.px-lg-5');

        console.log(`✅ ${cards.length} cards encontrados. Processando...`);

        // Pegando as 10 primeiras para teste
        for (let i = 0; i < Math.min(cards.length, 10); i++) {
            const el = cards[i];
            const linkRel = $(el).find('a').attr('href');
            const titulo = $(el).find('h4').text().trim();
            const dataPost = $(el).find('p.mb-0').text().trim();
            const imagemRel = $(el).find('img').attr('src');

            noticias.push({
                title: titulo,
                url: `${BASE_URL}${linkRel}`,
                date: dataPost,
                description: `Notícia publicada em ${dataPost}`,
                enclosure: { url: imagemRel.startsWith('http') ? imagemRel : `${BASE_URL}${imagemRel}` }
            });
        }

        return noticias;
    } catch (error) {
        console.error("❌ Erro na requisição:", error.message);
        return [];
    }
}

async function run() {
    const noticias = await getNoticias();
    
    if (noticias.length === 0) {
        console.log("⚠️ Nenhuma notícia capturada. Criando arquivo vazio para evitar erro no Git.");
        fs.writeFileSync('noticias_vv.json', JSON.stringify([]));
        return;
    }

    // 1. Salvar JSON (equivalente ao CSV)
    fs.writeFileSync('noticias_vv.json', JSON.stringify(noticias, null, 2));

    // 2. Gerar RSS
    const feed = new RSS({
        title: 'Notícias Vila Velha',
        feed_url: 'https://raw.githubusercontent.com/seu-usuario/repo/main/feed.xml',
        site_url: BASE_URL,
        language: 'pt-BR'
    });

    noticias.forEach(n => feed.item(n));
    fs.writeFileSync('feed_vila_velha_vv.xml', feed.xml());

    console.log("🚀 Arquivos gerados com sucesso!");
}

run();
