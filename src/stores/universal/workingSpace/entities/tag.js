class Tag {
    id;
    name;
    colorKey;
    createTimestamp;
    modifiedTimestamp;

    constructor(tag = {}) {
        this.id = tag.id;
        this.name = tag.name;
        this.colorKey = tag.colorKey;
        this.createTimestamp = tag.createTimestamp;
        this.modifiedTimestamp = tag.modifiedTimestamp;
    }
}

export default Tag;
