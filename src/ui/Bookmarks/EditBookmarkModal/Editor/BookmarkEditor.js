import { BKMS_VARIANT } from '@/enum';
import { makeAutoObservable, toJS } from 'mobx';
import { getImageRecalc, getSiteInfo } from '@/utils/siteSearch';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import { getNextImage, getDefaultImage } from '@/utils/checkIcons';
import { captureException } from '@sentry/react';

export const STATE_EDITOR = {
    LOADING_EDITOR: 'LOADING_EDITOR',
    FAILED_PARSE_SITE: 'FAILED_PARSE_SITE',
    PARSING_SITE: 'PARSING_SITE',
    SEARCH_DEFAULT_IMAGE: 'SEARCH_DEFAULT_IMAGE',
    WAIT_REQUEST: 'WAIT_REQUEST',
    WAIT_RESULT: 'WAIT_RESULT',
    DONE: 'DONE',
};

class BookmarkEditor {
    // Bookmark data
    editBookmarkId;
    icoVariant;
    imageURL = '';
    name = '';
    description = '';
    useDescription;
    tags;
    folderId;
    url = '';

    // Editor data
    state = STATE_EDITOR.LOADING_EDITOR;
    isChange = false;
    allImages = [];
    defaultImage = null;
    primaryImages = [];
    secondaryImages = [];

    // Services
    _bookmarksService;

    constructor({ defaultData = {}, bookmarksService }) {
        makeAutoObservable(this);

        this._bookmarksService = bookmarksService;

        if (defaultData.id) {
            this.state = STATE_EDITOR.LOADING_EDITOR;
            this.editBookmarkId = defaultData.id;
            BookmarksUniversalService.get(defaultData.id)
                .then((bookmark) => {
                    console.log('edit bookmark:', toJS(bookmark));
                    this.url = bookmark.url;
                    this.name = bookmark.name;
                    this.imageURL = bookmark.imageUrl;
                    this.icoVariant = bookmark.icoVariant;
                    this.useDescription = !!bookmark.description?.trim();
                    if (this.useDescription) this.description = bookmark.description;
                    this.folderId = bookmark.folderId;
                    this.tags = bookmark.tags || [];
                    this.defaultImage = {
                        url: bookmark.imageUrl,
                        icoVariant: bookmark.icoVariant,
                    };
                    this.fetchSiteInfo({
                        url: bookmark.url,
                        force: true,
                        onlyAdditionalIcons: true,
                    }).catch((e) => {
                        console.error(e);
                        captureException(e);
                    });
                })
                .catch((e) => {
                    this.state = STATE_EDITOR.DONE;
                    console.error(e);
                    captureException(e);
                });
        } else {
            this.state = STATE_EDITOR.WAIT_REQUEST;
            this.tags = defaultData.tagsIds || [];
            this.folderId = defaultData.folderId || 1;

            if (defaultData.url) {
                this.url = defaultData.url || '';
                this.fetchSiteInfo({
                    url: defaultData.url,
                    force: true,
                }).catch((e) => {
                    console.error(e);
                    captureException(e);
                });
            }
        }
    }

    async save() {
        this.editBookmarkId = await this._bookmarksService.bookmarks.save({
            id: this.editBookmarkId,
            url: this.url,
            name: this.name.trim(),
            description: (this.useDescription && this.description?.trim()) || '',
            imageURL: this.imageURL,
            tags: this.tags,
            folderId: this.folderId,
            icoVariant: this.icoVariant,
        });

        this.isChange = false;
    }

