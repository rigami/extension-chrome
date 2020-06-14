import { hslToRgb, recomposeColor } from '@material-ui/core/styles/colorManipulator';

function getUniqueColor(key) {
    const stepH = 30;
    const shiftH = 20;
    const stepReductionH = 3;
    const stepS = 8;
    const stepL = 13;

    const color = {
        h: 330,
        s: 80,
        l: 60,
    }

    const angle = key % 12;
    const stage = Math.floor(key / 12);

    color.h = color.h - Math.max(stepH - stepReductionH * stage, 7) * angle - shiftH * stage;

    while (color.h < 0) {
        color.h = color.h + 360;
    }

    color.l = color.l - stage * stepL;

    if (color.l <= 15) {
        color.l = 15;
        color.s = color.s - stage * stepS;

        if (color.s < 32) {
            return getUniqueColor(key - 84);
        }
    }

    return hslToRgb(recomposeColor({
        type: 'hsl',
        values: [color.h, color.s, color.l],
    }));
}

export default getUniqueColor;
