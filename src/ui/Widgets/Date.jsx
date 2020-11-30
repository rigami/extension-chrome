import React, { useEffect, useState } from 'react';
import { Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/AppStateProvider';
import clsx from 'clsx';
import { last } from 'lodash';

const useStyles = makeStyles((theme) => ({
    root: {
        textShadow: '0 2px 17px #00000029',
        fontFamily: '"Manrope", "Open Sans", sans-serif',
        fontWeight: 800,
    },
    link: {},
    offset: {
        marginRight: theme.spacing(3),
    },
}));

const formatter = new Intl.DateTimeFormat('nu', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
});

function DateWidget({ size, dot = false }) {
    const classes = useStyles();
    const { widgets } = useAppStateService();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    const date = formatter.format(now);

    if (widgets.settings.dtwDateAction) {
        return (
            <Link
                href={widgets.settings.dtwDateAction}
                target="_blank"
                underline="none"
                color="inherit"
                className={clsx(classes.link, dot && classes.offset)}
            >
                <Typography variant={size} className={classes.root}>
                    {date}{dot && last(date) !== '.' ? '.' : ''}
                </Typography>
            </Link>
        );
    }

    return (
        <Typography variant={size} className={clsx(classes.root, dot && classes.offset)}>
            {date}{dot && last(date) !== '.' ? '.' : ''}
        </Typography>
    );
}

export default DateWidget;
