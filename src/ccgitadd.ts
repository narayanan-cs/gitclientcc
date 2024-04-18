import * as fs from 'fs'
import { HashObject } from "./HashObject"
import { UpdateIndex } from './UpdateIndexAdd'
import { Utils } from './Utils'

//to do: write fileContent1.length in fileContentLength
const sha11 = new HashObject('./test.txt')
sha11.writeToObjectDB()
const shaStore1 = sha11.calculateshaOfStore()
const fileContent1 = fs.readFileSync('test.txt')

// const fileContent2 = fs.readFileSync('test2.txt')
// const sha2 = new HashObject('./test2.txt')
// sha2.writeToObjectDB()
// const shaStore2 = sha2.calculateshaOfStore()

// const fileContent22 = fs.readFileSync('test3.txt')
// const sha22 = new HashObject('./test3.txt')
// sha22.writeToObjectDB()
// const shaStore22 = sha22.calculateshaOfStore()

// const fileContent4 = fs.readFileSync('test4.txt')
// const sha4 = new HashObject('./test4.txt')
// sha4.writeToObjectDB()
// const shaStore4 = sha4.calculateshaOfStore()

// const fileContent5 = fs.readFileSync('test5.txt')
// const sha5 = new HashObject('./test5.txt')
// sha5.writeToObjectDB()
// const shaStore5 = sha5.calculateshaOfStore()

// const fileContent6 = fs.readFileSync('Hello.txt')
// const sha6 = new HashObject('./Hello.txt')
// sha6.writeToObjectDB()
// const shaStore6 = sha4.calculateshaOfStore()

// const fileContent3 = fs.readFileSync('es.txt')
// const sha3 = new HashObject('./es.txt')
// sha3.writeToObjectDB()
// const shaStore3 = sha3.calculateshaOfStore()

// const fileContent7 = fs.readFileSync('Introduction to Algorithms.pdf')
// const sha7 = new HashObject('./Introduction to Algorithms.pdf')
// sha7.writeToObjectDB()
// const shaStore7 = sha7.calculateshaOfStore()


const indexEntries = [
{
 fileName: 'test.txt',
 mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
 fileContentLength: fileContent1.length,//to do: omit this
 version: 2,
 
 signature: "DIRC",
 fileNameLength: 8,
 sha: shaStore1,
 spaceForNull:2//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
  }
//   ,
//   {
//       fileName: 'test2.txt',
//       mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//       version: 2,
//       signature: "DIRC",
//       fileNameLength: 9,
//       sha: shaStore2,
//       fileContentLength: fileContent2.length,//to do: omit this
//       spaceForNull:1//12-(9+2)
//      },
//  {
//     fileName: 'es.txt',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     version: 2,
//     signature: "DIRC",
//     fileNameLength: 6,
//     sha: shaStore3,
//     fileContentLength: fileContent3.length,//to do: omit this
//     spaceForNull:4//12-(6+2)
//    },
//    {
//     fileName: 'test3.txt',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent22.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 9,
//     sha: shaStore22,
//     spaceForNull:1//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      },
//      {
//         fileName: 'test4.txt',
//         mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//         fileContentLength: fileContent4.length,//to do: omit this
//         version: 2,
        
//         signature: "DIRC",
//         fileNameLength: 9,
//         sha: shaStore4,
//         spaceForNull:1//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//          }
// ,{
//     fileName: 'test5.txt',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent5.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 9,
//     sha: shaStore5,
//     spaceForNull:1//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      }
// ,{
//     fileName: 'Hello.txt',
//     mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//     fileContentLength: fileContent6.length,//to do: omit this
//     version: 2,
    
//     signature: "DIRC",
//     fileNameLength: 9,
//     sha: shaStore6,
//     spaceForNull:1//(12-(9+2))//2 inside parentheses is 2 bytes for length of filename
//      },
//      {
//         fileName: 'Introduction to Algorithms.pdf',
//         mode: 100644,//to do : fill this value from here instead of hardcoding as 0x81A4
//         fileContentLength: fileContent7.length,//to do: omit this
//         version: 2,
        
//         signature: "DIRC",
//         fileNameLength: 30,
//         sha: shaStore7,
//         spaceForNull:4//(12-(30+2))//2 inside parentheses is 2 bytes for length of filename
//          }
]
const indexUpdateOp = new UpdateIndex(new Utils(), indexEntries)
//indexUpdateOp.fillOrWriteProps(indexEntries)
indexUpdateOp.updateIndex()
//console.log(indexUpdateOp.calculateNumberOfIndexEntries(indexEntries),"Actual number of entries")

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