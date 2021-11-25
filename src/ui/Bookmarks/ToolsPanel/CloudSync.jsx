import React from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import useAppService from '@/stores/app/AppStateProvider';
import { CLOUD_SYNC } from '@/enum';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    failedSync: { color: theme.palette.error.main },
}));

function CloudSync() {
    const classes = useStyles();
    const { t } = useTranslation();
    const appService = useAppService();
    const { cloudSync } = appService;

    return cloudSync.data.stage !== CLOUD_SYNC.SYNCED && (
        <Box className={clsx(classes.root, cloudSync.data.stage === CLOUD_SYNC.FAILED_SYNC && classes.failedSync)}>
            {t(`common:cloudSync.${cloudSync.data.stage}`)}
        </Box>
    );
}

export default observer(CloudSync);
