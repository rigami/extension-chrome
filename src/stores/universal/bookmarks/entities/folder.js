class Folder {
    id;
    name;
    parentId;
    children;
    createTimestamp;
    modifiedTimestamp;

    constructor(folder = {}) {
        this.id = folder.id;
        this.name = folder.name;
        this.parentId = folder.parentId || 0;
        this.children = folder.children;
        this.createTimestamp = folder.createTimestamp;
        this.modifiedTimestamp = folder.modifiedTimestamp;
    }
}

export default Folder;
