import React, { useEffect, useState } from 'react';
import {
    LinearProgress,
    Box,
    Typography,
    Container,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { PREPARE_PROGRESS } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import Logo from '@/ui-components/Logo';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    container: { margin: 'auto' },
    progress: {
        width: 400,
        margin: theme.spacing(2, 0),
    },
}));

function WaitEndInstall({ onDone }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const coreService = useCoreService();
    const [progress, setProgress] = useState(coreService.storage.persistent.data?.factoryResetProgress?.percent || 0);
    const [stage, setStage] = useState(
        coreService.storage.persistent.data?.factoryResetProgress?.stage
        || PREPARE_PROGRESS.WAIT,
    );

    useEffect(() => {
        coreService.globalEventBus.on('system/factoryReset/progress', ({ data }) => {
            setProgress(data.percent);
            setStage(data.stage);
        });
    }, []);

    useEffect(() => {
        if (progress === 100) setTimeout(onDone, 1500);
    }, [progress]);

    return (
        <Box className={classes.root}>
            <Container maxWidth="lg" className={classes.container}>
                <Logo />
                <LinearProgress variant="determinate" value={progress} className={classes.progress} />
                <Typography variant="body2" color="textSecondary">{t(`stage.${stage}`)}</Typography>
            </Container>
        </Box>
    );
}

export default observer(WaitEndInstall);
