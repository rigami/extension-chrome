import {BG_TYPE} from "../dict";

const getPreview = (file) => {
    console.log("Getting preview for file:", file);

    function postprocessing(cnvs, callback) {
        const oc = document.createElement('canvas');
        const octx = oc.getContext('2d');

        if ((cnvs.width > 320 * 4) && (cnvs.height > 240 * 4)) {
            oc.width = cnvs.width * 0.5;
            oc.height = cnvs.width * 0.5;

            octx.drawImage(cnvs, 0, 0, oc.width, oc.height);

            octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

            cnvs.getContext("2d").drawImage(
                oc,
                0,
                0,
                oc.width * 0.5,
                oc.height * 0.5,
                0,
                0,
                cnvs.width,
                cnvs.height
            );
        }

        const canvasResize = document.createElement("canvas");
        const ctxResize = canvasResize.getContext("2d");

        if (cnvs.width / cnvs.height < 1.33334) {
            canvasResize.width = 320;
            canvasResize.height = 320 / cnvs.width * cnvs.height;
        } else {
            canvasResize.width = 240 / cnvs.height * cnvs.width;
            canvasResize.height = 240;
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
            canvasResize.height
        );
        oc.width = 320;
        oc.height = 240;

        if (cnvs.width / cnvs.height < 1.33334) {
            octx.drawImage(
                canvasResize,
                0,
                -(canvasResize.height - 240) * 0.5,
                canvasResize.width,
                canvasResize.height
            );
        } else {
            octx.drawImage(
                canvasResize,
                -(canvasResize.width - 320) * 0.5,
                0,
                canvasResize.width,
                canvasResize.height
            );
        }
        oc.toBlob(function (blob) {
            callback(blob);
        }, "image/jpeg", 1);
    }


    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (~file.type.indexOf(BG_TYPE.VIDEO)) {
            const video = document.createElement("video");
            video.setAttribute("src", URL.createObjectURL(file));
            video.setAttribute("autoplay", "");
            video.setAttribute("muted", "");

            video.addEventListener('play', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                postprocessing(canvas, resolve);
            }, false);

            video.onloadedmetadata = () => {
                video.currentTime = video.duration / 2;
            };

        } else {
            const img = document.createElement("img");
            img.setAttribute("src", URL.createObjectURL(file));

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                postprocessing(canvas, resolve);
            }
        }
    });
};

export default getPreview;