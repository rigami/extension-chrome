import { BKMS_VARIANT } from '@/enum';
import fetchData from '@/utils/helpers/fetchData';

export const checkValidImage = async (url) => new Promise(((resolve, reject) => {
    const imgCache = document.createElement('img');
    imgCache.onload = resolve;
    imgCache.onerror = () => reject(new Error(`Not valid ${url} image`));
    imgCache.src = url;
}));

export const getNextBestImage = (list, onChangeList) => {
    if (list.length === 0) {
        return null;
    }

    let maxScoreId = 0;

    list.forEach(({ score }, id) => {
        if (list[maxScoreId].score < score) maxScoreId = id;
    });

    const bestImage = list[maxScoreId];

    onChangeList(list.filter(({ url }) => url !== bestImage.url));

    return {
        url: bestImage.url,
        processedStage: bestImage.processedStage,
        score: bestImage.score,
        icoVariant: bestImage.type,
    };
};

export const getNextImage = async (list, onChangeList) => {
    let currList = list;

    let nextImage = getNextBestImage(currList, (newList) => {
        currList = newList;
        onChangeList(newList);
    });

    let isValid;

    if (nextImage && nextImage.processedStage === 'IS_PROCESSED') {
        isValid = await checkValidImage(nextImage.url).catch(() => null);
    } else if (nextImage && nextImage.processedStage === 'WAIT') {
        try {
            const { response: updateData } = await fetchData(nextImage.url);

            nextImage = updateData;

            isValid = await checkValidImage(updateData.url).catch(() => null);
        } catch (e) {
            console.warn('Failed recalc image', e);
            isValid = false;
        }
    } else {
        isValid = false;
    }

    return !nextImage || isValid ? nextImage : getNextImage(currList, (newList) => {
        currList = newList;
        onChangeList(newList);
    });
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
            icoVariant: BKMS_VARIANT.SYMBOL,
        };
    }

    return {
        image: img,
        list: allImages,
    };
};
