import * as fs from 'fs'
import * as zlib from 'zlib'
import {Diff} from './ccgitdiff-base';
import { convertChangesToXML } from './convert';
import { Commit } from './Commit';
import { Utils } from './Utils';
import { HashObject } from './HashObject';
    

export class ccgitdiff extends Diff
{
    public lcsOfMultipleLines: string[]
    private currentDirectory: string
    public commit: Commit
    constructor(commit: Commit)
    {
        super()
        this.currentDirectory = "."
        this.commit = commit
        this.lcsOfMultipleLines = []
    }


public ReverseString(str: string) {
return str.split('').reverse().join('')
}

public max(a: number, b: number)
{
	if (a > b)
		return a;
	else
		return b;
}
public printLCS(str1: string, str2: string) {
	var len1 = str1.length;
	var len2 = str2.length;
	var lcs = new Array(len1 + 1);
	for (var i = 0; i <= len1; i++) {
		lcs[i] = new Array(len2 + 1)
	}
	for (var i = 0; i <= len1; i++) {
		for (var j = 0; j <= len2; j++) {
			if (i == 0 || j == 0) {
				lcs[i][j] = 0;
			}
			else {
				if (str1[i - 1] == str2[j - 1]) {
					lcs[i][j] = 1 + lcs[i - 1][j - 1];
				}
				else {
					lcs[i][j] = this.max(lcs[i][j - 1], lcs[i - 1][j]);
				}
			}
		}}
		
		var n = lcs[len1][len2];
		// console.log("Length of common subsequence is: " + 
		// n + "<br>" + "The subsequence is : ");
		var str="";
	var i = len1;
	var j = len2;
	while(i>0&&j>0)
	{
			if(str1[i - 1] == str2[j - 1])
			{
				str += str1[i - 1];
				i--;
				j--;
			}
			else{
			if(lcs[i][j-1]>lcs[i-1][j])
			{
				j--;
			}
			else
			{
				i--;
			}
			}
		}
        
	return this.ReverseString(str); 
	}

public getLcsOfMultipleLines1(lines1: string[], lines2: string[]): void
{
    let lcs = ""
    
    if(lines1.join(",") === lines2.join(","))
       { this.lcsOfMultipleLines = lines1
        }
        
    if(lines1.join(",").includes(lines2.join(",")))
        {
           // this.lcsOfMultipleLines = lines2
        }
        
    if(lines2.join(",").includes(lines1.join(",")))
        {
            //this.lcsOfMultipleLines = lines1
        }

    for(let i=0; i< lines1.length;i++)
        {
            if(lines1[i] === "")
                {
                    continue
                }
            for (let j=0;j<lines2.length;j++)
                {
                    if(lines2[j] === "")
                        {
                            continue
                        }
             if(lines1[i] && lines2[j] && (lines2[j].includes(lines1[i]) || lines1[i].includes(lines2[j])))
                {
                    lcs =  this.printLCS(lines1[j],lines2[j])
                
                    this.lcsOfMultipleLines.push(lcs)
                }           

                }
        }    
    // let j=0,k=0    
    // for(let i=0;i<(lines1.length<lines2.length?lines1.length:lines2.length);i++)
    //     {
    //        /**
    //         * 0,1
    //         * 1,2
    //         * 2,3
    //         * 3,4
    //         * 4,6
    //         * 5,7
    //         */
    //         j=i
    //         while(lines1[j] === "" || lines2[j] === "")
    //             {
    //                 console.log(i,j)
    //                 j++
    //             }
    //             // let k=i
               
        
    //             // while(lines1[k] === "")
    //             //     {
    //             //         console.log(k,"inside lines1 k lcs")
    //             //         k++
    //             //     }
    //             console.log(i,j,k)          
    //             lcs =  this.printLCS(lines1[j],lines2[j])
                
    //         this.lcsOfMultipleLines.push(lcs)
            
    //     }    
    
    
}

public getLCSOfMultipleLines(lines1: string[], lines2: string[]): void
{

    this.lcsOfMultipleLines = this.printLCS(lines1.join("\r\n"), lines2.join("\r\n")).split("\r\n")
 
}
  
public getDifferenceBetweenTwoLines(lines1: string, lines2: string): string[]
{
    
   // const lineDiff = new ccgitdiff()
     return this.diff(lines1,lines2)
 }

public getDifferencesBetweenTwoFiles(deflatedFile: string, file: string): void//Map<number, string>
{
    
  // const file1 = fs.readFileSync(process.argv[2])
  const inflatedFile = zlib.inflateSync(fs. readFileSync(deflatedFile))
  const   inflatedFileWithoutHeader = Buffer.alloc(inflatedFile.length - inflatedFile.indexOf("\u0000") -1)
  inflatedFile.copy(inflatedFileWithoutHeader,0,inflatedFile.indexOf("\u0000")+1,inflatedFile.length)
  // const file1 = fs.readFileSync("gittest1/test12.txt")
    //const lines1 = file1.toString().split("\r\n")
    const lines1 = inflatedFileWithoutHeader.toString()
    //const toLines1 = lines1.length
       
   const secondFile = fs.readFileSync(file)
   // const file2 = fs.readFileSync("gittest1/test13.txt")
    //const lines2 = file2.toString().split("\r\n")
    const lines2 = secondFile.toString()
    //const toLines2 = lines2.length

    const diff = this.diff(lines1, lines2, {})
    if(diff === null)
        {
            return null
        }
        console.log(convertChangesToXML(diff))
    
}

public getDifferencesBetweenTwoVersionsOf(fileName: string): void
{
    try{ 
        const fileContents = fs.readFileSync(fileName)
    } catch(e)
    {
        if(e.code === "ENOENT")
            {
                `${fileName} not found`
            }
    }
    this.extractOldEntries()
    this.commit._individualOldEntries.forEach(oldEntry=>{
        const indexFileName = this._getFilenameOf(oldEntry)
        if(fileName === indexFileName)
            {
                this.prepareToCompare(oldEntry, fileName)  
                              
            }
    }) 
}

public prepareToCompare(oldEntry: Buffer, fileName: string): void
{
    const sha1OfOldEntry = this._getSha1Of(oldEntry)
    const dir = sha1OfOldEntry.toString('hex').substring(0,2)
const file = sha1OfOldEntry.toString('hex').substring(2)
const filePath  = ".git/objects/"+ dir+"/"+ file
console.log(`diff --git a/${fileName} `+`b/${fileName}`)
console.log(`index `+sha1OfOldEntry.toString('hex').substring(0,7)+`..`+this.calculateShaOf(fileName).substring(0,7))

console.log(`--- a/${fileName}`)
console.log(`+++ b/${fileName}`)
console.log(filePath,"Deflated file path")
    this.getDifferencesBetweenTwoFiles(filePath, fileName)

}

public calculateShaOf(fileName: string): string
{
    const hash = new HashObject(fileName)
    const sha1 = hash.calculateshaOfStore()
    return sha1.substring(0,7)
}

public getDirectoryContents(): string[]
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

public extractOldEntries(): void
    {
        this.commit._extractOldEntries()            
}
private _getFilenameOf(entry: Buffer): string
    {
        const fileNameLength = this.commit.utils.readIntegersFromBuffer(entry, 16, 60, 'BE')
        const fileName = Buffer.alloc(<number>fileNameLength)
        entry.copy(fileName, 0, 62, 62 + <number>fileNameLength)
        return fileName.toString()
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
public compareAndDiff(): void
{
    if(process.argv.length === 3)
        {
        //    console.log(`Expected 4 arguments.Got ${process.argv.length}`)
        //    process.exit()
        this.getDifferencesBetweenTwoVersionsOf(process.argv[2])
        return
        }
    const directoriesAndFiles = new Set(this.getDirectoryContents())
    this.extractOldEntries()
    this.commit._individualOldEntries.forEach(oldEntry=>{
        const fileName = this._getFilenameOf(oldEntry)
        if(directoriesAndFiles.has(fileName))
            {
              this.prepareToCompare(oldEntry, fileName)
                
            }
    })
}

}
var lines1 = ["Coding Challenges helps you become a better software engineer through that build real applications.",
"I share a weekly coding challenge aimed at helping software engineers level up their skills through deliberate practice.",
"I’ve used or am using these coding challenges as exercise to learn a new programming language or technology.",
"Each challenge will have you writing a full application or tool. Most of which will be based on real world tools and utilities.",
"John Circkett's weekly!", "BXYADB is here ","AC is here"

]

	var lines2 = ["Helping you become a better software engineer through coding challenges that build real applications.",
       "I share a weekly coding challenge aimed at helping software engineers level up their skills through deliberate practice.",
       "These are challenges that I’ve used or am using as exercises to learn a new programming language or technology.",
       "Each challenge will have you writing a full application or tool. Most of which will be based on real world tools and utilities.",
       "John Circkett's wiely","BXYADB is here ", "XY is here "
       
    ]
    var lines111 = [
    "I’ve used or am using these coding challenges as exercise to learn a new programming language or technology.",
    "is John Crickett's weekly!"
    
    ]
    
        var lines21 = [
           "These are challenges that I’ve used or am using as exercises to learn a new programming language or technology."
       
        ]
    
    const diff =new ccgitdiff(new Commit(new Utils()))
	//console.log(diff.getLcsOfMultipleLines(lines1, lines2))
    //console.log(diff.getDifferencesBetweenTwoFiles().join("\r\n"))
    //console.log(diff.getDifferencesBetweenTwoFiles().join("\r\n"))
    //console.log(lodash.difference(lines1,lines2))
    //console.log(diff.compareAndDiff())
    diff.compareAndDiff()