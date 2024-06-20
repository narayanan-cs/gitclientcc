import * as fs from 'fs'
import * as crypto from 'crypto'
import * as zlib from 'zlib'
import {FileType} from './FileType'
//const fs = require("file-system")
//const zlib = require('zlib')
//const sha1 = require('sha1')


export class HashObject 
{
private _stat: fs.Stats
private _header: string
public path: string
protected shaStore: string
constructor(path: string)
{
    this.path = path
    this.setStat()
    const newFileType = new FileType()
    this.setHeader(newFileType.getFileType(this.path))
}
public setStat(): void
{
    this._stat = fs.statSync(this.path)
}

public getStat(): fs.Stats
{
    return this._stat
}

public setHeader(fileType: string): void
{
 this._header = fileType+ " " + this.getStat().size + "\u0000"
}

public getHeader(): string
{
    return this._header
}

public readFileContent(): Buffer
{
    const fileContent = fs.readFileSync(this.path)
    return fileContent
}

public createStore(): Buffer
{
    const header = this.getHeader()
    const body = this.readFileContent()
    let store = Buffer.alloc(header.length+body.length)
    store.write(header)
    body.copy(store,header.length,0,body.length)
    return store
}

public calculateshaOfStore(): string
{//to do : get the variables from .env file
  return crypto.createHash('sha1').update(this.createStore()).digest('hex')
// const key = crypto.createHash('sha512').update("SECRET",'utf-8').digest('hex').substring(0,32)
// console.log(key,"key")
// const iv = crypto.createHash('sha512').update("SALT",'utf-8').digest('hex').substring(0,16)
// console.log(iv,"iv")
// const encryptedMessage = this._encryptMessage(this.createStore(),'sha1',key,iv)
// console.log(encryptedMessage,"encrypted message")
// return encryptedMessage
// return crypto.createCipheriv('sha1',SECRET,SALT)
 
//  sha1
//         .createHmac('sha1',"SECRET")//process.env.SECRET_KEY
//         .update(this.createStore())
//         .digest('hex')
}

private _encryptMessage(plainText: string, encryptionMethod: string , secret: crypto.CipherKey , iv: crypto.BinaryLike): string
{
    const encryptor = crypto.createCipheriv('sha',secret, iv)
    const sha1EncryptedMessage = encryptor.update(plainText,'utf-8','hex')+ encryptor.final('hex')
    return Buffer.from(sha1EncryptedMessage).toString('hex')
}

public deflateStore(): Buffer
{
 //   this.shaStore = this.calculateshaOfStore()
    return zlib.deflateSync(this.createStore())
}

public getShaStore(): string
{
    return this.shaStore
}

public writeToObjectDB(): void
{// to do : get the variables from .env file
    const deflatedStore = this.deflateStore()
    const shaStore = this.calculateshaOfStore()
    const dirPath = "./.git/objects/" + shaStore.substring(0,2) // to do : remove hardcoding of .git/objects
    !fs.existsSync(dirPath)?fs.mkdirSync(dirPath):""
    const filePath = dirPath + "/" + shaStore.substring(2)
    fs.writeFileSync(filePath,deflatedStore)
}
}


//const hashObj = new HashObject("./test2.txt")
//hashObj.writeToObjectDB()
// calculate hash-object of a blob
// const data = fs.statSync("../gittest4/hello-world.txt")
// const header = "blob "+ data.size + "\u0000"
// const content = fs.readFileSync("../gittest4/hello-world.txt")
// console.log(content,"blob content")
// const store = header+content
// const shaStore = sha1
//         .createHmac('sha1',"SECRET")//process.env.SECRET_KEY
//         .update(store)
//         .digest('hex')
// const deflatedStore = zlib.deflateSync(store)
// console.log(deflatedStore,"deflatedStore")
// const dirPath = "../gittest4/.git/objects/" + shaStore.substring(0,2) 
// fs.mkdirSync(dirPath)  
// const filePath = dirPath + "/" + shaStore.substring(2)
// fs.writeFileSync(filePath,deflatedStore)
//  const path2 = "../gittest4/.git/objects/hello-world4/hello"
//  const path3 =
//   fs.mkdirSync(path2,{recursive:true})
//  fs.writeFileSync(path3,"Hello world too")
//}
// export {}