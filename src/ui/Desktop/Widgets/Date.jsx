import React, { useEffect, useState, Fragment } from 'react';
import { Link } from '@material-ui/core';
import { last } from 'lodash';
import { getI18n } from 'react-i18next';
import { useAppStateService } from '@/stores/app/appState';

const generateFormatter = (locale) => new Intl.DateTimeFormat(/* 'nu' */ locale, {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
});

function DateWidget() {
    const { widgetsService } = useAppStateService();
    const [now, setNow] = useState(new Date());
    const [formatter] = useState(generateFormatter(getI18n()?.language));

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    const date = formatter.format(now);

    if (widgetsService.settings.dateAction) {
        return (
            <Link
                href={widgetsService.settings.dateAction}
                target="_blank"
                underline="none"
                color="inherit"
            >
                {`${date}`}
            </Link>
        );
    }

    return (
        <Fragment>
            {`${date}`}
        </Fragment>
    );
}

export default DateWidget;
