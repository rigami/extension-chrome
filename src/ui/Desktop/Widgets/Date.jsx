import React, { useEffect, useState, Fragment } from 'react';
import { Link } from '@material-ui/core';
import useAppStateService from '@/stores/app/AppStateProvider';
import { last } from 'lodash';

const formatter = new Intl.DateTimeFormat('nu', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
});

function DateWidget({ dot = false }) {
    const { widgets } = useAppStateService();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    const date = formatter.format(now);

    const dotSymbol = last(date) !== '.' ? '. ' : ' ';

    if (widgets.settings.dtwDateAction) {
        return (
            <Link
                href={widgets.settings.dtwDateAction}
                target="_blank"
                underline="none"
                color="inherit"
            >
                {`${date}${dot ? dotSymbol : ''}`}
            </Link>
        );
    }

    return (
        <Fragment>
            {`${date}${dot ? dotSymbol : ''}`}
        </Fragment>
    );
}

export default DateWidget;
