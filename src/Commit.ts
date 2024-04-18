import * as zlib from 'zlib'
import * as fs from 'fs'
import { Utils } from './Utils'
import {UpdateIndex} from './UpdateIndexAdd'
import * as crypto from 'crypto'
import { time, timeEnd } from 'console'

export class Commit
{
    private _stagingArea: string
    public utils: Utils
    private _individualOldEntries: Buffer[]
    private _header: string
    //public path: string
    private _stat: fs.Stats
    private treeSha:string
    private _treeShaSpace: Buffer
   
    constructor(utils: Utils)
    {
        this._stagingArea = '.git/index'//to move it to .local.env file
        this.utils = utils
        this._individualOldEntries = []
       // this._extractOldEntries()
       // this.path = path
       // this.setStat()
      //  const newFileType = new FileType()
       // this.setHeader(newFileType.getFileType(this.path))
        //this._stagingArea = new UpdateIndex(new Utils(),indexEntries)
    }
    public getStat(): fs.Stats
        {
            return this._stat
        }
        public setStat(): void
        {
            //this._stat = fs.statSync(this.path)
        }    
    public setHeader(): void
    {
        this._header = "tree"+ " " +  + "\u0000"
    }
    private _isStagingAreaPresent()
    {
        return fs.existsSync(this._stagingArea)
    }
    private _readIndex(): Buffer
    {
        if(!this._isStagingAreaPresent())
        {
            console.log("No staged files")
            return null//process.exit()
        }
      return  fs.readFileSync(this._stagingArea)
    }
    public _extractOldEntries(): void
    {
        
        let firstEntryLength
        let fileNameLength = this.utils.allocateBufferSpace(2)
        let firstEntry:Buffer
        
        let indexFileContents = this._readIndex()//fs.readFileSync(this._fileName)
        if(indexFileContents === null)
         {
            return 
         }
         
            //this.oldEntries = this.utils.allocateBufferSpace(indexFileContents.indexOf('TREE')!== -1?indexFileContents.indexOf('TREE'):indexFileContents.length)
            let oldEntries = this.utils.allocateBufferSpace(indexFileContents.indexOf('TREE')!== -1?(indexFileContents.indexOf('TREE') - 12):(indexFileContents.length - 20 - 12))
            console.log(oldEntries.length,"Old Entries Length")
            //console.log(this.oldEntries,"old Entries")

    //            move this copy to utils
            indexFileContents.copy(oldEntries,0,12,indexFileContents.indexOf('TREE')!== -1?indexFileContents.indexOf('TREE')+1:indexFileContents.length - 19)
            //first entry
            
            let i = 12// start of Index Entry 
             let j = i + 60//start of fileName length
             
             indexFileContents.copy(fileNameLength,0,j,j+2)
             console.log(fileNameLength,"FilenameLength Buffer")
             firstEntryLength = <number>this.utils.readIntegersFromBuffer(fileNameLength,16,0,'BE')
             console.log(firstEntryLength,"First entry fileName length")
             let spaceForNull = 0
             while((firstEntryLength + 2 + spaceForNull)%4 != 0)
             {
                 spaceForNull++
             }
             spaceForNull = spaceForNull?spaceForNull:4
             firstEntry = this.utils.allocateBufferSpace(j+2+firstEntryLength+spaceForNull-i)
             indexFileContents.copy(firstEntry,0,i,j+2+firstEntryLength+spaceForNull)
             this._individualOldEntries.push(firstEntry)
            console.log(firstEntry.toString(),"First Entry content")
            //second entry
            let secondEntry: Buffer
            let k = j+2+firstEntryLength+spaceForNull
            let l = k + 60 //start of fileName length
            
            while(indexFileContents.length > l)
            {
            indexFileContents.copy(fileNameLength,0,l,l+2)
            console.log(fileNameLength,"FilenameLength Buffer")
             let secondEntryLength = <number>this.utils.readIntegersFromBuffer(fileNameLength,16,0,'BE')
             console.log(secondEntryLength,"Second entry fileName length")
             spaceForNull = 0
             while((secondEntryLength + 2 + spaceForNull)%4 != 0)
             {
                 spaceForNull++
             }
             spaceForNull = spaceForNull?spaceForNull:4
             secondEntry = this.utils.allocateBufferSpace(l+2+secondEntryLength+spaceForNull-k)
             indexFileContents.copy(secondEntry,0,k,l+2+secondEntryLength+spaceForNull)
            console.log(secondEntry.toString(),"second Entry content")
            this._individualOldEntries.push(secondEntry)
            
            k = l + 2 + secondEntryLength + spaceForNull
            l = k + 60
            
        }
            this._individualOldEntries.forEach(entry=>{
                console.log(entry.length,"Entry length")
                console.log(entry.toString(),"Entry content")
            })
            console.log(oldEntries.toString(),"old Entries") 
            
    }
    private _getModeOf(entry: Buffer): string
    {
     const modeInHex = this.utils.readIntegersFromBuffer(entry, 32, 13, 'BE').toString(16)
     return parseInt(modeInHex, 16).toString(8)
    }
    private _getSha1Of(entry: Buffer): Buffer
    {
        const sha1 = Buffer.alloc(20)
        entry.copy(sha1, 0, 40, 60)
        console.log(sha1,"sha1")
        console.log(sha1.length,"length of sha1")
        return sha1
        //console.log(sha1.toString('hex'))
        //return sha1.toString('hex')
    }
    private _getFilenameOf(entry: Buffer): string
    {
        const fileNameLength = this.utils.readIntegersFromBuffer(entry, 16, 60, 'BE')
        const fileName = Buffer.alloc(<number>fileNameLength)
        entry.copy(fileName, 0, 62, 62 + <number>fileNameLength)
        return fileName.toString()
    }
   
public readFileContent(entry: Buffer): Buffer
{
    const fileName = this._getFilenameOf(entry)
    const fileContent = fs.readFileSync(fileName)
    return fileContent
}


public calculateshaOfStore(tree: Buffer): string
{//to do : get the variables from .env file
 // return crypto.createHash('sha1').update(this.createStore(treeObject)).digest('hex')
 return crypto.createHash('sha1').update(tree).digest('hex')
}
public calculatesha(commit: Buffer): string
{//to do : get the variables from .env file
  return crypto.createHash('sha1').update(commit).digest('hex')
}
// public deflateStore(): Buffer
// {
//  //   this.shaStore = this.calculateshaOfStore()
//     return zlib.deflateSync(this.createStore())
// }
public getHeader(type: string, object: Buffer|string): string
{
return type + " "+ object.length+ "\u0000"
}

public createCommitStore(commitObject: Buffer): string
{
    return this.getHeader("commit", commitObject) + commitObject
}

public createStore(treeObject: string): string
{
    return this.getHeader("tree", treeObject) + treeObject
}
private _writeTreeObjectToDB(): string
{
   
    let treeObject = ""
    let treeEntryLength = 0
    let treeEntry: Buffer
    
    let offset = 0 
    let treeBodyLength = 0
    const space = " "
    const nullCharacter = "\u0000"
    this._individualOldEntries.forEach(entry=>{
        const mode = "100644"
       
       const fileName = this._getFilenameOf(entry)
       const sha1 = this._getSha1Of(entry)
       
       treeBodyLength += mode.length+space.length+fileName.length+nullCharacter.length+sha1.length
       
    })
    const treeBody = Buffer.alloc(treeBodyLength)
    
    //const treeEntries = Buffer.alloc(treeBodyLength)
    // Buffer.alloc(spaceFOrTreeEntry)
    this._individualOldEntries.forEach(entry=>{
      //console.log(entry,"entry")
        const mode = "100644"//this._getModeOf(entry)//to do : get mode dynmically
       treeBody.write(mode,offset)
       treeBody.write(space,offset+mode.length)
       const fileName = this._getFilenameOf(entry)
       console.log(fileName,"filename ")
       console.log(fileName.length,"filename length")
       treeBody.write(fileName,offset+mode.length+space.length)
       treeBody.write(nullCharacter,offset+mode.length+space.length+fileName.length)
       const sha1 = this._getSha1Of(entry)
       console.log(sha1,"sha1")
       console.log(sha1.length,"sha1 length")
        const sha1Copy = Buffer.alloc(20)
        sha1.copy(sha1Copy,0,0,20)
        sha1Copy.copy(treeBody,offset+mode.length+space.length+fileName.length+nullCharacter.length,0,sha1Copy.length)
       offset += mode.length+space.length+fileName.length+nullCharacter.length+sha1Copy.length
       
    })
    //const treeObjectSignature = 'tree'+ treeObjectEntriesLength+ "\u0000"
    /////////////////
    const treeSignature = 'tree'
    
    const treeHeader = treeSignature+ space+ treeBodyLength
    const tree = Buffer.alloc(treeHeader.length+nullCharacter.length+treeBodyLength)
    tree.write(treeHeader)
    //lineFeedCharacter.copy(commit,commitHeader.length,0,lineFeedCharacter.length)
    tree.write(nullCharacter,treeHeader.length)
    treeBody.copy(tree,treeHeader.length+nullCharacter.length,0,treeBodyLength)

    ////////////////
    console.log(tree,"Tree")
    console.log(tree.length,"Tree length")
    const shaStore = this.calculateshaOfStore(tree)
    console.log(shaStore, "sha of tree")
    const dirPath = "./.git/objects/" + shaStore.substring(0,2) // to do : remove hardcoding of .git/objects
    !fs.existsSync(dirPath)?fs.mkdirSync(dirPath):""
    const filePath = dirPath + "/" + shaStore.substring(2)
    fs.writeFileSync('.git/inflatedTree',tree)
    fs.writeFileSync(filePath,zlib.deflateSync(tree))
    return shaStore
}

private _writeCommitObjectToDB(): void
{
    // if(this._isAlreadyCommitted())
    // {
    //     console.log("Nothing to commit.Working tree clean.")
    //     process.exit(1)
    // }
    //this.treeSha = this._writeTreeObjectToDB()
    const parentCommitSha = this._getParentCommit()
    console.log(parentCommitSha,"Parent commit sha")
    
    const doubleLineFeedCharacter = Buffer.alloc(2).fill("0A0A",0,2,'hex')
    const commitSignature = "commit"
    const treeSignature = "tree"
    const space = " "
    const nullCharacterLength = 1
    const treeSha = this._treeShaSpace.toString('hex')
    const lineFeedCharacter = Buffer.alloc(1).fill("0A",0,1,'hex')
    const parentCommitSignature = "parent "
    const parentCommit = parentCommitSha?parentCommitSignature+parentCommitSha:""
    const author = "author Narayanan <narayanan.cs.31@gmail.com>"
    const timeNow = new Date().getTime().toString()
    const committer = "committer Narayanan <narayanan.cs.31@gmail.com>"
    //const timeNowAgain = new Date().getTime()
    const commitMessage = process.argv[2]
    const commitBodyLength = lineFeedCharacter.length+treeSignature.length+space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+space.length+timeNow.toString().length+lineFeedCharacter.length+committer.length+space.length+timeNow.toString().length+doubleLineFeedCharacter.length+process.argv[2].length+lineFeedCharacter.length
    console.log(commitBodyLength,"length of the commit body")
    const commitHeader = commitSignature+ space+ commitBodyLength
    const commit = Buffer.alloc(commitHeader.length+commitBodyLength)
    commit.write(commitHeader)
    //lineFeedCharacter.copy(commit,commitHeader.length,0,lineFeedCharacter.length)
    commit.write("\u0000",commitHeader.length)
    commit.write(treeSignature+space+treeSha,commitHeader.length+nullCharacterLength)
    lineFeedCharacter.copy(commit,commitHeader.length+nullCharacterLength+treeSignature.length+
                           space.length+treeSha.length,0,lineFeedCharacter.length)
    commit.write(parentCommit,commitHeader.length+nullCharacterLength+treeSignature.length+
        space.length+treeSha.length+lineFeedCharacter.length)
        lineFeedCharacter.copy(commit,commitHeader.length+nullCharacterLength+treeSignature.length+
            space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length,0,lineFeedCharacter.length)
    commit.write(author+space+timeNow,commitHeader.length+nullCharacterLength+treeSignature.length+
        space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length)
        lineFeedCharacter.copy(commit,commitHeader.length+nullCharacterLength+treeSignature.length+
            space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+
            space.length+timeNow.length)
            lineFeedCharacter.copy(commit,commitHeader.length+nullCharacterLength+treeSignature.length+
                space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+
                space.length+timeNow.length,0,lineFeedCharacter.length)
    commit.write(committer+space+timeNow,commitHeader.length+nullCharacterLength+treeSignature.length+
        space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+
        space.length+timeNow.length+lineFeedCharacter.length)
    doubleLineFeedCharacter.copy(commit,commitHeader.length+nullCharacterLength+treeSignature.length+
        space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+
        space.length+timeNow.length+lineFeedCharacter.length+committer.length+space.length+timeNow.length,0,doubleLineFeedCharacter.length)
    commit.write(commitMessage,commitHeader.length+nullCharacterLength+treeSignature.length+
        space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+
        space.length+timeNow.length+lineFeedCharacter.length+committer.length+space.length+timeNow.length+doubleLineFeedCharacter.length)                    
    lineFeedCharacter.copy(commit,commitHeader.length+nullCharacterLength+treeSignature.length+
        space.length+treeSha.length+lineFeedCharacter.length+parentCommit.length+lineFeedCharacter.length+author.length+
        space.length+timeNow.length+lineFeedCharacter.length+committer.length+space.length+timeNow.length+doubleLineFeedCharacter.length
        +commitMessage.length,0,lineFeedCharacter.length)

    const shaStore = this.calculatesha(commit)
    const dirPath = "./.git/objects/" + shaStore.substring(0,2) // to do : remove hardcoding of .git/objects
    !fs.existsSync(dirPath)?fs.mkdirSync(dirPath):""
    const filePath = dirPath + "/" + shaStore.substring(2)
    fs.writeFileSync('.git/debugCommit',commit)
    fs.writeFileSync(filePath,zlib.deflateSync(commit))
    this._writeToMaster(shaStore)
    //Message to display to user
    console.log("committed to master: "+ shaStore)

   
}
private _writeToMaster(sha: string): void
{
    const masterFilePath = ".git/refs/heads/master"
    fs.writeFileSync(masterFilePath,sha)
    const lineFeedCharacter = Buffer.alloc(1)
        lineFeedCharacter.fill("0A",0,1,'hex')
        fs.appendFileSync(masterFilePath,lineFeedCharacter)

}
private _isParentCommitPresent(): boolean
{
    return fs.readFileSync('.git/refs/heads/master') !== null
}

private _getParentCommit(): string
{
    if(!this._isParentCommitPresent())
    {
        return null
    }
    return fs.readFileSync('.git/refs/heads/master',{encoding:'ascii'})
}

public updateIndex()
{console.log("here")
    this._extractOldEntries()
    if(this._isAlreadyCommitted())
    {
        console.log("Nothing to commit.Working tree clean.")
        return //process.exit(1)
    }
    if(process.argv.length < 3)
        {
                 console.log(`Expected 3 arguments. Got ${process.argv.length}`)
                 process.exit(1)
        }
    //const numberOfEntriesCovered = Buffer.alloc(4)
    let stagingArea = fs.readFileSync(this._stagingArea)
    let stagingAreaCopy
    if(stagingArea.includes("TREE"))
    {
        stagingAreaCopy= Buffer.alloc(stagingArea.indexOf("TREE")+ 33 + 20)//33 is for tree extension data and 20 is for sha of staging area
    } else{
        stagingAreaCopy = Buffer.alloc(stagingArea.length + 33)//20 for sha is included in stagingArea
    }
     
    stagingArea.copy(stagingAreaCopy,0,0,stagingArea.length)
    console.log(stagingAreaCopy,"afer reading the index")
    //this.utils.appendDataToFile(this._stagingArea, this._getExtensionHeader())
    const nullPath= "\u0000"// Buffer.alloc(1).fill('\u0000') 
    const numberOfEntries = this._individualOldEntries.length//Buffer.alloc(1).fill(this._individualOldEntries.length)//this.utils.writeIntegersToBuffer(numberOfEntriesCovered, this._individualOldEntries.length, 32, 0, "BE")
    const spaceCharacter = " "//Buffer.alloc(1).fill("0x20")
    const numberOfSubTrees = 0//Buffer.alloc(1).fill(0) //Todo: find out the number of trees
    const lineFeedCharacter = Buffer.alloc(1).fill("0A",0,1,'hex')
    this.treeSha = this._writeTreeObjectToDB()
    console.log(this.treeSha," After writing tree object")
    this._treeShaSpace = Buffer.alloc(20)
    this._treeShaSpace.fill(this.treeSha,0,20,'hex')
    console.log(this._treeShaSpace,"Tree sha space") 
    const lengthOfTreeExtensionData = 1+1+1+1+1+20//nullPath.length + numberOfEntries.length + spaceCharacter.length + numberOfSubTrees.length + lineFeedCharacter.length + this.treeSha.length
    const treeExtensionLength = this.utils.allocateBufferSpace(4)
    this.utils.writeIntegersToBuffer(treeExtensionLength,lengthOfTreeExtensionData,32,0,"BE")
    const treeSignature = "TREE"
    let overwritingPosition
    if(stagingAreaCopy.includes("TREE"))
    {
        overwritingPosition = stagingAreaCopy.indexOf("TREE")
    } else{
        overwritingPosition = stagingAreaCopy.length -20 - 33
    }
    console.log(overwritingPosition,"Position")
        console.log(stagingAreaCopy,"Before writing content")
        console.log(stagingAreaCopy.length,"Before writing content")
        stagingAreaCopy.write(treeSignature,overwritingPosition)
        console.log(stagingAreaCopy,"After writing signature")
        console.log(stagingAreaCopy.length,"After writing signature")
        treeExtensionLength.copy(stagingAreaCopy,overwritingPosition+treeSignature.length,0,4)
        console.log(stagingAreaCopy,"After writing treeExtension Length")
        stagingAreaCopy.write(nullPath+numberOfEntries+spaceCharacter+numberOfSubTrees,overwritingPosition+treeSignature.length+treeExtensionLength.length)
        lineFeedCharacter.copy(stagingAreaCopy,overwritingPosition+treeSignature.length+treeExtensionLength.length+nullPath.length+1+spaceCharacter.length+1,0,1)
        console.log(stagingAreaCopy,"After writing content")
       // console.log(stagingAreaContent.length+overwritingPosition,"position to write tee sha")
       this._treeShaSpace.copy(stagingAreaCopy, overwritingPosition+treeSignature.length+treeExtensionLength.length+nullPath.length+1+spaceCharacter.length+1+lineFeedCharacter.length,0,this._treeShaSpace.length)
        console.log(stagingAreaCopy,"After writing tree sha")
    
    const sha = this._calculateShaOfStagingArea()
   // this.utils.appendDataToFile(this._stagingArea, shaOfStagingArea)
   const shaOfStagingArea = Buffer.alloc(20).fill(sha,0,20,'hex')
   //console.log(shaOfStagingArea,"Sha of staging Area")
   //shaOfStagingArea.copy(stagingAreaCopy,stagingAreaCopy.length-20,0,20)
   shaOfStagingArea.copy(stagingAreaCopy,overwritingPosition+treeSignature.length+treeExtensionLength.length+nullPath.length+1+spaceCharacter.length+1+lineFeedCharacter.length+this._treeShaSpace.length,0,20)
   console.log(stagingAreaCopy.length,"Staging Area copy length")
   fs.writeFileSync(".git/debugIndex",stagingAreaCopy)
   //fs.unlinkSync(this._stagingArea)
   fs.writeFileSync(this._stagingArea,stagingAreaCopy)
    this._writeCommitObjectToDB() 
}
private _calculateShaOfStagingArea(): string
{
    const stagingArea = fs.readFileSync(this._stagingArea)
    const shaOfStagingArea = crypto.createHash('sha1').update(stagingArea).digest('hex')
    return shaOfStagingArea
}
public _isAlreadyCommitted(): boolean
{
    if(!fs.existsSync(this._stagingArea))
    
    {
        return false
    }
    const stagingArea = fs.readFileSync(this._stagingArea)//fs.readFileSync(".git/debugIndex")
    console.log(stagingArea,"Inside Is Already Committed staging area")
    if(!stagingArea.includes("TREE"))
    {
        return false
    }
    const treeSha = Buffer.alloc(20)
    let numberOfEntries  = Buffer.alloc(2)
     stagingArea.copy(numberOfEntries,0,stagingArea.indexOf("TREE")+9,stagingArea.indexOf("TREE")+11)
     console.log(numberOfEntries.toString(), typeof numberOfEntries,"Number of entries")
    if(numberOfEntries.toString() === "-1") 
    {
        return false
    }

    stagingArea.copy(treeSha,0,stagingArea.length - 40, stagingArea.length - 20)
    console.log(treeSha,"treeSha inside isAlreadyCommitted")
    const treeDir = treeSha.toString('hex').substring(0,2)
    const treeFile = treeSha.toString('hex').substring(2)
    const deflatedTreeContents = fs.readFileSync(".git/objects/"+ treeDir+"/"+ treeFile)
    const inflatedTreeContents = zlib.inflateSync(deflatedTreeContents)
    console.log(inflatedTreeContents,"tree extension contents")
    fs.writeFileSync(".git/AlreadyCommitted",inflatedTreeContents)
    let isAlreadyCommited = true
    this._individualOldEntries.forEach(entry=>{
        if(!inflatedTreeContents.includes(this._getSha1Of(entry)))
        {
            console.log("Inside false")
            
            isAlreadyCommited = false
            //return
        }
        //console.log("Inside true")
        
            //isAlreadyCommited = true
        
        
    })

return isAlreadyCommited
}

}
    
