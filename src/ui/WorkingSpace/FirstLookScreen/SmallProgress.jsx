import React, { useEffect, useState } from 'react';
import {
    LinearProgress,
    Box,
    Typography, Fade,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { PREPARE_PROGRESS } from '@/stores/app/core/service';
import { useCoreService } from '@/stores/app/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        bottom: theme.spacing(4),
        left: theme.spacing(4),
    },
    progress: {
        width: 260,
        marginTop: theme.spacing(1),
    },
}));

function SmallProgress() {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const coreService = useCoreService();
    const [progress, setProgress] = useState(coreService.storage.data?.factoryResetProgress?.percent || 0);
    const [stage, setStage] = useState(
        coreService.storage.data?.factoryResetProgress?.stage
        || PREPARE_PROGRESS.WAIT,
    );
    const [show, setShow] = useState(progress !== 100);

    useEffect(() => {
        coreService.globalEventBus.on('system/factoryReset/progress', ({ data }) => {
            setProgress(data.percent);
            setStage(data.stage);
        });
    }, []);

    useEffect(() => {
        if (progress === 100) setTimeout(() => setShow(false), 1500);
    }, [progress]);

    return (
        <Fade in={show}>
            <Box className={classes.root}>
                <Typography variant="body2" color="textSecondary">{t(`stage.${stage}`)}</Typography>
                <LinearProgress variant="determinate" value={progress} className={classes.progress} />
            </Box>
        </Fade>
    );
}

export default observer(SmallProgress);
