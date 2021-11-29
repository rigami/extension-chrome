import { hslToRgb, recomposeColor } from '@material-ui/core/styles/colorManipulator';
import { alpha } from '@material-ui/core/styles';

export default (key) => {
    const computeKey = key % 98;
    const stepH = 30;
    const shiftH = 20;
    const stepReductionH = 3;
    const stepS = 8;
    const stepL = 13;

    const color = {
        h: 330,
        s: 80,
        l: 60,
    };

    const angle = computeKey % 12;
    const stage = Math.floor(computeKey / 12);

    color.h = color.h - Math.max(stepH - stepReductionH * stage, 7) * angle - shiftH * stage;

    while (color.h < 0) {
        color.h += 360;
    }

    color.l -= stage * stepL;

    if (color.l <= 15) {
        color.l = 15;
        color.s -= stage * stepS;
    }

    return hslToRgb(recomposeColor({
        type: 'hsl',
        values: [color.h, color.s, color.l],
    }));
};
