class Favorite {
    id;
    itemType;
    itemId;

    constructor(favorite = {}) {
        this.id = favorite.id;
        this.itemType = favorite.itemType;
        this.itemId = favorite.itemId;
    }
}

export default Favorite;
