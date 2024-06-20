import * as fs from 'fs'
import * as axios from 'axios'
import * as readline from 'readline'
import {ExecException, exec, execSync} from 'child_process'
import { Utils } from "./Utils"
import { ChildProcess } from 'child_process'
export class ccgitpush
{
    //public payload
    public utils: Utils
    private currentDirectory: string
    public remoteOriginUrl: string
    private packDirectory: string
    private HEADFile : string
    constructor(utils: Utils)
    {
        //this.payload = payload
        this.utils = utils
        this.currentDirectory = "."
        this.packDirectory = ".git/objects/pack"
        this.HEADFile = "./.git/HEAD"
        
    }

    
    private async getOldSha(): Promise<string>
    {
        let oldSha
        const url = this.remoteOriginUrl + "/info/refs"
        console.log(url,"url")
        await axios.get(url,{
            auth:{
                username: 'narayanan-cs',
                password: 'ghp_rqC0dsGknM1xrIgKJgX0dINfuFIAL02R2EEr'
            },
            params:{
                service: "git-receive-pack"
            }
        }).then(
            function(response:any, error:any)
            {
                console.log(response.data)
                oldSha = response.data.substring(39,79)
            }
        ).catch(function(error: any){
            console.log(error.errno,error.code)
        }).finally(function(){
            console.log("FInally")
        })
        console.log(oldSha,"oldsha")
         return oldSha
    }

    private getNewSha(): string
    {
        const newSha = fs.readFileSync('.git/refs/heads/master',{encoding:'ascii'})
        console.log(newSha,"New sha")    
        return newSha.toString().substring(0,40)
    }
    
    public async getRemoteUrl()
    {
        const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    //  rl.("Enter the remote repository url.Please enter the absolute path", (url)=>{
    //     console.log(url,"Url")
    //     this.remoteOriginUrl = url 
    //  }) 
    console.log("Enter the remote repository url.Please enter the absolute path")
    const it = rl[Symbol.asyncIterator]()
    const url = await it.next().then(result=>result.value)
    this.remoteOriginUrl = <string><unknown>url
    console.log("press any key")
    const key = await it.next().then(result=>result.value)
    //const it2 = rl[Symbol.asyncIterator]()
    //const key = await it.next().then(result=>result.value)
    // exec('git gc',function(err,stdout, stderr){
    //     if(err!== null)
    //     {
    //         console.log(err.name,err.message)
    //     } else if(stderr!==null)
    //         {
    //             console.log(stderr)
    //         } else {
    //             console.log(stdout)
    //         }
    // })

    execSync('git gc')
//    await this.utils.packFiles()('git gc',function(err: ExecException, response: Object){
//         if(err)
//             {
//                 console.log(err)
//             } else{
//                 console.log(response)
//             }
//     })
 
    //process.exit()
    rl.close()
    //this.remoteOriginUrl = "https://github.com/narayanan-cs/gittestingyetagain.git"
      
      
    }
   
    
   public async push()
        {
            // const oldSha = await this.getOldSha()
            // console.log(oldSha,"Old sha")
            const newSha = this.getNewSha()
            console.log(newSha, "new sha")     
            await this.getRemoteUrl()
          //  process.exit()
            const body = await this.prepareBody(newSha)
            fs.writeFileSync("body",body)
            console.log(body,"body")
            //const body = result.then({result=>body})

            //use axios post API to push
            
            const url = this.remoteOriginUrl + "/git-receive-pack"
        console.log(url,"url")
        await axios.post(url,body,{
            auth:{
                username: 'narayanan-cs',
                password: 'ghp_rqC0dsGknM1xrIgKJgX0dINfuFIAL02R2EEr'
            },
            headers:{
                Host: "github.com",
                "Content-Type":"application/x-git-receive-pack-request",
                Accept:"application/x-git-receive-pack-result"
                    }//,
            //data: body        
        }).then(
            function(response:any, error:any)
            {
                console.log(response.data)
                
            }
        ).catch(function(error: any){
            console.log(error.errno,error.code)
        }).finally(function(){
            console.log("Finally")
        })
    }
        
