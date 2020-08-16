class Category {
    id;
    name;
    color;

    constructor(category = {}) {
        this.id = category.id;
        this.name = category.name;
        this.color = category.color;
    }
}

export default Category;
