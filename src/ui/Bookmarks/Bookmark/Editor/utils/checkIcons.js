import { BKMS_VARIANT } from '@/enum';
import { getImage } from '@/ui/Bookmarks/Bookmark/Editor/utils/siteSearch';

export const checkValidImage = async (url) => new Promise(((resolve, reject) => {
    const imgCache = document.createElement('img');
    imgCache.onload = resolve;
    imgCache.onerror = () => reject(new Error(`Not valid ${url} image`));
    imgCache.src = url;
}));

export const getNextImage = async (list, onChangeList) => {
    let nextImage;
    let currList = list.slice();

    while (!nextImage && currList.length > 0) {
        try {
            nextImage = await getImage(currList[0].url.substring(1));
        } catch (e) {
            console.error(e);
        }

        currList = currList.slice(1);

        onChangeList(currList);
    }

    return nextImage;
};

export const getDefaultImage = async (images) => {
    let img;
    let allImages = images.slice();

    do {
        img = await getNextImage(
            allImages,
            (list) => { allImages = list; },
        );
    } while (!img && allImages.length !== 0);

    if (!img) {
        img = {
            url: '',
            type: BKMS_VARIANT.SYMBOL,
        };
    }

    return {
        image: img,
        list: allImages,
    };
};
