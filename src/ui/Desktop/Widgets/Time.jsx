import React, { useEffect, useState, Fragment } from 'react';
import useAppStateService from '@/stores/app/AppStateProvider';

const formatter = new Intl.DateTimeFormat('nu', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});
const formatter12 = new Intl.DateTimeFormat('nu', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

function Time() {
    const { widgets } = useAppStateService();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    return (
        <Fragment>
            {(widgets.settings.dtwTimeFormat12 ? formatter12 : formatter).format(now)}
        </Fragment>
    );
}

export default Time;
