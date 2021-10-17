class Tag {
    id;
    name;
    color;
    createTimestamp;
    modifiedTimestamp;

    constructor(tag = {}) {
        this.id = tag.id;
        this.name = tag.name;
        this.color = tag.color;
        this.createTimestamp = tag.createTimestamp;
        this.modifiedTimestamp = tag.modifiedTimestamp;
    }
}

export default Tag;
