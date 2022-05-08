import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Container,
    LinearProgress,
    Typography,
} from '@material-ui/core';
import { cloneDeep } from 'lodash';
import { useCoreService } from '@/stores/app/core';
import Logo from '@/ui-components/Logo';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useAppStateService } from '@/stores/app/appState';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import appVariables from '@/config/config';
import { BG_SOURCE, BKMS_VARIANT } from '@/enum';
import db from '@/utils/db';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import Bookmark from '@/stores/universal/workingSpace/entities/bookmark';
import { search } from '@/stores/universal/workingSpace/search';
import cacheManager from '@/utils/cacheManager';
import MigrationService from '@/ui/MigrateScreen/service';

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

function MigrateScreen({ onStart }) {
    const classes = useStyles();
    const { t } = useTranslation('firstLook');
    const coreService = useCoreService();
    const workingSpaceService = useWorkingSpaceService();
    const appStateService = useAppStateService();
    const service = useLocalObservable(() => new MigrationService({
        coreService,
        appStateService,
        workingSpaceService,
    }));

    useEffect(() => {
        service.migrate().then(onStart);
    }, []);

    return (
        <Box className={classes.root}>
            <Container maxWidth="lg" className={classes.container}>
                <Logo />
                <LinearProgress variant="determinate" value={service.progress} className={classes.progress} />
                <Typography variant="body2" color="textSecondary">{t('migrate')}</Typography>
            </Container>
        </Box>
    );
}

export default observer(MigrateScreen);
