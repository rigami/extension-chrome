import BookmarksService from "@/stores/bookmarks/service";
import ConfigStores from "@/utils/configStores";
import Background from "@/stores/backgroundApp/background";

console.log("Background is run!");

ConfigStores.configDB().then(() => {
    const bookmarksService = new BookmarksService();
    console.log('bookmarksService', bookmarksService)
    const background = new Background({
        bookmarksService: bookmarksService,
    });
});
