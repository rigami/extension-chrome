import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import packageFile from '@/../package.json';
import { StorageConnector } from '@/stores/universal/storage';

const beforeBreadcrumb = (breadcrumb, hint) => {
    if (breadcrumb.category === 'ui.click') {
        const { path } = hint.event;

        breadcrumb.message = path
            .reverse()
            .slice(4)
            .map((element) => {
                const tagName = element.tagName.toLowerCase();
                const id = element.id ? `#${element.id}` : '';
                const type = element.type ? `[${element.type}]` : '';
                const title = element.title ? `{${element.title}}` : '';
                const uiPath = element.dataset.uiPath ? `(${element.dataset.uiPath})` : '';

                return `${tagName}${id}${type}${title}${uiPath}`;
            })
            .join(' > ');
    }

    return breadcrumb;
};

export default (destination) => {
    if (!COLLECT_LOGS) return;

    Sentry.init({
        dsn: 'https://dcf285a0b58e41f287ed4e608297150f@o527213.ingest.sentry.io/5643252',
        integrations: [new Integrations.BrowserTracing()],
        release: BUILD === 'full'
            ? `extension-chrome@${packageFile.version}`
            : `extension-chrome-${BUILD}@${packageFile.version}`,
        sampleRate: 0.4,
        sendDefaultPii: true,
        autoSessionTracking: true,
        ignoreErrors: ['ResizeObserver loop limit exceeded'],
        beforeBreadcrumb,
    });

    Sentry.setTag('destination', destination.toLowerCase());

    StorageConnector.get('userId', null).then(({ userId }) => {
        if (!userId) return;

        Sentry.setUser({ id: userId });
    });
};
