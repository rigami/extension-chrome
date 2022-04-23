import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
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
    const { widgetsService } = appStateService;
    const { wallpapersService } = appStateService;
    const [progress, setProgress] = useState(coreService.storage.data?.migrateToMv3Progress?.percent || 0);

    const migrate = async () => {
        setProgress(0);

        if (localStorage.getItem('storage')) {
            const storage = JSON.parse(localStorage.getItem('storage'));

            coreService.storage.update({
                ...storage,
                bgCurrent: storage.bgCurrent ? new Wallpaper({
                    ...storage.bgCurrent,
                    isSaved: true,
                    fullSrc: storage.bgCurrent.source === BG_SOURCE.USER
                        ? `${appVariables.rest.url}/background/user?src=${storage.bgCurrent.id}`
                        : storage.bgCurrent.downloadLink,
                    previewSrc: `${appVariables.rest.url}/background/user/get-preview?id=${storage.bgCurrent.id}`,
                }) : null,
                bgsStream: (storage.bgsStream || []).map((bg) => new Wallpaper({
                    ...storage.bgCurrent,
                    isSaved: true,
                    fullSrc: bg.source === BG_SOURCE.USER
                        ? `${appVariables.rest.url}/background/user?src=${bg.id}`
                        : bg.downloadLink,
                    previewSrc: `${appVariables.rest.url}/background/user/get-preview?id=${bg.id}`,
                })),
            });
        }

        if (localStorage.getItem('settings')) {
            const settings = JSON.parse(localStorage.getItem('settings'));

            workingSpaceService.settings.update(settings.bookmarks);
            wallpapersService.settings.update(settings.backgrounds);
            widgetsService.settings.update(settings.widgets);
            appStateService.settings.update(settings.app);
        }

        setProgress(25);

        const fs = await new Promise((resolve, reject) => {
            navigator.webkitPersistentStorage.requestQuota(
                1024 * 1024 * 1024,
                (grantedBytes) => window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, resolve, reject),
                reject,
            );
        });

        const getFile = async (path) => {
            const file = await new Promise((resolve, reject) => {
                fs.root.getFile(path, { }, resolve, reject);
            });

            return new Promise(((resolve) => file.file(resolve)));
        };

        let existFolders;

        try {
            existFolders = await new Promise((resolve, reject) => {
                fs.root.getDirectory('bookmarksIcons', { }, (dir) => resolve(dir), reject);
            });
        } catch (e) {
            existFolders = false;
        }

        if (existFolders) {
            const allBackgrounds = await WallpapersUniversalService.getAll();
            let index = 0;

            for await (const wallpaper of allBackgrounds) {
                index += 1;
                setProgress(25 + 50 * (index / allBackgrounds.length));

                try {
                    let fullSrc;

                    if (wallpaper.source === BG_SOURCE.USER) {
                        fullSrc = `${appVariables.rest.url}/background/user?src=${wallpaper.id}`;
                        const fullBlob = await getFile(`backgrounds/full/${wallpaper.fileName}`);

                        await cacheManager.cache('wallpapers', fullSrc, fullBlob);
                    } else {
                        fullSrc = wallpaper.downloadLink;
                        await cacheManager.cache('wallpapers', fullSrc);
                    }

                    const previewSrc = `${appVariables.rest.url}/background/user/get-preview?id=${wallpaper.id}`;
                    const previewBlob = await getFile(`backgrounds/preview/${wallpaper.fileName}`);

                    await cacheManager.cache('wallpapers', previewSrc, previewBlob);

                    await db().put('backgrounds', cloneDeep(new Wallpaper({
                        ...wallpaper,
                        isSaved: true,
                        fullSrc,
                        previewSrc,
                    })));
                } catch (e) {
                    console.error(e);
                }

                console.log('wallpaper:', wallpaper);
            }

            const { all: allBookmarks } = await search();
            index = 0;

            for await (const bookmark of allBookmarks) {
                index += 1;
                setProgress(75 + 20 * (index / allBookmarks.length));
                console.log('bookmark check:', bookmark);

                if (bookmark.icoVariant !== BKMS_VARIANT.SYMBOL) {
                    const iconSrc = `${appVariables.rest.url}/background/get-site-icon?site-url=${bookmark.url}`;
                    let iconBlob;

                    try {
                        iconBlob = await getFile(`bookmarksIcons/${bookmark.icoFileName}`);
                        await cacheManager.cache('icons', iconSrc, iconBlob);
                    } catch (e) {
                        console.warn(e);
                    }

                    await db().put('bookmarks', cloneDeep(new Bookmark({
                        ...bookmark,
                        icoVariant: iconBlob ? bookmark.icoVariant : BKMS_VARIANT.SYMBOL,
                        icoUrl: iconSrc,
                    })));
                }

                console.log('bookmark:', bookmark);
            }
        }

        const migrateToMv3 = await db().getFromIndex('temp', 'name', 'migrate-to-mv3-require');

        if (migrateToMv3) await db().delete('temp', migrateToMv3.id);

        setProgress(97);

        if (existFolders) {
            try {
                await Promise.allSettled(
                    ['backgrounds', 'bookmarksIcons', 'temp']
                        .map((path) => new Promise((resolve, reject) => {
                            fs.root.getDirectory(path, {}, (dir) => dir.removeRecursively(resolve, reject), reject);
                        })),
                );
            } catch (e) {
                console.warn(e);
            }
        }

        coreService.storage.update({ migrateToMv3Progress: null });

        localStorage.removeItem('storage');
        localStorage.removeItem('settings');

        setProgress(100);

        // throw new Error('not end');
    };

    useEffect(() => {
        migrate().then(onStart);
    }, []);

    return (
        <Box className={classes.root}>
            <Container maxWidth="lg" className={classes.container}>
                <Logo />
                <LinearProgress variant="determinate" value={progress} className={classes.progress} />
                <Typography variant="body2" color="textSecondary">{t('migrate')}</Typography>
            </Container>
        </Box>
    );
}

export default observer(MigrateScreen);
