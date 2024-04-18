import * as fs from 'fs'
import * as crypto from 'crypto'
import {Utils} from './Utils'
import { HashObject } from './HashObject'
import {FileType} from './FileType'
import { Commit } from './Commit'
import { Init } from './init'
import * as os from 'os'


export class Ccgitstatus
{
    private _individualEntries: Buffer[]
    private _stagingArea: string
    private currentDirectory: string
    private currentDirectory1: os.UserInfo<string>//string
    private deletedFiles: string[]
    private untrackedFiles: string[]
    private stagedFiles: string[]
    private modifiedFiles: string[]
    public utils: Utils
    public init: Init
    private _hashObject: HashObject
    private stagingArea: Commit
    constructor(utils: Utils, stagingArea?: Commit, init?: Init,  hashObject?: HashObject)
    {
        this._individualEntries = []
        this.untrackedFiles = []
        this.modifiedFiles = []
        this.deletedFiles = []
        this.utils = utils
        this.init = init
        this._hashObject = hashObject
        this._stagingArea = ".git/index"
        console.log(this._stagingArea,"staging area")
        this.currentDirectory = "."
        console.log(this.currentDirectory,"CWD")
        //process.exit(1)
        this.stagingArea = stagingArea
        //this.stagingArea._isAlreadyCommitted()
        
            //this.getUntrackedFiles()
            //this.printStatusOfFiles()
        
        this._extractIndividualEntriesFromStagingArea()
//       this.stagingArea._extractOldEntries()
    }
    private _readIndex(): Buffer
    {
        if(!this._isStagingAreaPresent())
        {
            console.log("No staged files")
            
            //process.exit()
            this.getUntrackedFiles()
            this.printStatusOfFiles()
            return Buffer.alloc(0)
        }
      return  fs.readFileSync(this._stagingArea)
    }
    private _isStagingAreaPresent()
    {
        return fs.existsSync(this._stagingArea)
    }
    
