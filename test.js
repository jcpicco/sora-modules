import { unpack } from 'unpacker';

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/www3\.animeflv\.net\/ver\/(.+)$/);
        const encodedEpisodeSlug = match[1];
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${encodedEpisodeSlug}`);
        const data = await response.json();
    
        const selectedSource = data.data.servers.find(source => source.name === "SW") || null;
    
        if (selectedSource && selectedSource.embed !== undefined) {
            const fetchUrl = rewriteStreamwishUrl(selectedSource.embed);
            const sourceResponse = await fetch(fetchUrl);
            const sourceData = await sourceResponse.text();
    
            const obfuscatedScript = sourceData.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
            const unpacked = unpack(obfuscatedScript[1]);

            const url = unpacked.match(/(?<=\"hls2\":\")https?:\/\/[^\"]+/);
            return url ? url[0] : null;
        } else {
            return null;
        }
    
        function rewriteStreamwishUrl(url) {
            return url.replace(/^https?:\/\/streamwish\.to\//, "https://xenolyzb.com/");
        }
    } catch (exception) {
        console.log('[extractStreamUrl] Error: ', exception);
    
        return null;
    }
}

extractStreamUrl('https://www3.animeflv.net/ver/naruto-1');