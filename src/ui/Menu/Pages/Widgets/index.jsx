import React from 'react';
import { observer } from 'mobx-react-lite';
import { Divider } from '@material-ui/core';
import TimeWidget from './Time';
import DateWidget from './Date';
import WeatherWidget from './Weather';

const pageProps = { width: 750 };

function Widgets({ onSelect }) {
    return (
        <React.Fragment>
            <TimeWidget />
            <Divider variant="middle" />
            <DateWidget />
            <Divider variant="middle" />
            <WeatherWidget onSelect={onSelect} />
        </React.Fragment>
    );
}

const ObserverWidgets = observer(Widgets);

export {
    ObserverWidgets as content,
    pageProps as props,
};

export default {
    id: 'widgets',
    content: ObserverWidgets,
    props: pageProps,
};
