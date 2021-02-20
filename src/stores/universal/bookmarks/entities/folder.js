class Folder {
    id;
    name;
    parentId;
    children;

    constructor(folder = {}) {
        this.id = folder.id;
        this.name = folder.name;
        this.parentId = folder.parentId || 0;
        this.children = folder.children;
    }
}

export default Folder;
