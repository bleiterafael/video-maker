const imageDownloader = require('image-downloader')
const state = require('./state.js')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleSearchCredentials = require('../credentials/google-search.json')

async function Image(){

    const content = state.load()
    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)
    state.save(content)

    async function fetchImagesOfAllSentences(content){
        for(const sentence of content.sentences)
        {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query){

        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apikey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            imgSize: 'huge',
            num: 2
        })

        const imagesLinks = response.data.items.map(i => i.link)
        return imagesLinks
    }

    async function downloadAllImages(content)
    {
        const downloadedImages = []
        let sentenceIndex = 0
        for(const sentence of content.sentences)
        {
            for(const image of sentence.images)
            {
                const sucesso = await downloadImage(image)
                if(sucesso) 
                    break
            }
            sentenceIndex++
        }
        console.log(downloadedImages)

        async function downloadImage(image){
            try{
                if(downloadedImages.filter(i => i == image).length)
                    throw new Error('Imagem já baixada')

                await downloadAndSaveImage(image,`${sentenceIndex}-original.png`)
                console.log('Baixou imagem com sucesso: ' + image)
                downloadedImages.push(image)
                return true;
            }
            catch(error){
                console.log(`Erro ao baixar imagem: ${image}. ERRO: ${error}`)
                return false
            }        
        }

        async function downloadAndSaveImage(imageUrl,fileName){
            return imageDownloader.image({
                url: imageUrl,
                dest: `../../content/${fileName}`
            })
        }
    }

}

module.exports = Image