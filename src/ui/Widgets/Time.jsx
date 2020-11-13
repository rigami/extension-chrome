import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    root: {
    },
}));

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

function Time({ size }) {
    const { widgets } = useAppStateService();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const scheduler = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(scheduler);
    }, []);

    return (
        <Typography variant={size}>
            {(widgets.settings.dtwTimeFormat12 ? formatter12 : formatter).format(now)}
        </Typography>
    );
}

export default Time;
