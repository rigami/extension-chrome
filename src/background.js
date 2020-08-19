import BookmarksService from '@/stores/bookmarks/service';
import ConfigStores from '@/utils/configStores';
import Background from '@/stores/backgroundApp/background';
import { initBus } from '@/stores/backgroundApp/busApp';
import { DESTINATION } from '@/enum';

console.log('Background is run!');

ConfigStores.configDB().then(() => {
    initBus(DESTINATION.BACKGROUND);
    const bookmarksService = new BookmarksService();
    console.log('bookmarksService', bookmarksService);
    const background = new Background({ bookmarksService });
});
