/*
 * MAIN FUNCTIONS
 */

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

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
        const encodedAnimeSlug = match[1];
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

async function extractEpisodes(url) {
    try {
        const match = url.match(/https:\/\/www3\.animeflv\.net\/anime\/(.+)$/);
        const encodedAnimeSlug = match[1];
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

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/www3\.animeflv\.net\/ver\/(.+)$/);
        const encodedEpisodeSlug = match[1];
        const response = await fetch(`https://animeflv.ahmedrangel.com/api/anime/episode/${encodedEpisodeSlug}`);
        const data = await JSON.parse(response);
    
        const selectedSource = data.data.servers.find(source => source.name === "SW") || null;
    
        if (selectedSource && selectedSource.embed !== undefined) {
            const sourceResponse = await fetch(selectedSource.embed);
            const sourceData = await sourceResponse;
    
            const obfuscatedScript = sourceData.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
            const unpackedScript = unpack(obfuscatedScript[1]);

            const streamInfo = unpackedScript.match(/(?<=file:\")https?:\/\/[^\"]+/);
            return streamInfo ? streamInfo[0] : null;
        } else {
            return null;
        }
    } catch (exception) {
        console.log('[extractStreamUrl] Error: ', exception);
    
        return null;
    }
}

/*
 * UNPACKER MODULE
 * Credit to GitHub user "mnsrulz" for  Unpacker Node library
 * https://github.com/mnsrulz/unpacker
 */

class Unbaser {
    constructor(base) {
        /* Functor for a given base. Will efficiently convert
          strings to natural numbers. */
        this.ALPHABET = {
            62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            95: "' !\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'",
        };
        this.dictionary = {};
        this.base = base;
        // fill elements 37...61, if necessary
        if (36 < base && base < 62) {
            this.ALPHABET[base] = this.ALPHABET[base] ||
                this.ALPHABET[62].substr(0, base);
        }
        // If base can be handled by int() builtin, let it do it for us
        if (2 <= base && base <= 36) {
            this.unbase = (value) => parseInt(value, base);
        }
        else {
            // Build conversion dictionary cache
            try {
                [...this.ALPHABET[base]].forEach((cipher, index) => {
                    this.dictionary[cipher] = index;
                });
            }
            catch (er) {
                throw Error("Unsupported base encoding.");
            }
            this.unbase = this._dictunbaser;
        }
    }
    _dictunbaser(value) {
        /* Decodes a value to an integer. */
        let ret = 0;
        [...value].reverse().forEach((cipher, index) => {
            ret = ret + ((Math.pow(this.base, index)) * this.dictionary[cipher]);
        });
        return ret;
    }
}

function detect(source) {
    /* Detects whether `source` is P.A.C.K.E.R. coded. */
    return source.replace(" ", "").startsWith("eval(function(p,a,c,k,e,");
}

function unpack(source) {
    /* Unpacks P.A.C.K.E.R. packed js code. */
    let { payload, symtab, radix, count } = _filterargs(source);
    if (count != symtab.length) {
        throw Error("Malformed p.a.c.k.e.r. symtab.");
    }
    let unbase;
    try {
        unbase = new Unbaser(radix);
    }
    catch (e) {
        throw Error("Unknown p.a.c.k.e.r. encoding.");
    }
    function lookup(match) {
        /* Look up symbols in the synthetic symtab. */
        const word = match;
        let word2;
        if (radix == 1) {
            //throw Error("symtab unknown");
            word2 = symtab[parseInt(word)];
        }
        else {
            word2 = symtab[unbase.unbase(word)];
        }
        return word2 || word;
    }
    source = payload.replace(/\b\w+\b/g, lookup);
    return _replacestrings(source);
    function _filterargs(source) {
        /* Juice from a source file the four args needed by decoder. */
        const juicers = [
            /}\('(.*)', *(\d+|\[\]), *(\d+), *'(.*)'\.split\('\|'\), *(\d+), *(.*)\)\)/,
            /}\('(.*)', *(\d+|\[\]), *(\d+), *'(.*)'\.split\('\|'\)/,
        ];
        for (const juicer of juicers) {
            //const args = re.search(juicer, source, re.DOTALL);
            const args = juicer.exec(source);
            if (args) {
                let a = args;
                if (a[2] == "[]") {
                    //don't know what it is
                    // a = list(a);
                    // a[1] = 62;
                    // a = tuple(a);
                }
                try {
                    return {
                        payload: a[1],
                        symtab: a[4].split("|"),
                        radix: parseInt(a[2]),
                        count: parseInt(a[3]),
                    };
                }
                catch (ValueError) {
                    throw Error("Corrupted p.a.c.k.e.r. data.");
                }
            }
        }
        throw Error("Could not make sense of p.a.c.k.e.r data (unexpected code structure)");
    }
    function _replacestrings(source) {
        /* Strip string lookup table (list) and replace values in source. */
        /* Need to work on this. */
        return source;
    }
}

/*
 * REMOVED FUNCTIONS
 */

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