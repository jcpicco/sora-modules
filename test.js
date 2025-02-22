import fetch from 'node-fetch';

async function testScraper(keyword) {
    try {
        var results = [];
    
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`);
        const data = await response.json();
    
        if (data.success) {
            results = data.data.media.map(anime => ({
                title: anime.title,
                image: anime.cover,
                href: `https://www3.animeflv.net/anime/${anime.slug}`
            }));
        }

        console.log(results);
        
    } catch (error) {
        console.log('[searchResults] Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

testScraper("samurai");