    async fetchSiteInfo({ force = false, onlyAdditionalIcons = false, url: fetchUrl, allowChangeUrl = false }) {
        let currentFetchUrl = fetchUrl;
        console.log(
            `fetchSiteInfo { force: ${force} onlyAdditionalIcons: ${onlyAdditionalIcons} allowChangeUrl: ${allowChangeUrl} }`,
            fetchUrl,
        );
        if (currentFetchUrl === '') {
            console.log('Empty request url. Abort');
            return;
        }
        if (this.url === currentFetchUrl && !force) {
            console.log(`Url ${currentFetchUrl} already parse. Abort`);
            return;
        }

        if (!onlyAdditionalIcons) {
            this.url = currentFetchUrl;
            this.imageURL = null;
            this.defaultImage = null;
        }
        this.allImages = [];
        this.primaryImages = [];
        this.secondaryImages = [];
        this.state = STATE_EDITOR.PARSING_SITE;

        try {
            const siteData = await getSiteInfo(currentFetchUrl, ({ title, description }) => {
                if (this.url !== currentFetchUrl) return;
                if (!onlyAdditionalIcons) {
                    this.name = title;
                    this.description = description;
                }
            });
            if (this.url !== currentFetchUrl) return;
            if (allowChangeUrl) {
                this.url = siteData.url;
                currentFetchUrl = siteData.url;
            }

            console.log('siteData', siteData);

            if (!onlyAdditionalIcons) {
                this.name = this.name || siteData.name || siteData.title;
                this.description = this.description || siteData.description;
            }

            if (siteData.bestIcon?.score === 0) {
                try {
                    console.log('siteData.bestIcon.url', siteData.bestIcon.url);
                    siteData.bestIcon = await getImageRecalc(siteData.bestIcon.url);
                } catch (e) {
                    console.error(e);
                    captureException(e);
                    siteData.bestIcon = null;
                }
            }
            if (this.url !== currentFetchUrl) return;
            this.allImages = [siteData.bestIcon, ...siteData.icons].filter((isExist) => isExist);
        } catch (e) {
            captureException(e);
            if (this.url !== currentFetchUrl) return;
            console.error('Failed getSiteInfo', e);
            if (!onlyAdditionalIcons) {
                this.imageURL = '';
                this.icoVariant = BKMS_VARIANT.SYMBOL;
            }
            this.allImages = [];
        }

        if (!onlyAdditionalIcons) {
            console.log('search default image');
            this.state = STATE_EDITOR.SEARCH_DEFAULT_IMAGE;
            const result = await getDefaultImage(this.allImages);
            if (this.url !== currentFetchUrl) return;
            this.defaultImage = result.image;
            this.allImages = result.list;
            this.setPreview(this.defaultImage);
        }
        console.log('done fetch site', fetchUrl, this.url);

        if (this.url === currentFetchUrl) {
            this.state = STATE_EDITOR.DONE;
        }
    }

    setPreview({ url, icoVariant }) {
        console.log('setPreview:', {
            url,
            icoVariant,
        });
        this.imageURL = url;
        this.icoVariant = icoVariant;
    }

    updateValues(values) {
        console.log('updateValues:', values);

        this.isChange = true;

        if ('name' in values || 'title' in values) {
            this.name = values.name || values.title || this.name;
        }
        if ('description' in values) {
            this.description = values.description;
        }
        if ('useDescription' in values) {
            this.useDescription = values.useDescription;
        }
        if ('tags' in values) {
            this.tags = values.tags;
        }
        if ('folderId' in values) {
            this.folderId = values.folderId;
        }

        if ('url' in values) {
            this.fetchSiteInfo({
                allowChangeUrl: values.allowChangeUrl,
                url: values.url,
            }).catch((e) => {
                console.error(e);
                captureException(e);
            });
        }
    }

    async loadPrimaryImages() {
        console.log('loadPrimaryImages:', toJS(this.allImages));
        this.primaryImages = [];
        let img;

        do {
            img = await getNextImage(this.allImages, (list) => { this.allImages = list; });

            if (img) this.primaryImages.push(img);
        } while (img && this.primaryImages.length < 4 && this.allImages.length !== 0);

        if (this.defaultImage.icoVariant !== BKMS_VARIANT.SYMBOL) {
            this.primaryImages.splice(1, 0, {
                url: '',
                icoVariant: BKMS_VARIANT.SYMBOL,
            });
        }
    }

    async loadSecondaryImages() {
        this.secondaryImages = [];
        let img;

        do {
            img = await getNextImage(this.allImages, (list) => { this.allImages = list; });

            if (img) this.secondaryImages.push(img);
        } while (img && this.allImages.length !== 0);
    }
}

export default BookmarkEditor;
