const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    sanitizeContent(content)
    breakContentIntoSentences(content)

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