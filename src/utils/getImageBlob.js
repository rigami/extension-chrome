export default async (src) => {
    const img = await new Promise((resolve, reject) => {
        const imgLoad = document.createElement('img');
        imgLoad.crossOrigin = 'anonymous';
        imgLoad.src = src;

        imgLoad.onload = () => resolve(imgLoad);
        imgLoad.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const context = canvas.getContext('2d');

    context.drawImage(img, 0, 0);

    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
};
