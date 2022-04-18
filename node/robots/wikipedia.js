const superAgent = require('superagent')
const selectItemInList = require('../components/select-item-in-list.js')
const state = require('./state.js')

async function Wikipedia(){
    const images = []
    let ctn = ''
    let title = ''
    let summary = ''
    let pageid = ''
    let url = ''
    const links = []
    const references = []
    let structure

    const content = state.load()

    console.log('Fetching from Wikipedia...')
    title = await getTitle(content.searchTerm)

    console.log('Searching content...')
    await getContent()

    console.log('Building structure to others robots...')
    structure = buildStructure()
    content.sourceContentOriginal = structure.content

    state.save(content)

    async function getTitle(text){
        console.log(content.language)
        let config = {
            'action': 'query',
            'list': 'search',
            'srlimit': 5,
            'srsearch': text,
            'format': 'json'
        }
        const res = await request(config)     

        if(!res || !res._body || !res._body.query || !res._body.query.search ||  !res._body.query.search.length){
            console.log('Your search term don\'t return any result')
            console.log('Tip: search your term in english or pre-search valid words')
            console.log('Exiting program')
            process.exit()
        }

        let body = res._body
        let resultSearch = body.query.search
        let sugestions = resultSearch.map(s => s.title)
        return selectItemInList(sugestions,'Choose if any of these keys is the desired search :')
        // url = res.body[3][index]
        //return sugestions[index]
    }

    async function getContent(){
        let config = {
            'action': 'query',
            'prop': 'extracts|images|links|info|extlinks',
            'redirects': 1,
            'exsectionformat': 'wiki',
            'explaintext': true,
            'titles': title,
            'format': 'json'
        }
        const res = await request(config)     

        let value 
        map = new Map(Object.entries(res._body.query.pages))
        map.forEach(e => value = e)
        if(value.links)
            value.links.forEach(e => links.push(e.title))
        if(value.extlinks)
            value.extlinks.forEach(e => references.push(e['*']))
        pageid = value.pageid
        ctn = value.extract
        summary = value.extract.split('\n\n\n')[0]
        console.log('Fetching images...')
        value.images.forEach(async i => await getURLImage(i.title) )
    }

    async function getURLImage(title){
        let config = {
            'action': 'query',
            'prop': 'imageinfo',
            'titles': title,
            'format': 'json',
            'iiprop': 'url'
        }
        const res = await request(config)        

        map = new Map(Object.entries(res._body.query.pages))
        map.forEach(e => e.imageinfo.forEach(ii => images.push(ii.url)))

    }

    async function request(config){
        let url = `https://${content.language}.wikipedia.org/w/api.php`
        const res = await superAgent
                            .get(url)
                            .query(config)
        return res
    }

    function buildStructure(){
        return {
            content: ctn,
            images: images,
            links: links,
            pageid: pageid,
            references: references,
            summary: summary,
            title: title,
            url: url
        }
    }
}

module.exports = Wikipedia