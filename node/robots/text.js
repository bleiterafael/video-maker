const sentenceBoundaryDetection = require('sbd')
const watson = require('../credentials/watson-nlu.json')

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watson.apikey,
    version: '2018-04-05',
    url: watson.url
})

function limitMaximumSentences(content){
    content.sentences = content.sentences.slice(0,content.maximumSentences)
}

async function fetchWatsonAndReturnKeywords(sentence){
    return new Promise((resolve,reject) => {
        nlu.analyze({
                text: sentence,
                features:{
                    keywords:{}
                }
            },
            (error,response) => {
                if(error)
                    throw error

                const keywords = response.keywords.map(keyword => keyword.text)
                resolve(keywords)
            }
        )
    })
}



async function Text(content){
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

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

    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }
}

module.exports = Text