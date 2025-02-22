async function searchResults(keyword) {
    try {
        const results = [];
    
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

        return results;
        
    } catch (error) {
        console.log('[searchResults] Fetch error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}



//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

// function searchResults(keyword) {
//     const results = [];
//     const baseUrl = "https://www3.animeflv.net/";
    
//     const filmListRegex = /<ul class="ListAnimes AX Rows A03 C02 D02">([\s\S]*?)<\/ul>/;
//     const filmListMatch = html.match(filmListRegex);
    
//     if (!filmListMatch) {
//         return results;
//     }
    
//     const filmListContent = filmListMatch[1];
//     const itemRegex = /<li>\s*<article class="Anime[^>]*">([\s\S]*?)<\/article>\s*<\/li>/g;
//     const items = filmListContent.match(itemRegex) || [];

//     items.forEach(itemHtml => {
//         const imgMatch = html.match(/<img src="([^"]+)" alt="([^"]+)">/);
//         let imageUrl = imgMatch ? imgMatch[1] : '';
        
//         const titleMatch = itemHtml.match(/<h3 class="Title">([^<]+)<\/h3>/);
//         const title = titleMatch ? titleMatch[1] : '';
        
//         const hrefMatch = itemHtml.match(/href="([^"]+)"/);
//         let href = hrefMatch ? hrefMatch[1] : '';
        
//         if (imageUrl && title && href) {
//             if (!imageUrl.startsWith("https")) {
//                 if (imageUrl.startsWith("/")) {
//                     imageUrl = baseUrl + imageUrl;
//                 } else {
//                     imageUrl = baseUrl + "/" + href;
//                 }
//             }
//             if (!href.startsWith("https")) {
//                 if (href.startsWith("/")) {
//                     href = baseUrl + href;
//                 } else {
//                     href = baseUrl + "/" + href;
//                 }
//             }
//             results.push({
//                 title: title.trim(),
//                 image: imageUrl,
//                 href: href
//             });
//         }
//     });
    
//     return results;
// }