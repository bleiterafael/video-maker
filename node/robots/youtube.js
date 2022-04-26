const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({version:'v3'})
const OAuth2 = google.auth.OAuth2
const state = require('./state.js')
const fs = require('fs')

async function YouTube()
{
    const content = state.load()

    await authenticateWithOAuth()
    const videoInformation = await uploadVideo(content)
    await uploadThumbnail(videoInformation)

    async function authenticateWithOAuth(){
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthClient()
        requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient,authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        await stopWebServer(webServer)

        async function startWebServer(){
            return new Promise((resolve,reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () =>{
                    console.log(`> Listening on http://localhost:${port}`)
                    resolve({app,server})
                })
            })
        }

        async function createOAuthClient(){
            const credentials = require('../credentials/google-youtube.json')
            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }

        function requestUserConsent(OAuthClient){
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube']
            })

            console.log(`> Please give your consent: ${consentUrl}`)
        }

        async function waitForGoogleCallback(webServer){
            return new Promise((resolve,reject) => {
                console.log('> Waiting for user consent...')
                webServer.app.get('/oauth2callback',(req,res) => {
                    const authCode = req.query.code
                    console.log(`> Consent given: ${authCode}`)
                    res.send(`<h1>Thank you!</h1><p>Now, close this tab.</p>`)
                    resolve(authCode)
                })
            })
        }

        async function requestGoogleForAccessTokens(OAuthClient,authorizationToken){
            return new Promise((resolve,reject) => {
                OAuthClient.getToken(authorizationToken, (error,tokens) => {
                    if(error) reject(error)
                    console.log(`> Access tokens received`)
                    console.log(tokens)

                    OAuthClient.setCredentials(tokens)
                    resolve()
                })
            })
        }

        async function setGlobalGoogleAuthentication(OAuthClient){
            google.options({
                auth: OAuthClient
            })
        }

        async function stopWebServer(webServer){
            return new Promise((resolve,reject) =>{
                webServer.server.close(() => resolve())
            })
        }
    }

    async function uploadVideo(content){
        const videoFilePath = './content/output.mov'
        const videoFileSize = fs.statSync(videoFilePath).size
        const videoTitle =  `${content.prefix} ${content.searchTerm}`
        const videoTags = [content.searchTerm,...content.sentences[0].keywords]
        const videoDescription = content.sentences.map(s => s.text).join('\n\n')

        const requestParams = {
            part: 'snippet, status',
            requestBody:{
                snippet:{
                    title: videoTitle,
                    description: videoDescription,
                    tags: videoTags
                },
                status:{
                    privacyStatus: 'unlisted'
                }
            },
            media:{
                body: fs.createReadStream(videoFilePath)
            }
        }

        const youTubeResponse = await youtube.videos.insert(requestParams,{
            onUploadProgress: onUploadProgress
        })

        console.log(`> Video available at: https://youtu.be/${youTubeResponse.data.id}`)
        return youTubeResponse.data

        function onUploadProgress(event){
            const progress = Math.round((event.bytesRead/videoFileSize) * 100)
            const arr = setArray(progress)
            printArray(arr,progress)
                    
            function setArray(progress){
                const concluido = Array(progress).fill(1)
                const pendente = Array(100-progress).fill(0)
                const arrProgress = concluido.concat(pendente)
                return arrProgress
            }

            function printArray(arr,progress){
                const progressText = `${(arr.map(p => p == 0 ? 'X' : '=').join(''))} ${progress}% completed` 
                console.clear()
                console.log(progressText)
            }
        }
    }

    async function uploadThumbnail(videoInformation){
        const videoId = videoInformation.id
        const videoThumbnailFilePath = './content/youtube-thumbnail.jpg'
        
        const requestParameters = {
            videoId: videoId,
            media: {
                mimeType:'image/jpeg',
                body: fs.createReadStream(videoThumbnailFilePath)
            }
        }

        const youTubeResponse = await youtube.thumbnails.set(requestParameters)
        console.log(`> Thumbnail uploaded`)
    }
}

module.exports = YouTube