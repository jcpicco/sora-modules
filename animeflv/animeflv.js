async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/search?query=${encodedKeyword}`);
        const data = await JSON.parse(response);
    
        const results = data.data.media.map(anime => ({
            title: anime.title || 'Title: Unknown',
            image: anime.cover || 'Image: Unknown',
            href: `https://www3.animeflv.net/anime/${anime.slug}` || 'Href: Unknown'
        }));

        return JSON.stringify(results);
        
    } catch (exception) {
        console.log('[searchResults] Error: ', exception);
        
        return JSON.stringify([{
            title: 'Title: Unknown',
            image: 'Image: Unknown',
            href: 'Href: Unknown'
        }]);
    }
}

async function extractDetails(animeSlug) {
    try {
        const encodedAnimeSlug = encodeURIComponent(animeSlug);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${encodedAnimeSlug}`);
        const data = await JSON.parse(response);

        const animeDetails = [{
            description: data.data.synopsis || 'Description: Unknown',
            aliases: `Duration: ${data.data.episodes.length || 'Unknown'}`,
            airdate: `Aired: ${data.data.aired || 'Unknown'}`
        }];
        
        return JSON.stringify(animeDetails);
    } catch (exception) {
        console.log('[extractDetails] Error: ', exception);

        return JSON.stringify([{
            description: 'Description: Unknown',
            aliases: 'Duration: Unknown',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(episodeSlug) {
    try {
        const encodedAnimeSlug = encodeURIComponent(episodeSlug);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/${encodedAnimeSlug}`);
        const data = await JSON.parse(response);

        const episodesList = data.data.episodes.map(episode => ({
            href: episode.url || 'Href: Unknown',
            number: episode.number || 'Number: Unknown'
        }));
        
        return JSON.stringify(episodesList);
    } catch (exception) {
        console.log('[extractDetails] Error: ', exception);

        return JSON.stringify([{
            href: 'Href: Unknown',
            number: 'Number: Unknown'
        }]);
    } 
}

async function extractStreamUrl(episodeSlug) {
    try {
        const encodedEpisodeSlug = encodeURIComponent(episodeSlug);
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${encodedEpisodeSlug}`);
        const data = await JSON.parse(response);

        const sourceList = data.data.servers;

        const preferredSources = ["SW", "YourUpload", "Okru"];

        const selectedSource = preferredSources
        .map(name => sourceList.find(source => source.name === name))
        .find(source => source !== undefined) || sourceList[0];

        return selectedSource ? selectedSource.embed : null;
    } catch (exception) {
        console.log('[extractStreamUrl] Error: ', exception);

        return null;
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