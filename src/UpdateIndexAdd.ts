import * as fs from 'fs'
import { Zlib } from 'zlib'
import * as sha1 from 'crypto'
import * as Ftype from './FileType'
import { indexEntry } from './types/index'
import {BufferSpace} from './types/BufferSpace'
import { Utils } from './Utils'
import * as version from './types/version'
import {HashObject} from './HashObject'
export class UpdateIndex
{
    indexEntries: indexEntry[]
    utils: Utils
    stats: fs.Stats
    args: string[]
    newFileNames: string[]
    oldEntries: Buffer
    individualOldEntries: Buffer[]
    extensions: Buffer
    modifiedExtensions: Buffer
    numberOfIndexEntriesToWriteInIndexSignature: number
   private _fileName: string
    //constructor(indexEntry: {[key:string]: bigint|number|string}, utils: Utils)
    constructor(utils: Utils,indexEntries: {[key:string]: bigint|number|string}[])
    {
        // this.args = process.argv
        // if(this.args.length < 5)
        // {
        //     console.log(`Expected 5 arguments. Got ${this.args.length}`)
        //     process.exit(1)
        // }
        this._fileName = "./.git/index"
        this.newFileNames = []
        this.utils = utils
        this.modifiedExtensions = Buffer.alloc(0)    
        const inputNumberOfEntries = this.getNumberOfIndexEntriesToWriteInIndex(indexEntries)
        this._initializeIndexEntries(inputNumberOfEntries)
        this.calculateNumberOfIndexEntriesToWriteInIndexSignature(indexEntries)
        this.allocateSpaceForProps()
        //this._allocateSpaceForFileNameProps(indexEntries)
        //this.setStats(this.newFileNames)
        if(fs.existsSync(this._fileName))
        {
          //  this._extractOldEntries()
            this._extractExtensions()
            this._invalidateExtensions()
            
        }
        
        this.fillOrWriteProps(indexEntries)
        if(fs.existsSync(this._fileName))
        {
            this._prepareIndexEntries()
        }
    }

    private _readIndex(): Buffer
    {
      return  fs.readFileSync(this._fileName)
    }
    private _extractOldEntries(): void
    {
        let firstEntryLength
        let fileNameLength = this.utils.allocateBufferSpace(2)
        let firstEntry:Buffer
        
        let indexFileContents = this._readIndex()//fs.readFileSync(this._fileName)
            //this.oldEntries = this.utils.allocateBufferSpace(indexFileContents.indexOf('TREE')!== -1?indexFileContents.indexOf('TREE'):indexFileContents.length)
            this.oldEntries = this.utils.allocateBufferSpace(indexFileContents.indexOf('TREE')!== -1?(indexFileContents.indexOf('TREE') - 12):(indexFileContents.length - 20 - 12))
            console.log(this.oldEntries.length,"Old Entries Length")
            //console.log(this.oldEntries,"old Entries")

    //            move thsi copy to utils
            indexFileContents.copy(this.oldEntries,0,12,indexFileContents.indexOf('TREE')!== -1?indexFileContents.indexOf('TREE')+1:indexFileContents.length - 19)
            //first entry
            
            let i = 12// start of Index Entry 
             let j = i + 60//start of fileName length
             
             indexFileContents.copy(fileNameLength,0,j,j+2)
             console.log(fileNameLength,"FilenameLength Buffer")
             firstEntryLength = <number>this.utils.readIntegersFromBuffer(fileNameLength,16,0,'BE')
             
             console.log(firstEntryLength,"First entry fileName length")
             let spaceForNull = 8 - (j + 2 + firstEntryLength - i)%8
             firstEntry = this.utils.allocateBufferSpace(j+2+firstEntryLength+spaceForNull-i)
             indexFileContents.copy(firstEntry,0,i,j+2+firstEntryLength+spaceForNull)
             this.individualOldEntries.push(firstEntry)
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
             spaceForNull = 8 - (l + 2 + secondEntryLength - k)%8
             secondEntry = this.utils.allocateBufferSpace(l+2+secondEntryLength+spaceForNull-k)
             indexFileContents.copy(secondEntry,0,k,l+2+secondEntryLength+spaceForNull)
            console.log(secondEntry.toString(),"second Entry content")
            this.individualOldEntries.push(secondEntry)
            
            k = l + 2 + secondEntryLength + spaceForNull
            l = k + 60
            
        }
            this.individualOldEntries.forEach(entry=>{
                console.log(entry.length,"Entry length")
                console.log(entry.toString(),"Entry content")
            })
            
