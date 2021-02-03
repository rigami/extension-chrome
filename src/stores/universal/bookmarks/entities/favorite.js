class Favorite {
    id;
    type;

    constructor(favorite = {}) {
        this.id = favorite.id;
        this.type = favorite.type;
    }
}

export default Favorite;
