const readline = require('readline-sync')

function robot(content){
    content.searchTerm = 'Flamengo'
    content.prefix = 'The history of'
    // content.searchTerm = askAndReturnSearchTerm(content)
    // content.prefix = askAndReturnPrefix(content)

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term\n')
    }
    
    function askAndReturnPrefix(){
        const prefixes = ['Who is','What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes)
        let selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }
}

module.exports = robot