            console.log(this.oldEntries.toString(),"old Entries") 
            
    }
    
    private _extractExtensions(): void
    {
        
        let indexFileContents = this._readIndex()
        
        if(!indexFileContents.includes("TREE"))
        {
            return null
        }
        //this.extensions = this.utils.allocateBufferSpace(indexFileContents.length - (indexFileContents.indexOf('TREE')!== -1?indexFileContents.indexOf('TREE'):indexFileContents.length))
        this.extensions = this.utils.allocateBufferSpace(indexFileContents.length-indexFileContents.indexOf('TREE'))
             console.log(this.extensions,"Extensions")
        //indexFileContents.copy(this.extensions,0,indexFileContents.indexOf('TREE')!==-1?indexFileContents.indexOf('TREE'):0,indexFileContents.indexOf('TREE')!==-1?indexFileContents.length:1)
        indexFileContents.copy(this.extensions,0,indexFileContents.indexOf('TREE'),indexFileContents.length)
             console.log(this.extensions,"Extensions")
            
    }

    private _invalidateExtensions():void
    {
        this.modifiedExtensions = Buffer.alloc(14)//14 is for tree extension data
        const invalidatedEntry = Buffer.alloc(2)//Buffer.alloc(2).fill(-1,0,2,'ascii')
        invalidatedEntry.write("-1")
        const treeSignature = "TREE"
        const nullPath= "\u0000"// Buffer.alloc(1).fill('\u0000') 
    const numberOfEntries = this.individualOldEntries.length//Buffer.alloc(1).fill(this.individualOldEntries.length)//this.utils.writeIntegersToBuffer(numberOfEntriesCovered, this._individualOldEntries.length, 32, 0, "BE")
    const spaceCharacter = " "//Buffer.alloc(1).fill("0x20")
    const numberOfSubTrees = 0//Buffer.alloc(1).fill(0) //Todo: find out the number of trees
    const lineFeedCharacter = Buffer.alloc(1).fill("0A",0,1,'hex')
    const lengthOfTreeExtensionData = 1+2+1+1+1//nullPath.length + invalidatedEntry.length + spaceCharacter.length + numberOfSubTrees.length + lineFeedCharacter.length
    const treeExtensionLength = this.utils.allocateBufferSpace(4)
    this.utils.writeIntegersToBuffer(treeExtensionLength,lengthOfTreeExtensionData,32,0,"BE")
    
        this.modifiedExtensions.write(treeSignature)
        treeExtensionLength.copy(this.modifiedExtensions,treeSignature.length,0,4)
        this.modifiedExtensions.write(nullPath+invalidatedEntry+spaceCharacter+numberOfSubTrees,treeSignature.length+treeExtensionLength.length)
        
        lineFeedCharacter.copy(this.modifiedExtensions,treeSignature.length+treeExtensionLength.length+nullPath.length+invalidatedEntry.length+spaceCharacter.length+1,0,1)
        console.log(this.modifiedExtensions,"After writing content")
         fs.writeFileSync(".git/debugExtensions",this.modifiedExtensions)
       
        
     
        
        
    }
    private _initializeIndexEntries(inputNumberOfEntries: number): void
    {
        this.indexEntries = []
        this.individualOldEntries = []
        console.log(this.newFileNames,"New filenames")
        for(let i=0;i< inputNumberOfEntries;i++)
        {
        this.indexEntries[i] = 
             {
                fileName: null,
                version: null,
                numberOfEntries: null,
                signature: null,
                birthTime: null,
                mtime: null,
                birthtimeInNanoSeconds: null,
                mtimeInNanoSeconds: null,
                device: null,
                inode: null,
                mode: null,//100644-normal file,1007455-exe,120000-symlink
                userId: null,
                groupId: null,
                fileContentLength: null,
                sha: null,
                flags: null,
            }
        } 
         console.log(this.indexEntries,"After initialization")
    }

    public allocateSpaceForProps(): void
    {
        this.oldEntries = this.utils.allocateBufferSpace(0)
        this.indexEntries.forEach(indexEntry=>{
        indexEntry.signature = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.version = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.numberOfEntries = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.birthTime = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.birthtimeInNanoSeconds = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.device = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.fileContentLength = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.flags = this.utils.allocateBufferSpace(BufferSpace.flags)
        //indexEntry.fileName = this.utils.allocateBufferSpace(0)//Find a way to initialize space based on input
        indexEntry.groupId = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.inode = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.mtime = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.mtimeInNanoSeconds = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.sha = this.utils.allocateBufferSpace(BufferSpace.sha)
        indexEntry.userId = this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        indexEntry.mode =  this.utils.allocateBufferSpace(BufferSpace.indexEntry)
        })
        this.extensions = this.utils.allocateBufferSpace(0)
        console.log(this.indexEntries,"After space allocation")
         
        
    }
    
    public fillOrWriteProps(indexEntries: {[key:string]: bigint|number|string}[]): void
    {
        if(!this.indexEntries.length)
        {
            return
        }
        let i=0
        //here we should take care that duplicate entries are allowed to override previous entries in index and original entries are preserved and new entries are appended
        indexEntries.forEach(indexEntry=>{
           
           this.indexEntries[i].fileName = <string>indexEntry.fileName
            this.setStats(this.indexEntries[i].fileName)
            this.indexEntries[i].fileContentLength = this.utils.writeIntegersToBuffer(this.indexEntries[i].fileContentLength,<number> indexEntry.fileContentLength,32)//thisthis.getFileContentLength(this.indexEntries[i].fileName)
           this.indexEntries[i].birthTime = this.utils.writeIntegersToBuffer(this.indexEntries[i].birthTime, Math.floor( new Date(this.stats.birthtime).getTime()/1000),32,0, 'BE')
           this.indexEntries[i].mtime = this.utils.writeIntegersToBuffer(this.indexEntries[i].mtime, Math.floor( new Date(this.stats.mtime).getTime()/1000),32,0, 'BE')
           this.indexEntries[i].birthtimeInNanoSeconds = this.utils.fillBuffer(this.indexEntries[i].birthtimeInNanoSeconds,0)//to do: understand nanoseconds concept and fill inthe values in buffer
           this.indexEntries[i].mtimeInNanoSeconds = this.utils.fillBuffer(this.indexEntries[i].mtimeInNanoSeconds,0)
           this.indexEntries[i].device = this.utils.fillBuffer(this.indexEntries[i].device,0)
           this.indexEntries[i].inode = this.utils.fillBuffer(this.indexEntries[i].inode,0)
           this.indexEntries[i].mode = this.utils.writeIntegersToBuffer(this.indexEntries[i].mode,0x81A4,32,0,'BE') //To do: get the mode based on type of file: text file or exe or links/symlinks..
           this.indexEntries[i].userId = this.utils.fillBuffer(this.indexEntries[i].userId,0)
           this.indexEntries[i].groupId = this.utils.fillBuffer(this.indexEntries[i].groupId,0)
           this.indexEntries[i].flags = this.utils.writeIntegersToBuffer(this.indexEntries[i].flags,<number>indexEntry.fileNameLength,16,0,'BE')       
           this.indexEntries[i].sha = this.utils.fillBuffer(this.indexEntries[i].sha,<string>indexEntry.sha,0,BufferSpace.sha,'hex')
           this.indexEntries[i].spaceForNull = <number>indexEntry.spaceForNull 
            i++
        
        
        })
        this.indexEntries.sort((a,b)=>{
            const firstFileName = a.fileName
            const secondFileName = b.fileName
            if(firstFileName > secondFileName)
             {
                 return 1
             }
             if(firstFileName < secondFileName)
             {
                 return -1
             }    
     
             return 0
         })
        console.log(this.indexEntries,"After filling props")
    }
    
    private _getFilenameOf(entry: Buffer): string
    {
        const fileNameLength = this.utils.readIntegersFromBuffer(entry, 16, 60, 'BE')
        console.log(fileNameLength,"fileName length")
        const fileName = Buffer.alloc(<number>fileNameLength)
        entry.copy(fileName, 0, 62, 62 + <number>fileNameLength)
        console.log(fileName.toString().length,"in _getFilenameFrom")
        return fileName.toString()
    }

    private _prepareIndexEntries(): void
    {
        if(!this.indexEntries.length || !this.individualOldEntries.length)
        {
            return 
        }
        
        this.indexEntries.forEach(entry=>{
            
             this.individualOldEntries.forEach(oldEntry=>{
                 console.log(entry.fileName,"Entry filename")
                 const oldFilename = this._getFilenameOf(oldEntry)
                 if(oldFilename === entry.fileName)   
                {
                this.individualOldEntries.forEach(entry=>{
                    console.log(entry.length,"Entry length before splicing")
                   // console.log(entry.toString(),"Entry content before splicing")
                })
                    this.individualOldEntries.splice(this.individualOldEntries.indexOf(oldEntry),1)
                    this.individualOldEntries.forEach(entry=>{
                        console.log(entry.length,"Entry length after splicing")
                      //  console.log(entry.toString(),"Entry content after splicing")
                    })
                    //return
                }
            })
        
        })
        console.log(this.individualOldEntries.length,"Old entries length in prepare index method")
        
    }
    
    public setStats(fileName: string): void
    {//to do: check order in which filecontene lengths are assigned to this.indexentries. It is possible here that 1 filename could be assigned another's contentlength
        this.stats = fs.statSync(fileName)
        //return this.stats.size
    }
    
    //To do: refactor this method
    public getNumberOfIndexEntriesToWriteInIndex(indexEntries: any[]): number
    {
        return indexEntries.length
    }
    public calculateNumberOfIndexEntriesToWriteInIndexSignature(indexEntries: any[]): void
    {
        let currentNumberOfEntries = 0
        let inputNumberOfEntries = 0
        
        if(fs.existsSync(this._fileName))
        {   this._extractOldEntries()
            let indexFileContents = fs.readFileSync(this._fileName)
            currentNumberOfEntries = indexFileContents[11]//to do: read this from buffer of 4 bytes length
            let oldEntriesSet = new Set()
            this.individualOldEntries.forEach((oldEntry)=>{
                const oldFilename = this._getFilenameOf(oldEntry)
                oldEntriesSet.add(oldFilename)
            })
            console.log(oldEntriesSet,"Old Entries Set")
            //const indexEntriesSet = new Set(indexEntries)
            //indexEntries.forEach(indexEntry => {
                indexEntries.forEach(indexEntry=>{
                    console.log(indexEntry.fileName,"Input filename")
                        if(!oldEntriesSet.has(indexEntry.fileName))
                        {
                            inputNumberOfEntries++
                        }
                })
            //     if(!indexFileContents.includes(indexEntry.fileName))
            //     {
            //         inputNumberOfEntries++
            // //        this.newFileNames.push(indexEntry.fileName)
            //     }
            //});
            this.numberOfIndexEntriesToWriteInIndexSignature = currentNumberOfEntries + inputNumberOfEntries
        } else {
            this.numberOfIndexEntriesToWriteInIndexSignature = indexEntries.length
        }
        console.log(this.numberOfIndexEntriesToWriteInIndexSignature,"Number of entries in signature")
        
        //return inputNumberOfEntries
    }
    public createIndex(): void
    {
        let signature = this.utils.allocateBufferSpace(4)
        this.utils.fillBuffer(signature, Ftype.FileSignature.DIRC)
        const versionNumber = this.utils.allocateBufferSpace(4)
        this.utils.fillBuffer(versionNumber,version.versionNumber.TWO,3)
        let numberOfEntries = this.utils.allocateBufferSpace(4)
        this.utils.fillBuffer(numberOfEntries, this.numberOfIndexEntriesToWriteInIndexSignature,3)
        if(fs.existsSync(this._fileName))
        {
            //console.log(this.oldEntries,"Before deleting index")
            
            fs.unlinkSync(this._fileName)//move this to utils
            //console.log(this.oldEntries,"After deleting index")
        }
        
        this.utils.writeDataToFile(this._fileName, signature)
        this.utils.appendDataToFile(this._fileName, versionNumber)
        this.utils.appendDataToFile(this._fileName, numberOfEntries)
        //console.log(fs.readFileSync(this._fileName),"index file 3 entries")
    }

    public updateIndex(): void
    {
        // this.utils.writeDataToFile(this.indexEntry.fileName, this.indexEntry.signature);console.log(this.indexEntry.version,"Version")
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.version)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.numberOfEntries)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.birthTime)
        // this.utils.appendDataToFile(this.indexEntry.fileName, this.indexEntry.birthTime)
        // this.utils.appendDataToFile(this.indexEntry.fileName, this.indexEntry.birthtimeInNanoSeconds)
        // this.utils.appendDataToFile(this.indexEntry.fileName, this.indexEntry.mtime)
        // this.utils.appendDataToFile(this.indexEntry.fileName, this.indexEntry.mtimeInNanoSeconds)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.device)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.inode)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.mode)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.userId)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.groupId)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.fileContentLength)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.sha)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.flags)
        // this.utils.appendDataToFile(this.indexEntry.fileName,this.indexEntry.fileName+'\u0000\u0000\u0000')
        //if(!fs.existsSync(this._fileName))
        //{
            this.createIndex()
        //}
        console.log(this.oldEntries,"Old Entries inside update")
        //if(this.oldEntries.length)
        if(this.individualOldEntries.length)
        {
            this.individualOldEntries.forEach(entry=>{
                this.utils.appendDataToFile(this._fileName, entry)
            })
            //this.utils.appendDataToFile(this._fileName, this.oldEntries)
        }
        
        this.indexEntries.forEach(indexEntry=>{
           
        this.utils.appendDataToFile(this._fileName, indexEntry.birthTime)
        this.utils.appendDataToFile(this._fileName, indexEntry.birthtimeInNanoSeconds)
        this.utils.appendDataToFile(this._fileName, indexEntry.mtime)
        this.utils.appendDataToFile(this._fileName, indexEntry.mtimeInNanoSeconds)
        this.utils.appendDataToFile(this._fileName, indexEntry.device)
        this.utils.appendDataToFile(this._fileName, indexEntry.inode)
        this.utils.appendDataToFile(this._fileName, indexEntry.mode)
        this.utils.appendDataToFile(this._fileName, indexEntry.userId)
        this.utils.appendDataToFile(this._fileName, indexEntry.groupId)
        this.utils.appendDataToFile(this._fileName, indexEntry.fileContentLength)
        this.utils.appendDataToFile(this._fileName, indexEntry.sha)
        this.utils.appendDataToFile(this._fileName, indexEntry.flags)
        let nullCharaters = ''
        for(let i=0;i< indexEntry.spaceForNull;i++)
        {
            nullCharaters += '\u0000'
        }
        //this.utils.appendDataToFile(this._fileName, indexEntry.fileName+'\u0000\u0000')
        this.utils.appendDataToFile(this._fileName, indexEntry.fileName + nullCharaters)
                    
        })
        
        if(this.modifiedExtensions.length)
        {
            this.utils.appendDataToFile(this._fileName, this.modifiedExtensions)
        }
         const sha = this._calculateSha()
         let indexFileSha1Signature = Buffer.alloc(20)
         indexFileSha1Signature.fill(sha,0,20,'hex')
         this.utils.appendDataToFile(this._fileName, indexFileSha1Signature)

    }
    
    public _calculateSha(): string
    {
        const fileContent = fs.readFileSync(this._fileName)
        // const shaContent = sha1
        // .createHmac('sha1',"SECRET")//process.env.SECRET_KEY
        // .update(fileContent)
        // .digest('hex')
        // const sha = this.utils.allocateBufferSpace(20)
        console.log(sha1.createHash('sha1').update(fileContent).digest('hex'),"indexfile sha1 signature")
        return sha1.createHash('sha1').update(fileContent).digest('hex')
        // this.utils.fillBuffer(sha, shaContent, 0, 20, "hex")
        // return sha
        
    }
}

