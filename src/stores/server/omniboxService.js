import { makeAutoObservable, toJS } from 'mobx';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';

class OmniboxService {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        this.subscribe();
    }

    subscribe() {
        chrome.omnibox.onInputChanged.addListener((text, suggest) => {
            console.log('[omnibox] onInputChanged', text);

            BookmarksUniversalService.query(new SearchQuery({ query: text }))
                .then((result) => {
                    console.log('[omnibox] Search result:', toJS(result));

                    suggest([...result.best, ...result.part, ...result.indirectly].map((bookmark) => ({
                        content: bookmark.url,
                        deletable: false,
                        description: bookmark.name,
                    })));
                });
        });

        chrome.omnibox.onInputEntered.addListener((text) => {
            console.log('[omnibox] onInputEntered', text);

            chrome.tabs.create({
                url: text,
                active: true,
            });
        });
    }
}

export default OmniboxService;
