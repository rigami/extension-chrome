import React, { useEffect, useState, Fragment } from 'react';
import { Link } from '@material-ui/core';
import useAppStateService from '@/stores/app/AppStateProvider';
import { last } from 'lodash';
import { getI18n } from 'react-i18next';

const generateFormatter = (locale) => new Intl.DateTimeFormat(/* 'nu' */ locale, {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
});

function DateWidget({ dot = false }) {
    const { widgets } = useAppStateService();
    const [now, setNow] = useState(new Date());
    const [formatter] = useState(generateFormatter(getI18n()?.language));

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