//let shaString = '1947671935eaf146411b93b8637c70a84ee97d79'


// let shaStrBinary = Buffer.from(dirPath)
// console.log(shaStrBinary.toString())
// let uncompressedContent = zlib.inflateSync(shaStrBinary.toString())
// console.log(uncompressedContent,"original content")
// let originalContent = sha1.privateDecrypt(shaString, uncompressedContent)
// console.log(originalContent)
// let dirPath = '.git/objects/f6/660630f707217da49e7aab14c8b46bc307cbff'
// let deflatedStore = fs.readFileSync(dirPath)
// let shaStore = zlib.inflateSync(deflatedStore)
// console.log(shaStore.toString('utf8'))// console.log(deflatedStore.toString('utf8'))

//   fs.writeFileSync('.git/f6..ff',shaStore)
//console.log(shaStore.toString('utf8').substring(0,4))


 
/**
 * For committing,
 * check if index file exists
 * get all individual old entries in index file
 * get all the modes(25-28), sha1 values(41-60), filenames(65-76 bits is filename length and following that is the file name) in those individual entries
 * prepare the tree object
 *  * signature (tree<space><length of the remaining document>)
 *  * null character
 *  * repeat this
 *         * mode space filename null sha1 null(if it is not last entry) 
 * write down the tree object to DB and get the tree object key 
 * check if parent commit is present in refs/heads/master
 * if present then get the parent commit object key
 * get the name and email from config
 * prepare the commit object
 * write down the commit object to DB
 * Update the index with tree object that was inside commit object
 * * when updating the index with the tree object
 *      for the first time, update in place of integrity sha1 and append the new integrity sha1. The tree extension is not  present.
 *      for subsequent times, the tree entry is present and so update in place of the previous tree entry
 */

/**
 * when issuing the commit command more than 1 time, it should be idempotent
 * which means when a commit is issued then check for the parent commit , if it is there then , get its contents
 * and get the tree object and get its contents and check if all the filenames are present against the old individual entries
 * if present then pass the message as nothing to commit , working tree clean. if not present then go to line number 27
 */