    private _extractIndividualEntriesFromStagingArea(): void
    {
        let firstEntryLength
        let fileNameLength = this.utils.allocateBufferSpace(2)
        let firstEntry:Buffer
        if(!this._isStagingAreaPresent())
        {
            console.log("No staged files")
            return
        }
        let indexFileContents = this._readIndex()//fs.readFileSync(this._fileName)
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
             this._individualEntries.push(firstEntry)
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
            this._individualEntries.push(secondEntry)
            
            k = l + 2 + secondEntryLength + spaceForNull
            l = k + 60
            
        }
            this._individualEntries.forEach(entry=>{
                console.log(entry.length,"Entry length")
                console.log(entry.toString(),"Entry content")
            })
            console.log(oldEntries.toString(),"old Entries") 
            
    
    }

    public walkDirectory(): string[]
    {
        let directoriesAndFiles = <string[]>fs.readdirSync(this.currentDirectory,{recursive: true})
        console.log(directoriesAndFiles,"inside walk before filtering")
        function ignoreGitDirectory(entry: string)
        {
            return entry.includes(".git")?false:true
            
        }
        directoriesAndFiles = directoriesAndFiles.filter(ignoreGitDirectory)
        console.log(directoriesAndFiles,"inside walk after filtering")
        return <string[]>directoriesAndFiles
    }
    private _getSha1Of(entry: Buffer): string
    {
        const sha1 = Buffer.alloc(20)
        entry.copy(sha1, 0, 40, 60)
        console.log(sha1,"sha1")
        console.log(sha1.length,"length of sha1")
        //return sha1
        //console.log(sha1.toString('hex'))
        return sha1.toString('hex')
    }
    private _getFilenameOf(entry: Buffer): string
    {
        const fileNameLength = this.utils.readIntegersFromBuffer(entry, 16, 60, 'BE')
        const fileName = Buffer.alloc(<number>fileNameLength)
        entry.copy(fileName, 0, 62, 62 + <number>fileNameLength)
        return fileName.toString()
    }
    
    public getUntrackedFiles(): void
    {
        const directoriesAndFiles = new Set(this.walkDirectory())
        if(!this._isStagingAreaPresent())
        {
            directoriesAndFiles.forEach(entry=>{
                this.untrackedFiles.push(entry)
            })
        return    
        }
        directoriesAndFiles.forEach(entry=>{
            // const hashObject = new HashObject(entry)
            // const hashOfEntry = hashObject.calculateshaOfStore()
             let isFileFound = false
            if(this._isFile(entry))
            {
                
                this._individualEntries.forEach(indexEntry=>{
                    // if(hashOfEntry === this._getSha1Of(indexEntry))
                    // {
                    //     this.stagedFiles.push(entry)
                    // }else {
                    //     this.modifiedFiles.push(entry)
                    // }
                     if(this._getFilenameOf(indexEntry) === entry)
                    {
                        isFileFound = true
                    }
                })
            }
            if(!isFileFound)
            {
                this.untrackedFiles.push(entry)
            }
            isFileFound = false
        })
    }
    public getFilesStatus(): void
    {
        
        this.getUntrackedFiles()
        this.stagedFiles = []
        this.modifiedFiles = []
        this.deletedFiles = []
        const directoriesAndFiles = new Set(this.walkDirectory())

        console.log(directoriesAndFiles,"Contents of current directory")
        const hashesOfFiles = new Set()
        
         if(this.stagingArea._isAlreadyCommitted())
        {
            console.log("Nothing to commit. Working tree clean")
            //this.getUntrackedFiles()
            return 
        }

        directoriesAndFiles.forEach(entry=>{
            if(this._isFile(entry))
            {
                const hashObject = new HashObject(entry)
                hashesOfFiles.add(hashObject.calculateshaOfStore())
                
                console.log(entry, hashObject.calculateshaOfStore())
            }
        })
        console.log(hashesOfFiles,"hashes of files")
        this._individualEntries.forEach(entry=>
            {
            const fileName = this._getFilenameOf(entry)
            let hashOfFilename
            if(fs.existsSync(fileName))
            {
                const hashObject = new HashObject(fileName)
                hashOfFilename = hashObject.calculateshaOfStore()
                console.log(fileName,"filename in entry")
            
            }
            if(!directoriesAndFiles.has(fileName))
            {
               this.stagedFiles.push(fileName)
               this.deletedFiles.push(fileName)
            
            } else {
               if(hashOfFilename === this._getSha1Of(entry))// if(hashesOfFiles.has(this._getSha1Of(entry)))
                {
                    this.stagedFiles.push(fileName)
                } else {
                    this.stagedFiles.push(fileName)
                    this.modifiedFiles.push(fileName)
                }
            }

            })

        



    }
    private _isFile(entry: string): boolean
    {
        const stats = fs.statSync(entry)
        return stats.isFile()?true:false
        
    }
    private getFileSize(file: string): number
    {
        const stats = fs.statSync(file)
        return stats.size
    }
    public calculateshaOf(file: string): string
{//to do : get the variables from .env file
 // return crypto.createHash('sha1').update(this.createStore(treeObject)).digest('hex')
 return crypto.createHash('sha1').update(this.createStore(file)).digest('hex')
 return ""
}
public getHeader(file: string): string
{
    const newFileType = new FileType()
    return newFileType.getFileType(file)+ " " + this.getFileSize(file) + "\u0000"
}

public readFileContent(file: string): Buffer
{
    const fileContent = fs.readFileSync(file)
    return fileContent
}

public createStore(file: string): string
{
    return this.getHeader(file) + this.readFileContent(file)
}

public printStatusOfFiles()
{
    this.getFilesStatus()
    console.log(`Untracked files:`,...this.untrackedFiles)
    console.log(`Changes to be committed:`,...this.stagedFiles)
    console.log(`Modified files:`,...this.modifiedFiles)
    console.log(`Deleted files:`,...this.deletedFiles)
}
    
}

 const ccgitstatus = new Ccgitstatus(new Utils(),new Commit(new Utils()))//, new Init())//,new Commit(new Utils()))
ccgitstatus.printStatusOfFiles()
/**
 * check if all the files are committed and if the hash is same for directory files and index files. If so,
 * then working tree is clean
 * if the hash is the same for directory files and index files and the files are not committed then the files are staged
 * if hash is different then it is a modified file
 * if hash of an index file is not present in directory file then it is a deleted file
 * if the hash of a directory file is not present in index file then it is an untracked file
 *
 */