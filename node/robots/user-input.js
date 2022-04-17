const readline = require('readline-sync')
const Parser = require('rss-parser')

async function robot(content){
    const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR'
    // content.searchTerm = 'Flamengo'
    // content.prefix = 'The history of'
    content.searchTerm = await askAndReturnSearchTerm(content)
    content.prefix = askAndReturnPrefix(content)

    async function askAndReturnSearchTerm(){
        const response = readline.question('Type a Wikipedia search term or G to fetch Google Trends:')
        return response.toUpperCase() === 'G' ? await askAndReturnTrend() : response
    }

    async function askAndReturnTrend(){
        console.log('Please wait...')
        const trends = await getGoogleTrends()
        const choice = readline.keyInSelect(trends,'Choose your trend')
        return trends[choice]
    }

    async function getGoogleTrends(){
        const parser = new Parser()
        const trends = await parser.parseURL(TREND_URL)
        return trends.items.map(i => i.title)
    }
    
    function askAndReturnPrefix(){
        const prefixes = ['Who is','What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes)
        let selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }
}

module.exports = robot