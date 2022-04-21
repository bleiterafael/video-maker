const gm = require('gm').subClass({imageMagick: true})
const state = require('./state.js')

async function Image(){

    const content = state.load()
    await convertAllImages(content)
    await createAllSentencesImages(content)
    await createYouTubeThumbnail()
    state.save(content)

    async function convertAllImages(content)
    {
        let sentenceIndex = 0
        for(const sentence of content.sentences)
        {
            await convertImage(sentenceIndex++)
        }
    }

    async function convertImage(sentenceIndex)
    {
        return new Promise((resolve,reject)=>{
            const inputFile = `./content/${sentenceIndex}-original.png[0]`
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const height = 1080           

            gm()
                .in(inputFile)
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-blur', '0x9')
                    .out('-resize', `${width}x${height}^`)
                .out(')')
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-resize', `${width}x${height}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .out('-extent', `${width}x${height}`)
                .write(outputFile, (error) =>{
                    if(error) return reject(error)
                    console.log(`> Image converted: ${inputFile}`)
                    resolve()
                })
        })
    }

    async function createAllSentencesImages(content)
    {
        let sentenceIndex = 0
        for(const sentence of content.sentences){
            await createSentenceImage(sentence.text, sentenceIndex++)
        }
    }
    
    async function createSentenceImage(sentenceText,sentenceIndex)
    {
        return new Promise((resolve,reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`
            const templateSettings = {
                0: { size: '1920x400' , gravity: 'center'},
                1: { size: '1920x1080', gravity: 'center'},
                2: { size: '800x1080' , gravity: 'west'},
                3: { size: '1920x400' , gravity: 'center'},
                4: { size: '1920x1080', gravity: 'center'},
                5: { size: '800x1080' , gravity: 'west'},
                6: { size: '1920x400' , gravity: 'center'},
            }

            const settings = templateSettings[sentenceIndex]
            gm()
                .out('-size',settings.size)
                .out('-gravity', settings.gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentenceText}`)
                .write(outputFile, (error) =>{
                    if(error) return reject(error)
                    console.log(`> Sentence created: ${outputFile}`)
                    resolve()
                })
        })
    }
    
    async function createYouTubeThumbnail(){
        return new Promise((resolve,reject) => {
            const inputFile = `./content/0-converted.png`
            const outputFile = `./content/youtube-thumbnail.jpg`
            gm()
                .in(inputFile)
                .write(outputFile, (error) =>{
                    if(error) return reject(error)
                    console.log(`> YouTube thumbnail created: ${outputFile}`)
                    resolve()
                })
        })
    }
    
}

module.exports = Image