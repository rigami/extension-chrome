import React, { useEffect, useState, Fragment } from 'react';
import { useAppStateService } from '@/stores/app/appState';

const formatter = new Intl.DateTimeFormat('nu', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});
const formatter12 = new Intl.DateTimeFormat('nu', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h11',
});

function Time() {
    const { widgetsService } = useAppStateService();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    return (
        <Fragment>
            {(widgetsService.settings.timeFormat12 ? formatter12 : formatter).format(now)}
        </Fragment>
    );
}

export default Time;
