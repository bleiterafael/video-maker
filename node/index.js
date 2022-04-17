
const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/text.js'),
    wikipedia: require('./robots/wikipedia.js')
}

async function start(){
    const content = {
        maximumSentences: 7
    }

    await robots.userInput(content)
    await robots.wikipedia(content)
    await robots.text(content)

    console.log(content)
}

start()