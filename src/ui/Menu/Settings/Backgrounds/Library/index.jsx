import React, { useState, useEffect } from 'react';
import { FETCH } from '@/enum';
import {
    Box,
    CircularProgress,
    Typography,
    GridList,
    GridListTile,
    ListSubheader,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Stub from '@/ui-components/Stub';
import { last } from 'lodash';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppStateService from '@/stores/app/AppStateProvider';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import BackgroundCard from '@/ui-components/BackgroundCard';
import LoadBGFromLocalButton from './LoadBGFromLocalButton';

const useStyles = makeStyles(() => ({
    root: { overflow: 'hidden' },
    centerPage: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const headerProps = {
    title: 'settings.bg.general.library.title',
    actions: (<HeaderActions />),
};
const pageProps = { width: 960 };

function HeaderActions() {
    return (
        <React.Fragment>
            <LoadBGFromLocalButton />
        </React.Fragment>
    );
}

function LibraryMenu() {
    const { backgrounds } = useAppStateService();
    const coreService = useCoreService();
    const { t } = useTranslation();
    const classes = useStyles();

    const [bgs, setBgs] = useState(null);
    const [state, setState] = useState(FETCH.PENDING);

    const fetchBackgrounds = () => {
        backgrounds.getAll()
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
                setState(FETCH.FAILED);
                console.error('Failed load bg`s from db:', e);
            });
    };

    useEffect(() => {
        fetchBackgrounds();

        const listeners = [];

        listeners.push(coreService.globalEventBus.on('backgrounds/new', () => {
            fetchBackgrounds();
        }));

        listeners.push(coreService.globalEventBus.on('backgrounds/remove', () => {
            fetchBackgrounds();
        }));

        return () => listeners.forEach((listener) => coreService.localEventBus.removeListener(listener));
    }, []);

    return (
        <React.Fragment>
            {state === FETCH.PENDING && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {state === FETCH.FAILED && (
                <Box className={classes.centerPage}>
                    <Typography variant="h5" color="error">{t('error')}</Typography>
                    <Typography variant="body1" gutterBottom>
                        {t('settings.bg.general.library.loadFailed')}
                    </Typography>
                </Box>
            )}
            {state === FETCH.DONE && (
                <Box className={classes.root}>
                    {bgs.length !== 0 && (
                        <GridList cellHeight={160} cols={4}>
                            {bgs.map((group) => [
                                (
                                    <GridListTile cols={4} style={{ height: 'auto' }} key={group.type}>
                                        <ListSubheader component="div">
                                            {t(`settings.bg.general.library.type.${group.type}`)}
                                        </ListSubheader>
                                    </GridListTile>
                                ),
                                ...group.list.map((bg) => (
                                    <GridListTile key={bg.id}>
                                        <BackgroundCard
                                            {...bg}
                                            select={coreService.storage.persistent.bgCurrent?.id === bg.id}
                                            onSet={() => backgrounds.setBG(bg)}
                                            onRemove={() => BackgroundsUniversalService.removeFromStore(bg)}
                                        />
                                    </GridListTile>
                                )),
                            ])}
                        </GridList>
                    )}
                    {bgs.length === 0 && (
                        <Stub message={t('bg.notFound')} />
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
