export const checkValidImage = async (url) => new Promise(((resolve, reject) => {
    const imgCache = document.createElement('img');
    imgCache.onload = resolve;
    imgCache.onerror = reject;
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
        icoVariant: bestImage.type,
    };
};

export const getNextImage = async (list, onChangeList) => {
    let currList = list;

    const nextImage = getNextBestImage(currList, (newList) => {
        currList = newList;
        onChangeList(newList);
    });
    const isValid = nextImage && await checkValidImage(nextImage.url).catch(() => null);

    return !nextImage || isValid ? nextImage : getNextImage(currList, (newList) => {
        currList = newList;
        onChangeList(newList);
    });
};
