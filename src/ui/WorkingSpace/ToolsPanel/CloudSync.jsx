import React, { useEffect } from 'react';
import { Box, Fade, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import clsx from 'clsx';
import { useAppStateService } from '@/stores/app/appState';
import { CLOUD_SYNC } from '@/enum';
import SyncFailedIcon from '@/icons/resources/sync_problem_black_24px.svg';
import SyncProcessIcon from '@/icons/resources/sync_process_black_24px.svg';
import SyncSuccessIcon from '@/icons/resources/sync_success_black_24px.svg';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    failedSync: { color: theme.palette.error.main },
    successSync: { color: theme.palette.success.main },
    processSync: { color: theme.palette.text.secondary },
    icon: {
        width: 36,
        height: 36,
        position: 'relative',
        marginRight: theme.spacing(1),
        padding: 7,
    },
    arrowsIcon: {
        width: 22,
        height: 22,
    },
    spin: { animation: '1s infinite linear $spinAnimation' },
    '@keyframes spinAnimation': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(-360deg)' },
    },
    pict: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    success: {},
}));

function SyncProcess({ state }) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Tooltip title={t(`common:cloudSync.${state}`, { context: 'description' })}>
            <Box className={classes.icon}>
                <SyncProcessIcon className={clsx(classes.spin, classes.arrowsIcon, classes.processSync)} />
                {/* <SyncProcessPictIcon className={classes.pict} /> */}
            </Box>
        </Tooltip>
    );
}

function SyncDone() {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Tooltip title={t(`common:cloudSync.${CLOUD_SYNC.SYNCED}`, { context: 'description' })}>
            <Box className={classes.icon}>
                <SyncSuccessIcon className={clsx(classes.arrowsIcon, classes.successSync)} />
                {/* <SyncProcessPictIcon className={classes.pict} /> */}
            </Box>
        </Tooltip>
    );
}

function SyncFailed() {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Tooltip title={t(`common:cloudSync.${CLOUD_SYNC.FAILED_SYNC}`, { context: 'description' })}>
            <Box className={classes.icon}>
                <SyncFailedIcon className={clsx(classes.arrowsIcon, classes.failedSync)} />
                {/* <SyncProcessPictIcon className={classes.pict} /> */}
            </Box>
        </Tooltip>
    );
}

function CloudSync() {
    const classes = useStyles();
    const appStateService = useAppStateService();
    const { cloudSync } = appStateService;
    const store = useLocalObservable(() => ({
        isShow: false,
        firstRender: true,
    }));

    useEffect(() => {
        if (store.firstRender && cloudSync.data.stage === CLOUD_SYNC.SYNCED) {
            store.firstRender = false;

            return () => {};
        }

        let timer;

        store.firstRender = false;
        store.isShow = true;

        if (cloudSync.data.stage === CLOUD_SYNC.SYNCED) {
            timer = setTimeout(() => { store.isShow = false; }, 2000);
        }

        return () => { if (timer) clearTimeout(timer); };
    }, [cloudSync.data.stage]);

    return (
        <Fade in={store.isShow} unmountOnExit>
            <Box
                className={clsx(
                    classes.root,
                    cloudSync.data.stage === CLOUD_SYNC.FAILED_SYNC && classes.failedSync,
                    cloudSync.data.stage === CLOUD_SYNC.SYNCED && classes.successSync,
                )}
            >
                {cloudSync.data.stage === CLOUD_SYNC.SYNCED && (
                    <SyncDone />
                )}
                {cloudSync.data.stage === CLOUD_SYNC.FAILED_SYNC && (
                    <SyncFailed />
                )}
                {(cloudSync.data.stage === CLOUD_SYNC.SYNCING_PULL || cloudSync.data.stage === CLOUD_SYNC.SYNCING_PUSH) && (
                    <SyncProcess state={cloudSync.data.stage} />
                )}
            </Box>
        </Fade>
    );
}

export default observer(CloudSync);
