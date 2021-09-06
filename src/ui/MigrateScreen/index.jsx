import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Container,
    LinearProgress,
    Typography,
} from '@material-ui/core';
import Logo from '@/ui-components/Logo';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useAppStateService from '@/stores/app/AppStateProvider';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import appVariables from '@/config/appVariables';
import { BG_SOURCE, BKMS_VARIANT } from '@/enum';
import db from '@/utils/db';
import { cloneDeep } from 'lodash';
import Background from '@/stores/universal/backgrounds/entities/background';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';

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
    const bookmarksService = useBookmarksService();
    const appService = useAppStateService();
    const { widgets } = appService;
    const { backgrounds } = appService;
    const [progress, setProgress] = useState(coreService.storage.persistent.data?.migrateToMv3Progress?.percent || 0);

    const migrate = async () => {
        setProgress(0);

        if (localStorage.getItem('storage')) {
            const storage = JSON.parse(localStorage.getItem('storage'));

            coreService.storage.persistent.update({
                ...storage,
                bgCurrent: storage.bgCurrent ? new Background({
                    ...storage.bgCurrent,
                    isSaved: true,
                    fullSrc: storage.bgCurrent.source === BG_SOURCE.USER
                        ? `${appVariables.rest.url}/background/user?src=${storage.bgCurrent.id}`
                        : storage.bgCurrent.downloadLink,
                    previewSrc: `${appVariables.rest.url}/background/user/get-preview?id=${storage.bgCurrent.id}`,
                }) : null,
                bgsStream: (storage.bgsStream || []).map((bg) => new Background({
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

            bookmarksService.settings.update(settings.bookmarks);
            backgrounds.settings.update(settings.backgrounds);
            widgets.settings.update(settings.widgets);
            appService.settings.update(settings.app);
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
            const allBackgrounds = await BackgroundsUniversalService.getAll();
            const cacheBackgrounds = await caches.open('backgrounds');
            let index = 0;

            for await (const background of allBackgrounds) {
                index += 1;
                setProgress(25 + 50 * (index / allBackgrounds.length));

                try {
                    let fullSrc;

                    if (background.source === BG_SOURCE.USER) {
                        fullSrc = `${appVariables.rest.url}/background/user?src=${background.id}`;
                        const fullBlob = await getFile(`backgrounds/full/${background.fileName}`);
                        const fullResponse = new Response(fullBlob);
                        await cacheBackgrounds.put(fullSrc, fullResponse);
                    } else {
                        fullSrc = background.downloadLink;
                        await cacheBackgrounds.add(fullSrc);
                    }

                    const previewSrc = `${appVariables.rest.url}/background/user/get-preview?id=${background.id}`;
                    const previewBlob = await getFile(`backgrounds/preview/${background.fileName}`);
                    const previewResponse = new Response(previewBlob);
                    await cacheBackgrounds.put(previewSrc, previewResponse);

                    await db().put('backgrounds', cloneDeep(new Background({
                        ...background,
                        isSaved: true,
                        fullSrc,
                        previewSrc,
                    })));
                } catch (e) {
                    console.error(e);
                }

                console.log('background:', background);
            }

            const { all: allBookmarks } = await BookmarksUniversalService.query();
            const cacheIcons = await caches.open('icons');
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
                        const iconResponse = new Response(iconBlob);
                        await cacheIcons.put(iconSrc, iconResponse);
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

        coreService.storage.persistent.update({ migrateToMv3Progress: null });

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
