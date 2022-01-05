import React from 'react';
import { observer } from 'mobx-react-lite';
import TimeWidget from './Time';
import DateWidget from './Date';
import WeatherWidget from './Weather';

const headerProps = { title: 'settings:widgets' };
const pageProps = { width: 750 };

function Widgets({ onSelect }) {
    return (
        <React.Fragment>
            <TimeWidget />
            <DateWidget />
            <WeatherWidget onSelect={onSelect} />
        </React.Fragment>
    );
}

const ObserverWidgets = observer(Widgets);

export {
    headerProps as header,
    ObserverWidgets as content,
    pageProps as props,
};

export default {
    id: 'widgets',
    header: headerProps,
    content: ObserverWidgets,
    props: pageProps,
};
