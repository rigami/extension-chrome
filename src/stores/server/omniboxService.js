import { makeAutoObservable, toJS } from 'mobx';
import { search, SearchQuery } from '@/stores/universal/workingSpace/search';

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

            search(new SearchQuery({ query: text }))
                .then((result) => {
                    console.log('[omnibox] Search result:', toJS(result));

                    suggest([...result.best, ...result.part, ...result.indirectly].map((bookmark) => ({
                        content: bookmark.url,
                        deletable: false,
                        description: bookmark.name,
                    })));
                });
        });

        chrome.omnibox.onInputEntered.addListener(async (query, where) => {
            console.log('[omnibox] onInputEntered', query, where);

            let url = '';

            try {
                // eslint-disable-next-line no-new
                new URL(query);

                url = query;
            } catch (e) {
                url = await search(new SearchQuery({ query }))
                    .then((result) => {
                        const best = [...result.best, ...result.part][0];

                        if (best) {
                            return best.url;
                        }

                        return null;
                    });
            }

            if (!url) {
                return;
            }

            chrome.tabs.query({ active: true }, ([tab]) => {
                if (tab.url) {
                    chrome.tabs.create({
                        url,
                        active: true,
                    });
                } else {
                    chrome.tabs.update(tab.id, { url });
                }
            });
        });
    }
}

export default OmniboxService;
