const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
const axios = require(`axios`)

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        const urlGetPaginas = `https://en.wikipedia.org/api/rest_v1/page/summary/${content.searchTerm}`
        let responsePaginas = await requestWikipediaData(urlGetPaginas)
        const urlGetContent = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=${responsePaginas.data.title}&rvslots=*&rvprop=content&formatversion=2&format=json`
        let responseContent = await requestWikipediaData(urlGetContent)
        content.sourceContentOriginal = responseContent.data.query.pages[0].revisions[0].slots.main.content
        
        async function requestWikipediaData(url)
        {
            let data = await axios.get(url);
            return data;
        }
    }

    function sanitizeContent(content){
        const withoutBlankAndMarkdownLines = removeBlankAndMarkdownLines(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParenteses(withoutBlankAndMarkdownLines)
        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankAndMarkdownLines(text){
            const allLines = text.split('\n')
            const withoutBlankAndMarkdownLines = allLines.filter(l => 
                    l.trim().length > 0 && 
                    !l.trim().startsWith('=') && 
                    !l.trim().startsWith('{') &&
                    !l.trim().startsWith('}') &&
                    !l.trim().startsWith('!>\'') &&
                    !l.trim().endsWith('\'<!') &&
                    !l.trim().startsWith('!') &&
                    !l.trim().startsWith('|')
                )    
            return withoutBlankAndMarkdownLines.join(' ')
        }
        function removeDatesInParenteses(text){
            return text.replace(/|((?:|([^()]*|)|[^()])*|)/gm,'').replace(/ /g,' ')
        }
    }

    function breakContentIntoSentences(content){
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        content.sentences = sentences.map( s =>  {
            return {
                text: s,
                keywords:[],
                images: []
            }
        })
    }
}

module.exports = robot