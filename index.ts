//import * as fs from 'fs'

var fs = require("file-system")
var sha1 = require('sha1');
const FILE_NAME = '.git/index'
const CURRENT_FILE_NAME = 'test2.txt'
fs.mkdir('../gittest/.git')
fs.writeFileSync('../gittest/.git/HEAD','ref: refs/heads/master')
fs.writeFileSync('../gittest/.git/config',Buffer.from('[core] repositoryformatversion = 0'))
fs.appendFileSync('../gittest/.git/config',Buffer.alloc(2).fill('0A09',0,2,'hex'))
fs.appendFileSync('../gittest/.git/config',('filemode = false'))
fs.appendFileSync('../gittest/.git/config',Buffer.alloc(2).fill('0A09',0,2,'hex'))
fs.appendFileSync('../gittest/.git/config','bare = false')
fs.appendFileSync('../gittest/.git/config',Buffer.alloc(2).fill('0A09',0,2,'hex'))
fs.appendFileSync('../gittest/.git/config','logallrefupdates = true') 
fs.appendFileSync('../gittest/.git/config',Buffer.alloc(2).fill('0A09',0,2,'hex'))
fs.appendFileSync('../gittest/.git/config','symlinks = false')
fs.appendFileSync('../gittest/.git/config',Buffer.alloc(2).fill('0A09',0,2,'hex'))
fs.appendFileSync('../gittest/.git/config','ignorecase = true')
fs.writeFileSync('../gittest/.git/description','Unnamed repository; edit this file \'description\' to name the repository.')
fs.writeFileSync('../gittest/.git/HEAD','ref: refs/heads/master')
const shaContent = sha1("test2")
fs.mkdir('../gittest/.git/hooks')
fs.mkdir('../gittest/.git/info')
fs.mkdir('../gittest/.git/objects')
fs.mkdir('../gittest/.git/refs/heads')
fs.mkdir('../gittest/.git/refs/tags')

 var zlib = require('zlib');
// var input = "Hellow world";
//const deflated = zlib.deflateSync('f48dd853820860816c75d54d0f584dc863327a7c')
//console.log(deflated)
// var deflated = zlib.deflateSync(input).toString('base64');
// var inflated = zlib.inflateSync(Buffer.from(deflated, 'base64')).toString();


const version = Buffer.alloc(4)
const numberOfEntries = Buffer.alloc(4)
version.fill(2,3)
numberOfEntries.fill(1,3)
fs.writeFileSync(FILE_NAME,"DIRC"+ version + numberOfEntries)

const birthtime = Buffer.alloc(4)
const mtime = Buffer.alloc(4)
const birthtimeInNanoSeconds = Buffer.alloc(4)
const mtimeInNanoSeconds = Buffer.alloc(4)
const device = Buffer.alloc(4)
const inode = Buffer.alloc(4)
const mode = Buffer.alloc(4)
const userId = Buffer.alloc(4)
const groupId = Buffer.alloc(4)
const fileContentLength = Buffer.alloc(4)
const sha = Buffer.alloc(20)
const flags = Buffer.alloc(2)
//const fileNames = Buffer.alloc(4095)

const stats = fs.statSync(FILE_NAME)
//console.log(FILE_NAME.length)


birthtimeInNanoSeconds.fill(0)
mtimeInNanoSeconds.fill(0)
device.fill(0)
inode.fill(0)
mode.writeInt32BE(0x81A4)
userId.fill(0)
groupId.fill(0)
fileContentLength.writeInt32BE(stats.size)
sha.fill(shaContent,0,20,'hex')
//console.log(deflated.length,"sha len")
flags.writeIntBE(CURRENT_FILE_NAME.length,1,1)
//fileNames.fill('hello-world.txt')

birthtime.writeInt32BE(Math.floor( new Date(stats.birthtime).getTime()/1000))
mtime.writeInt32BE(Math.floor( new Date(stats.mtime).getTime()/1000))



fs.appendFileSync(FILE_NAME, birthtime)
fs.appendFileSync(FILE_NAME,birthtimeInNanoSeconds)
fs.appendFileSync(FILE_NAME, mtime)
fs.appendFileSync(FILE_NAME,mtimeInNanoSeconds)
fs.appendFileSync(FILE_NAME,device)
fs.appendFileSync(FILE_NAME,inode)
 fs.appendFileSync(FILE_NAME,mode)
 fs.appendFileSync(FILE_NAME,userId)
fs.appendFileSync(FILE_NAME,groupId)
 fs.appendFileSync(FILE_NAME,fileContentLength)
  fs.appendFileSync(FILE_NAME,sha)
  fs.appendFileSync(FILE_NAME,flags)
  fs.appendFileSync(FILE_NAME,'test.txt\u0000\u0000\u0000')
  //fs.appendFileSync(FILE_NAME,Buffer.from(NULL))
  // fs.appendFileSync(FILE_NAME,"TREE")
  // fs.appendFileSync(FILE_NAME,Buffer.alloc(4).writeInt32BE(26,0))
  // fs.appendFileSync(FILE_NAME,Buffer.alloc(1).fill(''))
  // fs.appendFileSync(FILE_NAME,Buffer.alloc(1).fill(0,1,20,'hex'))
  // fs.appendFileSync(FILE_NAME,Buffer.alloc(1).fill(0,1,48,'hex'))
  // fs.appendFileSync(FILE_NAME,Buffer.alloc(1).fill(0x0A))
  // fs.appendFileSync(FILE_NAME,Buffer.alloc(1).fill(0,1,20,'hex'))


  
export {}