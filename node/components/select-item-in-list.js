const readline = require('readline-sync')

function robot(items, selectText){
    
    return selectTerm(items,selectText)

    function selectTerm(items, selectText){
        const selectedPrefixIndex = readline.keyInSelect(items,selectText)
        const selectedPrefixText = items[selectedPrefixIndex]
        if(!selectedPrefixText){
            console.log('You don\'t defined a option as required...')
            console.log('Exiting Program...')
            process.exit()
        }
        return selectedPrefixText
    }

}

module.exports = robot