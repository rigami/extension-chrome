import React from 'react';
import { observer } from 'mobx-react-lite';
import { Divider } from '@material-ui/core';
import LinkBrowsers from './LinkBrowsers';
import LocalBackup from './LocalBackup';
// import ImportBookmarksFromBrowser from './ImportBookmarksFromBrowser';

const pageProps = { width: 750 };

function SyncSettings() {
    return (
        <React.Fragment>
            {/* BUILD === 'full' && (<ImportBookmarksFromBrowser />) */}
            <LinkBrowsers />
            <Divider variant="middle" />
            <LocalBackup />
        </React.Fragment>
    );
}

const ObserverSyncSettings = observer(SyncSettings);

export {
    ObserverSyncSettings as content,
    pageProps as props,
};

export default {
    id: 'sync',
    content: ObserverSyncSettings,
    props: pageProps,
};
