import * as fs from 'fs'


export class Init 
{
    public repositoryName: string
    public gitDir: string
    public headFile: string
    public configFile: string
    public descriptionFile: string
    public hooksDir: string
    public infoDir: string
    public objectsDir: string
    public refsDir: string
    public headsDir: string
    public masterFile: string
    public tagsDir: string
    public pkg_json: string

    constructor()
    {
        const args = process.argv
        if(args.length <= 2)
        {
            //console.log(`Expected 3 arguments. Got ${args.length}`)
            process.exit()
        }
       // console.log(args)
        this.repositoryName = args[2]
        this.gitDir = this.repositoryName +"/" +".git"
        this.headFile = this.gitDir + "/" + "HEAD"
        this.configFile = this.gitDir + "/" + "config"
        this.descriptionFile = this.gitDir + "/" + "description"
        this.hooksDir = this.gitDir + "/" + "hooks"
        this.objectsDir = this.gitDir + "/" + "objects"
        this.refsDir = this.gitDir + "/" + "refs"
        this.headsDir = this.refsDir + "/" + "heads"
        this.masterFile = this.headsDir + "/" + "master"
        this.tagsDir = this.refsDir + "/" + "tags"
        this.pkg_json = this.repositoryName + "/" + "package.json"
    }
    public getGitDirectoryPath(): string
    {
        return this.gitDir
    }

    public createGitDir(): void
    {//Todo: copy message from gitbash if .git dir already exists
        if(fs.existsSync(this.gitDir))
        {
        console.log("Git repository already initialized") 
        process.exit() 
        }
        fs.mkdirSync(this.repositoryName)
        this._writeToEnv()
        fs.mkdirSync(this.gitDir)
    }
    private _writeToEnv(): void
    {
        
        let envContents = fs.readFileSync('.env')
        let env
        console.log(envContents.length,"env contents length")
        const envPosition = envContents.indexOf("gitDirectory = ")
        console.log(envPosition,"position")
        envPosition>0? env = Buffer.alloc(envPosition+"gitDirectory = ".length+this.repositoryName.length):
                       env = Buffer.alloc(envContents.length+"gitDirectory = ".length+this.repositoryName.length+1) //+1 is for new line
        envContents.copy(env,0,0,envContents.length)               
        envPosition>0?env.write(this.repositoryName,envPosition+"gitDirectory = ".length):
                      env.write(`\ngitDirectory = ${this.repositoryName}`,envContents.length)  
                      console.log(envContents.length,"env contents length after writing gitdir")              
        fs.writeFileSync(".env",env.toString())              
    }

    public createHeadFile(): void
    {
        fs.writeFileSync(this.headFile,"ref: refs/heads/master")
        const lineFeedCharacter = Buffer.alloc(1)
        lineFeedCharacter.fill("0A",0,1,'hex')
        fs.appendFileSync(this.headFile,lineFeedCharacter)
    }

    public createConfigFile(): void
    {
        fs.writeFileSync(this.configFile,Buffer.from("[core]\n\trepositoryformatversion = 0\n\tfilemode = false\n\tbare = false\n\tlogallrefupdates = true\n\tsymlinks = false\n\tignorecase = true\n")
    )
    }
    
    public createDescriptionFile(): void
    {
        fs.writeFileSync(this.descriptionFile,"Unnamed repository; edit this file 'description' to name the repository.")
    }

    public createHooksDir(): void
    {
        fs.mkdirSync(this.hooksDir)
    }

    public createObjectsDir(): void
    {
        fs.mkdirSync(this.objectsDir)
    }

    public createRefsDir(): void
    {
        fs.mkdirSync(this.refsDir)
        fs.mkdirSync(this.headsDir)
        fs.mkdirSync(this.tagsDir)
        fs.writeFileSync(this.masterFile,"")
    }

    public createPackageDotJsonFile(): void
    {
        fs.writeFileSync(this.pkg_json,"")
    }
    public initializeGitRepo()
    {
        this.createGitDir()
        this.createHeadFile()
        this.createConfigFile()
        this.createDescriptionFile()
        this.createHooksDir()
        this.createObjectsDir()
        this.createRefsDir()
        this.createPackageDotJsonFile()
        fs.copyFileSync(fs.realpathSync("scripts.json"),fs.realpathSync(this.pkg_json))

        console.log("Initialized empty Git repository :" + this.repositoryName)
    }
    
}

const init = new Init()
init.initializeGitRepo()