   public async prepareBody(newSha: string): Promise<Buffer>
    {
        //fs.unlinkSync(".git/refs/heads/master")
        //const packFile = fs.readdirSync("D:/xampp/htdocs/GitClient/gittestingyetagainclient/.git/objects/pack").
        const packFile = fs.readdirSync(this.packDirectory).
        filter((content=>
            content.substring(content.length-4) === 'pack'
        )).join(",")
        console.log(packFile,"packFile")
        const payload = fs.readFileSync(this.packDirectory+"/"+packFile)
        //console.log(payload,"payload")
        console.log(payload.length,"payload length")
        fs.writeFileSync('binarypayload',payload)
        const oldSha = await this.getOldSha()
        console.log(oldSha,"Old sha in preparebody")
        //const newSha = this.getNewSha()
        //console.log(newSha, "new sha iside prepare body")
        const partialPayload = "refs/heads/master" + Buffer.alloc(1).fill("\u0000") +" report-status side-band-64k agent=git/2.27.0.windows.1"
        const endOfPartialPayloadIndicator = "0000"
        console.log(partialPayload.length,"length of partial payload")
        const chunkTextLength = (4+oldSha.length+" ".length+newSha.length+" ".length+partialPayload.length).toString(16)
        
        console.log(chunkTextLength,(4+oldSha.length+" ".length+newSha.length+" ".length+partialPayload.length))
        const chunkLength = Buffer.alloc(4).fill("00"+chunkTextLength,0,4)
        console.log(chunkLength,"chunk length")
        console.log(oldSha.length,newSha.length)
        console.log(4+oldSha.length+1+newSha.length+1+partialPayload.length,"chunk length in decimal")
        console.log((4+ oldSha.length+" ".length+newSha.length+" ".length+partialPayload.length).toString(16),"chunk length in hex")
        const spaceForBody = 4+ oldSha.length+" ".length+newSha.length+" ".length+partialPayload.length+endOfPartialPayloadIndicator.length+payload.length
        console.log(spaceForBody,"body length")
        //const commits =  Buffer.alloc(("009f3a3645cc361d012e8a118df9f9904188b5860599 94d20cc9cf5d6b26d3a905c331076a6afa848022 refs/heads/master  report-status side-band-64k agent=git/2.27.0.windows.10000").length+payload.length).fill("009f3a3645cc361d012e8a118df9f9904188b5860599 94d20cc9cf5d6b26d3a905c331076a6afa848022 refs/heads/master"+ Buffer.alloc(1).fill("\u0000") +" report-status side-band-64k agent=git/2.27.0.windows.10000",0, ("009f3a3645cc361d012e8a118df9f9904188b5860599 94d20cc9cf5d6b26d3a905c331076a6afa848022 refs/heads/master"+ Buffer.alloc(1).fill("\u0000") +"  report-status side-band-64k agent=git/2.27.0.windows.10000").length)
        const body =  Buffer.alloc(spaceForBody).fill(chunkLength.toString()+oldSha+ " "+ newSha + " "+ partialPayload+endOfPartialPayloadIndicator,0,4+oldSha.length+ " ".length+ newSha.length + " ".length+ partialPayload.length+endOfPartialPayloadIndicator.length)
       fs.writeFileSync('textpayload',body) 
       //console.log(("009f3a3645cc361d012e8a118df9f9904188b5860599 94d20cc9cf5d6b26d3a905c331076a6afa848022 refs/heads/master  report-status side-band-64k agent=git/2.27.0.windows.1").length,"length")
      payload.copy(body, (4+oldSha.length+" ".length+newSha.length+" ".length+partialPayload.length+endOfPartialPayloadIndicator.length), 0, payload.length)
        fs.writeFileSync('payload',body)
        return Promise.resolve(body)
    }
}

const ccgitpushInstance = new ccgitpush(new Utils())
ccgitpushInstance.push()