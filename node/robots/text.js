const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        // const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        // const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        // const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        // console.log(wikipediaResponse)
        //const wikipediaContent = wikipediaResponse.get()
        //console.log(wikipediaContent)

        const wikipediaContent = {
            summary: 'This is the summary.',
            reference: ['reference one','reference two'],
            pageid: 4295834,
            links: ['link one', 'link two', 'link three'],
            images: ['image one', 'image two'],
            content: 'This is the content. C.R.F. significa Clube de Regatas do Flamengo. \n The next line is empty: \n \n The previous line was empty! The next line is a markdown \n = this is a markdown \n this is the end of content'
        }
        //console.log(wikipediaContent)

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content){
        const withoutBlankAndMarkdownLines = removeBlankAndMarkdownLines(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParenteses(withoutBlankAndMarkdownLines)
        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankAndMarkdownLines(text){
            const allLines = text.split('\n')
            const withoutBlankAndMarkdownLines = allLines.filter(l => l.trim().length > 0 && !l.trim().startsWith('='))    
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