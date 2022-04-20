
const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/text.js'),
    wikipedia: require('./robots/wikipedia.js'),
    state: require('./robots/state.js'),
    image: require('./robots/image.js')
}

async function start(){
    

    await robots.userInput()
    await robots.wikipedia()
    await robots.text()
    await robots.image()

    const content = robots.state.load()
    //console.log(content)
}

start()