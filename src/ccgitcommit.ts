import { Commit } from "./Commit"
import { Utils } from "./Utils"
import * as fs from 'fs'
import * as zlib from 'zlib'
import * as crypto from 'crypto'


const commit = new Commit(new Utils())
commit.updateIndex()

//eval(`console.log('git gc')`)
// const hash = crypto.createHash('sha1').update(fs.readFileSync('.git/objects/a4/7aad5898c5ccabd6edfe1b92f9d78707c04471')).digest('hex')
// console.log(hash,"object database value")
// const objectLocation = ".git/objects/35/b1fc0b53ff0bc0780d28e670843242e3be3a80"
// const zippedContent = fs.readFileSync(objectLocation)
// const content = zlib.inflateSync(zippedContent)
// console.log("Here")
//  fs.writeFileSync("tree",content)
// const hash = crypto.createHash('sha1').update(fs.readFileSync('.git/objects/a4/7aad5898c5ccabd6edfe1b92f9d78707c04471')).digest('hex')
// console.log(hash,"object database value")

// const objectLocation = ".git/objects/78/755f04a1d4a2a91b6df4d9fddd84775fc5f8d7"
// const zippedContent = fs.readFileSync(objectLocation)
// const content = zlib.inflateSync(zippedContent)
// fs.writeFileSync("./blob",content)

// console.log(new Date().toDateString(),new Date().toISOString(),new Date().toLocaleDateString()
// ,new Date().toLocaleString(),new Date().toLocaleTimeString(),new Date().toString(),
// new Date().toTimeString(),new Date().toUTCString(), Date.now())