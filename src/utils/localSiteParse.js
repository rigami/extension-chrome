import { BKMS_VARIANT } from '@/enum';
import { captureException } from '@sentry/react';
import { startsWith } from 'lodash';

function getDomain(url) {
    let domain = url;
    if (domain.indexOf('//') !== -1) {
        domain = domain.substring(domain.indexOf('//') + 2);
    }

    if (domain.indexOf('/') !== -1) {
        domain = domain.substring(0, domain.indexOf('/'));
    }

    if (startsWith(domain, 'www.')) {
        domain = domain.substring(4);
    }

    return domain;
}

const getFaviconUrl = (url = '') => {
    let origin;
    if (url.indexOf('/', 8) === -1) {
        origin = url;
    } else {
        origin = url.substring(0, url.indexOf('/', 8));
    }

    return `${origin}/favicon.ico`;
};

function parseSite(textXml, urlOrigin) {
    const xml = new DOMParser().parseFromString(textXml, 'text/html');

    console.log({ xml });
    const head = xml.querySelector('head');

    const title = head.querySelector('title')?.innerText;
    const description = xml.querySelector('meta[name=\'description\']')?.innerText;
    const elements = xml.querySelectorAll(`
            [rel='shortcut icon'],
            [rel='shortcut'],
            [rel='shortcut'],
            [rel='apple-touch-icon'],
            [itemprop='image'],
            [rel='icon'],
            [property='og:image'],
            [name='og:image'],
            [rel='image_src'],
            [property='twitter:image'],
            [name='twitter:image'],
            [name='yandex-tableau-widget'],
            [name='msapplication-TileImage']
        `);
    let icons = [];

    Array.prototype.forEach.call(elements, (element) => {
        let url;
        let score = 0;

        if (element.tagName === 'LINK') {
            url = element.getAttribute('href');
            const sizes = element.getAttribute('sizes');

            if (typeof sizes === 'string' && sizes !== '' && sizes !== 'any') {
                try {
                    const separator = sizes.indexOf('x');
                    if (separator === -1) throw new Error('Is not size');
                    const width = Number.parseInt(sizes.substring(0, separator));
                    const height = Number.parseInt(sizes.substring(separator + 1));

                    const wScore = (1 / Math.abs(width - 70)) * ((width > 70) ? 400 : 100);
                    const hScore = (1 / Math.abs(height - 70)) * ((height > 70) ? 400 : 100);

                    score += wScore;
                    score += hScore;
                } catch (e) {
                    captureException(e);
                    console.error(e);
                }
            }
        } else if (element.tagName === 'META') {
            url = element.content;
        }

        if (url) {
            icons.push({
                url,
                score,
                type: BKMS_VARIANT.SMALL,
                name: `ic${icons.length}`,
            });
        }
    });

    [
        '/favicon.ico',
        '/apple-touch-icon-57x57-precomposed.png',
        '/apple-touch-icon-57x57.png',
        '/apple-touch-icon-72x72-precomposed.png',
        '/apple-touch-icon-72x72.png',
        '/apple-touch-icon-114x114-precomposed.png',
        '/apple-touch-icon-114x114.png',
        '/apple-touch-icon-120x120-precomposed.png',
        '/apple-touch-icon-120x120.png',
        '/apple-touch-icon-144x144-precomposed.png',
        '/apple-touch-icon-144x144.png',
        '/apple-touch-icon-152x152-precomposed.png',
        '/apple-touch-icon-152x152.png',
        '/apple-touch-icon-180x180-precomposed.png',
        '/apple-touch-icon-180x180.png',
        '/apple-touch-icon-precomposed.png',
        '/apple-touch-icon.png',
    ].forEach((url) => {
        icons.push({
            url,
            score: 0,
            type: BKMS_VARIANT.SMALL,
            name: `ic${icons.length}`,
        });
    });

    icons = icons.map((icon) => {
        let absoluteUrl = icon.url;

        if (icon.url.substring(0, 2) === '//') {
            absoluteUrl = `http:${icon.url}`;
        } else if (icon.url.substring(0, 4) !== 'http') {
            absoluteUrl = `${urlOrigin}${(icon.url[0] === '/') ? '' : '/'}${icon.url}`;
        }

        return {
            ...icon,
            url: absoluteUrl,
        };
    });

    let bestIcon = null;

    icons.forEach((icon) => {
        if (!bestIcon || bestIcon?.score < icon.score) bestIcon = icon;
    });

    return {
        title,
        description,
        icons,
        bestIcon,
    };
}

export default parseSite;

export { getDomain, getFaviconUrl };
