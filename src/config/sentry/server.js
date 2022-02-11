import { init, setTag, setUser } from '@sentry/browser';
import packageFile from '@/../package.json';

import StorageConnector from '@/stores/universal/storage/connector';
import { DESTINATION } from '@/enum';

export default () => {
    if (!COLLECT_LOGS) return;

    init({
        dsn: 'https://dcf285a0b58e41f287ed4e608297150f@o527213.ingest.sentry.io/5643252',
        release: BUILD === 'full'
            ? `extension-chrome@${packageFile.version}`
            : `extension-chrome-${BUILD}@${packageFile.version}`,
        sampleRate: 0.4,
        sendDefaultPii: true,
        autoSessionTracking: true,
        ignoreErrors: ['ResizeObserver loop limit exceeded'],
    });

    setTag('destination', DESTINATION.BACKGROUND.toLowerCase());

    StorageConnector.get('userId', null).then(({ userId }) => {
        if (!userId) return;

        setUser({ id: userId });
    });
};
