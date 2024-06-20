import * as fs from 'fs'
import { HashObject } from "./HashObject"
import { UpdateIndex } from './UpdateIndexAdd'
import { Utils } from './Utils'



export class ccgitadd 
{
  public indexEntries: {[key:string]: bigint|number|string}[]   
  public utils: Utils
  public currentDirectory: string
  constructor(utils: Utils)
  {
    this.utils = utils
    this.currentDirectory = "."
    this.indexEntries = []
    if(process.argv.length === 3 && process.argv[2] === ".")
      {
         const files = this.walkCurrentDirectoryAndGetFiles()
         console.log(files,"only files")
         for(let i=0;i<files.length;i++)
          {
            this.prepareInputIndexEntries(files[i])
          }
          console.log(this.indexEntries,"Indexentries")
      
      }
    else {
    //Do try to open the files and check if the files exist . If any file does not exist abort this command
    for(let i=2;i< process.argv.length;i++)
      {
        this.prepareInputIndexEntries(process.argv[i])
      }
      console.log(this.indexEntries,"indexEntries")
    }
    const stagingArea = new UpdateIndex(new Utils(), this.indexEntries)
      stagingArea.updateIndex()  
  }

  public walkCurrentDirectoryAndGetFiles(): string[]
    {
        let directoriesAndFiles = <string[]>fs.readdirSync(this.currentDirectory,{recursive: true})
        console.log(directoriesAndFiles,"inside walk before filtering")
        let that = this
        function ignoreDirectories(entry: string)
        {
            return that._isFile(entry)?true:false
            
        }
        const files = directoriesAndFiles.filter(ignoreDirectories)
        console.log(files,"inside walk after filtering")
        return <string[]>files
    }
    private _isFile(entry: string): boolean
    {
      try{
        const stats = fs.statSync(entry)
        return stats.isFile()?true:false
      }  catch(e)
      {
        console.log(e.code,e.message)
      }
      
        
        
    }
  public prepareInputIndexEntries(fileName: string)
  {
const sha = new HashObject(fileName)
sha.writeToObjectDB()
const shaStore = sha.calculateshaOfStore()
let fileContent
try
{
   fileContent = fs.readFileSync(fileName)
}catch(e)
{
  console.log(e)
  //throw new Error(`The file ${fileName} does not exist or error occured while reading the file`)
}

console.log("after catching the error")

const indexEntry = {
  fileName: fileName,
  mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
  fileContentLength: fileContent.length,//to do: omit this
  version: 2,
  signature: "DIRC",
  fileNameLength:fileName.length,
  sha: shaStore,
  spaceForNull:(8-(62 + fileName.length)%8)//2 inside parentheses is 2 bytes for length of filename
   }
 
this.indexEntries.push(indexEntry)
  }
  
}

//to do: write fileContent1.length in fileContentLength
// const sha11 = new HashObject('test1234')
// sha11.writeToObjectDB()
// const shaStore1 = sha11.calculateshaOfStore()
// const fileContent1 = fs.readFileSync('test1234')


// const fileContent2 = fs.readFileSync('test12345')
// const sha2 = new HashObject('test12345')
// sha2.writeToObjectDB()
// const shaStore2 = sha2.calculateshaOfStore()

// const fileContent22 = fs.readFileSync('test123456')
// const sha22 = new HashObject('./test123456')
// sha22.writeToObjectDB()
// const shaStore22 = sha22.calculateshaOfStore()

// const fileContent4 = fs.readFileSync('test1234567890')
// const sha4 = new HashObject('test1234567890')
// sha4.writeToObjectDB()
// const shaStore4 = sha4.calculateshaOfStore()

// const fileContent5 = fs.readFileSync('test1234567')
// const sha5 = new HashObject('test1234567')
// sha5.writeToObjectDB()
// const shaStore5 = sha5.calculateshaOfStore()

// const fileContent6 = fs.readFileSync('test12345678')
// const sha6 = new HashObject('test12345678')
// sha6.writeToObjectDB()
// const shaStore6 = sha6.calculateshaOfStore()

// const fileContent3 = fs.readFileSync('test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.txt')
// const sha3 = new HashObject('test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.txt')
// sha3.writeToObjectDB()
// const shaStore3 = sha3.calculateshaOfStore()

// const fileContent7 = fs.readFileSync('test1234567899.txt')
// const sha7 = new HashObject('test1234567899.txt')
// sha7.writeToObjectDB()
// const shaStore7 = sha7.calculateshaOfStore()

