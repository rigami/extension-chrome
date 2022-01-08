import React from 'react';
import { observer } from 'mobx-react-lite';
import { Divider } from '@material-ui/core';
import LinkBrowsers from './LinkBrowsers';
import LocalBackup from './LocalBackup';
// import ImportBookmarksFromBrowser from './ImportBookmarksFromBrowser';

const headerProps = { title: 'settings:sync' };
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
    headerProps as header,
    ObserverSyncSettings as content,
    pageProps as props,
};

export default {
    id: 'sync',
    header: headerProps,
    content: ObserverSyncSettings,
    props: pageProps,
};
