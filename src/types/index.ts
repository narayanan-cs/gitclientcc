
export type indexEntry=
    {
        fileName: string,
        version: Buffer,
        numberOfEntries: Buffer,
        signature: Buffer,
        birthTime: Buffer,
        mtime: Buffer,
        birthtimeInNanoSeconds: Buffer,
        mtimeInNanoSeconds: Buffer,
        device: Buffer,
        inode: Buffer,
        mode: Buffer,//100644-normal file,1007455-exe,120000-symlink
        userId: Buffer,
        groupId: Buffer,
        fileContentLength: Buffer,
        sha: Buffer,
        flags: Buffer,
        spaceForNull?: number
    }
