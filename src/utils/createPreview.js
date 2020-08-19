import { BG_TYPE } from '@/enum';

const getPreview = (fileOrSrc, type, { size = 'preview', antiAliasing = true, timeStamp } = {}) => {
    function postprocessing(cnvs, { /* antiAliasing */ }) {
        return new Promise((resolve) => {
            const oc = document.createElement('canvas');
            const octx = oc.getContext('2d');

            const endWidth = 320;
            const endHeight = 240;

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

            const canvasResize = document.createElement('canvas');
            const ctxResize = canvasResize.getContext('2d');

            if (cnvs.width / cnvs.height < 1.33334) {
                canvasResize.width = endWidth;
                canvasResize.height = (endWidth / cnvs.width) * cnvs.height;
            } else {
                canvasResize.width = (endHeight / cnvs.height) * cnvs.width;
                canvasResize.height = endHeight;
            }

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
            oc.toBlob(resolve, 'image/jpeg', 1);
        });
    }

    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fileType = typeof fileOrSrc === 'object' ? fileOrSrc.type.toUpperCase() : type;
        const fileSrc = typeof fileOrSrc === 'object' ? URL.createObjectURL(fileOrSrc) : fileOrSrc;

        const render = (drawElement) => {
            ctx.drawImage(drawElement, 0, 0);

            if (size === 'full') {
                canvas.toBlob(resolve, 'image/jpeg', 1);
            } else {
                postprocessing(canvas, { antiAliasing }).then(resolve);
            }
        };

        if (~fileType.indexOf(BG_TYPE.VIDEO)) {
            const video = document.createElement('video');
            video.setAttribute('src', fileSrc);

            video.onseeked = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                render(video);

                setTimeout(() => video.pause(), 100);
            };

            video.onloadedmetadata = () => {
                video.muted = true;
                video.play().then(() => {
                    video.currentTime = timeStamp || video.duration / 2;
                });
            };
        } else {
            const img = document.createElement('img');
            img.setAttribute('src', fileSrc);

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                render(img);
            };
        }
    });
};

export default getPreview;
