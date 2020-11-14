import React, { useEffect, useState } from 'react';
import { Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    root: { textShadow: '0 2px 17px #00000029' },
    link: {},
}));

const formatter = new Intl.DateTimeFormat('nu', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
});

function DateWidget({ size }) {
    const classes = useStyles();
    const { widgets } = useAppStateService();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    if (widgets.settings.dtwDateAction) {
        return (
            <Link
                href={widgets.settings.dtwDateAction}
                target="_blank"
                underline="none"
                color="inherit"
                className={classes.link}
            >
                <Typography variant={size} className={classes.root}>
                    {formatter.format(now)}
                </Typography>
            </Link>
        );
    }

    return (
        <Typography variant={size} className={classes.root}>
            {formatter.format(now)}
        </Typography>
    );
}

export default DateWidget;
