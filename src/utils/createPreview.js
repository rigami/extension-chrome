import { BG_TYPE } from '@/enum';

function postprocessing(cnvs, { /* antiAliasing */ }) {
    return new Promise((resolve) => {
        const endWidth = 320;
        const endHeight = 240;
        const oc = new OffscreenCanvas(endWidth, endHeight);
        const octx = oc.getContext('2d');

        if ((cnvs.width > endWidth * 4) && (cnvs.height > endHeight * 4)) {
            oc.width = cnvs.width * 0.5;
            oc.height = cnvs.width * 0.5;

            octx.drawImage(cnvs, 0, 0, oc.width, oc.height);

            octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

            cnvs.getContext('2d').drawImage(
                oc,
                0,
                0,
                oc.width * 0.5,
                oc.height * 0.5,
                0,
                0,
                cnvs.width,
                cnvs.height,
            );
        }
        let resizeWidth = endWidth;
        let resizeHeight = endHeight;

        if (cnvs.width / cnvs.height < 1.33334) {
            resizeWidth = endWidth;
            resizeHeight = (endWidth / cnvs.width) * cnvs.height;
        } else {
            resizeWidth = (endHeight / cnvs.height) * cnvs.width;
            resizeHeight = endHeight;
        }

        const canvasResize = new OffscreenCanvas(resizeWidth, resizeHeight);
        const ctxResize = canvasResize.getContext('2d');

        ctxResize.drawImage(
            cnvs,
            0,
            0,
            cnvs.width,
            cnvs.height,
            0,
            0,
            canvasResize.width,
            canvasResize.height,
        );
        oc.width = endWidth;
        oc.height = endHeight;

        if (cnvs.width / cnvs.height < 1.33334) {
            octx.drawImage(
                canvasResize,
                0,
                -(canvasResize.height - endHeight) * 0.5,
                canvasResize.width,
                canvasResize.height,
            );
        } else {
            octx.drawImage(
                canvasResize,
                -(canvasResize.width - endWidth) * 0.5,
                0,
                canvasResize.width,
                canvasResize.height,
            );
        }
        resolve(oc.convertToBlob({
            type: 'image/jpeg',
            quality: 1,
        }));
    });
}

const getPreview = async (fileOrSrc, type, { size = 'preview', antiAliasing = true, timeStamp } = {}) => {
    const fileType = type || fileOrSrc.type.toUpperCase();
    let blobFile;

    if (fileOrSrc instanceof Blob) {
        blobFile = fileOrSrc;
    } else {
        blobFile = await fetch(fileOrSrc).then((response) => response.blob());
    }

    let drawElement;
    let drawHeight;
    let drawWidth;

    if (~fileType.indexOf(BG_TYPE.VIDEO)) {
        if (TARGET === 'server') throw new Error('Not support create preview of video in service worker');

        await new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.setAttribute('src', URL.createObjectURL(blobFile));

            video.onseeked = () => {
                drawElement = video;
                drawWidth = video.videoWidth;
                drawHeight = video.videoHeight;
                resolve();

                setTimeout(() => video.pause(), 100);
            };

            video.onerror = reject;

            video.onloadedmetadata = () => {
                video.muted = true;
                video.play().then(() => {
                    video.currentTime = timeStamp || video.duration / 2;
                });
            };
        });
    } else {
        drawElement = await createImageBitmap(blobFile);
        drawWidth = drawElement.width;
        drawHeight = drawElement.height;
    }

    const canvas = new OffscreenCanvas(drawWidth, drawHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(drawElement, 0, 0);

    if (size === 'full') {
        return canvas.convertToBlob({
            type: 'image/png',
            quality: 1,
        });
    } else {
        return postprocessing(canvas, { antiAliasing });
    }
};

export default getPreview;
