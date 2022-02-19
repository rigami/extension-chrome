import React, { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    ImageList,
    ImageListItem,
    ListSubheader,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { last } from 'lodash';
import { captureException } from '@sentry/react';
import { PhotoLibraryRounded as EmptyLibraryIcon } from '@material-ui/icons';
import Stub from '@/ui-components/Stub';
import { useCoreService } from '@/stores/app/core';
import { useAppStateService } from '@/stores/app/appState';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import BackgroundCard from '@/ui/Settings/Pages/QuietMode/Wallpapers/BackgroundCard';
import { FETCH } from '@/enum';
import LoadBGFromLocalButton from './LoadBGFromLocalButton';
import { eventToBackground } from '@/stores/universal/serviceBus';
import MenuRow from '@/ui/Settings/MenuRow';

const useStyles = makeStyles(() => ({
    root: {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    centerPage: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const headerProps = { title: 'settingsQuietMode:library.title' };
const pageProps = { width: 960 };

function HeaderActions() {
    return (
        <React.Fragment>
            <LoadBGFromLocalButton />
        </React.Fragment>
    );
}

function LibraryMenu() {
    const { wallpapersService } = useAppStateService();
    const coreService = useCoreService();
    const { t } = useTranslation(['settingsQuietMode', 'background']);
    const classes = useStyles();

    const [bgs, setBgs] = useState(null);
    const [state, setState] = useState(FETCH.PENDING);

    const fetchBackgrounds = () => {
        wallpapersService.getAll()
            .then((values) => {
                console.log('getAll', values);
                const groups = values.reduce((acc, bg) => {
                    let group = acc.find(({ type }) => type === bg.type);
                    if (!group) {
                        acc.push({
                            type: bg.type,
                            list: [],
                        });
                        group = last(acc);
                    }
                    group.list.push(bg);
                    return acc;
                }, []).sort((groupA, groupB) => {
                    if (groupA.type < groupB.type) {
                        return -1;
                    } else if (groupA.type > groupB.type) {
                        return 1;
                    }

                    return 0;
                });

                setBgs(groups);
                setState(FETCH.DONE);
            })
            .catch((e) => {
                captureException(e);
                setState(FETCH.FAILED);
                console.error('Failed load bg`s from db:', e);
            });
    };

    useEffect(() => {
        fetchBackgrounds();

        const listeners = [];

        listeners.push(coreService.globalEventBus.on('wallpapers/new', () => {
            fetchBackgrounds();
        }));

        listeners.push(coreService.globalEventBus.on('wallpapers/removed', () => {
            fetchBackgrounds();
        }));

        return () => listeners.forEach((listener) => coreService.localEventBus.removeListener(listener));
    }, []);

    return (
        <React.Fragment>
            <MenuRow>
                <HeaderActions />
            </MenuRow>
            {state === FETCH.PENDING && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {state === FETCH.FAILED && (
                <Stub message={t('library.error.unknown')} />
            )}
            {state === FETCH.DONE && (
                <Box className={classes.root}>
                    {bgs.length !== 0 && (
                        <ImageList cellHeight={160} cols={4}>
                            {bgs.map((group) => [
                                (
                                    <ImageListItem cols={4} style={{ height: 'auto' }} key={group.type}>
                                        <ListSubheader component="div">
                                            {t(`background:type.${group.type}`, { context: 'plural' })}
                                        </ListSubheader>
                                    </ImageListItem>
                                ),
                                ...group.list.map((bg) => (
                                    <ImageListItem key={bg.id}>
                                        <BackgroundCard
                                            {...bg}
                                            select={coreService.storage.data.bgCurrent?.id === bg.id}
                                            onSet={() => {
                                                eventToBackground('wallpapers/set', {
                                                    kind: 'media',
                                                    ...bg,
                                                });
                                            }}
                                            onRemove={() => WallpapersUniversalService.removeFromLibrary(bg)}
                                        />
                                    </ImageListItem>
                                )),
                            ])}
                        </ImageList>
                    )}
                    {bgs.length === 0 && (
                        <Stub
                            icon={EmptyLibraryIcon}
                            message={t('library.error.notFound')}
                        />
                    )}
                </Box>
            )}
        </React.Fragment>
    );
}

const ObserverLibraryMenu = observer(LibraryMenu);

export {
    headerProps as header,
    ObserverLibraryMenu as content,
    pageProps as props,
};

export default {
    header: headerProps,
    content: ObserverLibraryMenu,
    props: pageProps,
};
