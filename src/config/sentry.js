import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import packageFile from '@/../package.json';

export default (destination) => {
    if (!COLLECT_LOGS) return;

    Sentry.init({
        dsn: 'https://dcf285a0b58e41f287ed4e608297150f@o527213.ingest.sentry.io/5643252',
        integrations: [new Integrations.BrowserTracing()],
        release: `extension-chrome@${packageFile.version}`,
        sampleRate: 0.4,
        sendDefaultPii: true,
        autoSessionTracking: true,
        ignoreErrors: ['ResizeObserver loop limit exceeded'],
    });

    Sentry.setTag('destination', destination.toLowerCase());
};
