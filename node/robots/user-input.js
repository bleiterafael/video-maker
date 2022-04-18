
const Parser = require('rss-parser')
const question = require('../components/question.js')
const selectItemInList = require('../components/select-item-in-list.js')
const state = require('./state.js')

async function UserInput(){
    const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR'
    const content = {
        maximumSentences: 7
    }
    
    content.searchTerm = await askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.language = askAndReturnLanguage()

    state.save(content)

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
    
    function askAndReturnLanguage(){
        const languages = ['pt','en']
        const selectedLanguage = selectItemInList(languages,'Choose language: ')
        return selectedLanguage;
    }
}

module.exports = UserInput