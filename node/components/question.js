const readline = require('readline-sync')

function robot(questionText){
    
    return readline.question(questionText)

}

module.exports = robot