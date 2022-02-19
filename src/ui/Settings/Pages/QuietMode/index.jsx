import React from 'react';
import { observer } from 'mobx-react-lite';
import { Divider } from '@material-ui/core';
import SchedulerSection from './Wallpapers/Scheduler';
import FAPSettings from './FAP';
import WidgetsSettings from './Widgets';
import WallpapersSettings from './Wallpapers';

const headerProps = { title: 'settings:quietMode' };
const pageProps = { width: 750 };

function QuietMode({ onSelect }) {
    return (
        <React.Fragment>
            <WallpapersSettings onSelect={onSelect} />
            <SchedulerSection onSelect={onSelect} />
            <Divider variant="middle" />
            <WidgetsSettings />
            <Divider variant="middle" />
            <FAPSettings />
        </React.Fragment>
    );
}

const ObserverQuietMode = observer(QuietMode);

export {
    headerProps as header,
    ObserverQuietMode as content,
    pageProps as props,
};

export default {
    id: 'quietMode',
    header: headerProps,
    content: ObserverQuietMode,
    props: pageProps,
};
