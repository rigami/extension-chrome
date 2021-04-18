class Tag {
    id;
    name;
    color;

    constructor(tag = {}) {
        this.id = tag.id;
        this.name = tag.name;
        this.color = tag.color;
    }
}

export default Tag;