// const fileContent8 = fs.readFileSync('Asha.jpg')
// const sha8 = new HashObject('Asha.jpg')
// sha8.writeToObjectDB()
// const shaStore8 = sha8.calculateshaOfStore()

// const fileContent9 = fs.readFileSync('Asha.pdf')
// const sha9 = new HashObject('Asha.pdf')
// sha9.writeToObjectDB()
// const shaStore9 = sha9.calculateshaOfStore()

// const indexEntries = [
// {
//  fileName: 'test1234',
//  mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//  fileContentLength: fileContent1.length,//to do: omit this
//  version: 2,
 
//  signature: "DIRC",
//  fileNameLength:8,
//  sha: shaStore1,
//  spaceForNull:2//(8-(62 + fileContetnLength)%8)//2 inside parentheses is 2 bytes for length of filename
//   }
//   ,
//   {
//       fileName: 'test12345',
//       mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//       version: 2,
//       signature: "DIRC",
//       fileNameLength: 9,
//       sha: shaStore2,
//       fileContentLength: fileContent2.length,//to do: omit this
//       spaceForNull:1
//      }
//      ,
//  {
//     fileName: 'test123456',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     version: 2,
//     signature: "DIRC",
//     fileNameLength: 10,
//     sha: shaStore22,
//     fileContentLength: fileContent22.length,//to do: omit this
//     spaceForNull:8//
//    }
//    ,
//    {
//     fileName: 'test1234567890',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent4.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 14,
//     sha: shaStore4,
//     spaceForNull:4//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      }
//      ,
//    {
//     fileName: 'test1234567',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent5.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 11,
//     sha: shaStore5,
//     spaceForNull:7//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      }
//      ,
//    {
//     fileName: 'test12345678',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent6.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 12,
//     sha: shaStore6,
//     spaceForNull:6//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      }
//      ,
//      {
//         fileName: 'test123456789012345678901234567890.txt',
//         mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//         fileContentLength: fileContent5.length,//to do: omit this
//         version: 2,
        
//         signature: "DIRC",
//         fileNameLength: 38,
//         sha: shaStore5,
//         spaceForNull:4
//          }
// ,{
//     fileName: 'test123456789012345678901234567890123456.txt',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent6.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 44,
//     sha: shaStore6,
//     spaceForNull:6
//      }
// ,{
//     fileName: 'test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.txt',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent3.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 98,
//     sha: shaStore3,
//     spaceForNull:8//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      },
//      {
//         fileName: 'test1234567899.txt',
//         mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//         fileContentLength: fileContent7.length,//to do: omit this
//         version: 2,
        
//         signature: "DIRC",
//         fileNameLength: 18,
//         sha: shaStore7,
//         spaceForNull:8//(12-(30+2))//2 inside parentheses is 2 bytes for length of filename
//           }
          //,
        //  {
        //   fileName: 'Asha.jpg',
        //   mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
        //   fileContentLength: fileContent8.length,//to do: omit this
        //   version: 2,
          
        //   signature: "DIRC",
        //   fileNameLength: 8,
        //   sha: shaStore8,
        //   spaceForNull:2//(8-(62 + fileNameLength)%8)//2 inside parentheses is 2 bytes for length of filename
        //    },
        //    {
        //     fileName: 'Asha.pdf',
        //     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
        //     fileContentLength: fileContent9.length,//to do: omit this
        //     version: 2,
            
        //     signature: "DIRC",
        //     fileNameLength: 8,
        //     sha: shaStore9,
        //     spaceForNull:2//(12-(30+2))//2 inside parentheses is 2 bytes for length of filename
        //      }
//]

const add = new ccgitadd(new Utils())
//edge case : just give git add (no filenames) and see->tested

//edge case: change data in same file name and add --> tested and passed
//test with 6 byte length filenames==> tested and passed
/*
read  content into buffer

extract duplicate entries
extract unique entries in index

iterate over input entries:
    update duplicate entries
    set new entries

write first 12 bytes in index after calculating number of index entries

write updated duplicate entries
write unique entries
append new entries

delete old file
create new file
* */

/**
 * 
 * when updating the index if tree extension is present then invalidate the tree extension after updating the index entries
 * if present. If tree extension is not present then don't bother
 */
// test for duplicate entries for staging