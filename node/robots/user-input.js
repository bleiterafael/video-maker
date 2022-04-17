
const Parser = require('rss-parser')
const question = require('../components/question.js')
const selectItemInList = require('../components/select-item-in-list.js')

async function robot(content){
    const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR'
    
    content.searchTerm = await askAndReturnSearchTerm(content)
    content.prefix = askAndReturnPrefix(content)

    async function askAndReturnSearchTerm(){
        const response = question('Type a Wikipedia search term or G to fetch Google Trends:')
        return response.toUpperCase() === 'G' ? await askAndReturnTrend() : response
    }

    async function askAndReturnTrend(){
        console.log('Please wait...')
        const trends = await getGoogleTrends()
        const choice = selectItemInList(trends,'Choose your trend')
        return choice
    }

    async function getGoogleTrends(){
        const parser = new Parser()
        const trends = await parser.parseURL(TREND_URL)
        return trends.items.map(i => i.title.toString('utf8'))
    }
    
    function askAndReturnPrefix(){
        const prefixes = ['Who is','What is', 'The history of']
        const selectedPrefixText = selectItemInList(prefixes,`Choose an option for \'${content.searchTerm} \':`)
        return selectedPrefixText
    }
    
}

module.exports = robot