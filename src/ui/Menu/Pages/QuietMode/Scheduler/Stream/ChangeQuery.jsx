import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Divider,
    InputBase,
    LinearProgress,
    ImageListItem,
    Box,
    ImageList,
    Chip,
    Button,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    ErrorRounded as ErrorIcon,
    ToysRounded as StationIcon,
    WifiTetheringRounded as StreamIcon,
} from '@material-ui/icons';
import { makeStyles, co } from '@material-ui/core/styles';
import { runInAction } from 'mobx';
import { captureException } from '@sentry/react';
import { BG_SOURCE, BG_TYPE, FETCH } from '@/enum';
import Stub from '@/ui-components/Stub';
import useCoreService from '@/stores/app/BaseStateProvider';
import fetchData from '@/utils/helpers/fetchData';
import appVariables from '@/config/appVariables';
import useAppStateService from '@/stores/app/AppStateProvider';
import BackgroundCard from '@/ui/Menu/Pages/QuietMode/BackgroundCard';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import api from '@/utils/helpers/api';

const useStyles = makeStyles((theme) => ({
    root: { marginTop: 4 },
    row: {
        padding: theme.spacing(0, 2),
        display: 'flex',
        alignItems: 'center',
    },
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
    input: {
        padding: theme.spacing(2),
        fontSize: '3.2rem',
        fontWeight: '900',
        fontFamily: theme.typography.primaryFontFamily,
    },
    submit: {
        flexShrink: 0,
        marginLeft: theme.spacing(2),
    },
    locationRow: { paddingLeft: theme.spacing(4) },
    geoButtonWrapper: { position: 'relative' },
    geoButton: {},
    geoButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    bgCard: {
        width: '100%',
        height: '100%',
    },
    chipsWrapper: {
        paddingRight: theme.spacing(4),
        paddingLeft: theme.spacing(3),
        paddingBottom: theme.spacing(1.5),
        paddingTop: theme.spacing(1),
    },
    chip: {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
    },
    footer: { height: 400 },
}));

const headerProps = { title: 'settingsQuietMode:query.custom.create' };
const pageProps = { width: 960 };

function BackgroundPreview({ bg, isAdded = false }) {
    const coreService = useCoreService();
    const { backgrounds } = useAppStateService();
    const [isLoaded, setIsLoaded] = useState(isAdded);

    return (
        <BackgroundCard
            {...bg}
            select={coreService.storage.persistent.data.bgCurrent?.id === bg.id}
            onSet={() => backgrounds.setBG(bg)}
            onAdd={!isLoaded && (() => {
                setIsLoaded(true);
                WallpapersUniversalService.addToLibrary(bg);
            })}
        />
    );
}

function ChangeQuery({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsQuietMode']);
    const coreService = useCoreService();
    const { backgrounds } = useAppStateService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.persistent.data.wallpapersStreamQuery?.type !== 'collection'
            && coreService.storage.persistent.data.wallpapersStreamQuery?.type !== 'saved-only'
            ? coreService.storage.persistent.data.wallpapersStreamQuery?.value
            : '',
        foundRequest: '',
        list: [],
        addedList: [],
        status: FETCH.WAIT,
    }));
    const inputRef = useRef(null);

    const handleSearch = async (event) => {
        event?.preventDefault();

        if (store.foundRequest === store.searchRequest) return;

        store.foundRequest = store.searchRequest;
        store.status = FETCH.PENDING;

        try {
            let { response: list } = await api.get('wallpapers/search', {
                query: {
                    count: 30,
                    type: backgrounds.settings.type.join(',')
                        .toLowerCase(),
                    query: store.searchRequest,
                },
            });

            const allAdded = await backgrounds.getAll();

            list = list.map((bg) => new Wallpaper({
                ...bg,
                kind: 'media',
                contrastColor: bg.color,
                idInSource: bg.idInSource,
                source: BG_SOURCE[bg.source.toUpperCase()],
                type: BG_TYPE[bg.type.toUpperCase()],
                downloadLink: bg.fullSrc,
                previewLink: bg.previewSrc,
            }));

            runInAction(() => {
                store.list = list;
                store.addedList = allAdded;
                store.status = FETCH.DONE;
            });
        } catch (e) {
            console.error(e);
            captureException(e);
            store.status = FETCH.FAILED;
        }
    };

    const handleSelect = () => {
        coreService.storage.persistent.update({
            wallpapersStreamQuery: {
                type: 'custom-query',
                value: store.searchRequest,
            },
            bgsStream: [],
            prepareBGStream: null,
        });

        onClose();
    };

    return (
        <React.Fragment>
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    inputRef={inputRef}
                    className={classes.input}
                    placeholder={t('searchQuery.query', { context: 'placeholder' })}
                    variant="outlined"
                    autoFocus
                    value={store.searchRequest}
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                    }}
                />
                {(store.foundRequest !== store.searchRequest || store.status === FETCH.FAILED) && (
                    <Button
                        data-ui-path="backgrounds.scheduler.query.custom.search"
                        type="submit"
                        variant="text"
                        className={classes.submit}
                        disabled={store.foundRequest === store.searchRequest && store.status !== FETCH.FAILED}
                    >
                        {t('searchQuery.button.search')}
                    </Button>
                )}
                {store.foundRequest === store.searchRequest && store.status === FETCH.PENDING && (
                    <Button
                        variant="text"
                        className={classes.submit}
                        disabled
                    >
                        {t('common:search')}
                    </Button>
                )}
                {store.foundRequest === store.searchRequest && store.status === FETCH.DONE && (
                    <Button
                        data-ui-path="backgrounds.scheduler.query.custom.save"
                        type="submit"
                        color="primary"
                        variant="contained"
                        className={classes.submit}
                        onClick={handleSelect}
                    >
                        {t('searchQuery.button.save')}
                    </Button>
                )}
            </form>
            <Divider />
            {store.status === FETCH.PENDING && (<LinearProgress />)}
            {store.status === FETCH.DONE && (
                <React.Fragment>
                    <Box className={classes.root}>
                        {store.list.length !== 0 && (
                            <ImageList cellHeight={220} cols={3}>
                                {store.list.map((bg) => (
                                    <ImageListItem key={bg.id}>
                                        <BackgroundPreview
                                            bg={bg}
                                            isAdded={store.addedList.find(({ id }) => id === bg.id)}
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        )}
                    </Box>
                    {store.list.length !== 0 && (
                        <Stub
                            className={classes.footer}
                            icon={StationIcon}
                            message={t('searchQuery.callToUse')}
                            actions={[
                                {
                                    title: t('searchQuery.button.save'),
                                    variant: 'contained',
                                    color: 'primary',
                                    onClick: handleSelect,
                                },
                            ]}
                        />
                    )}
                </React.Fragment>
            )}
            {store.status === FETCH.DONE && store.list.length === 0 && (
                <Stub
                    message={t('searchQuery.notFound')}
                    description={t('searchQuery.notFound', { context: 'description' })}
                />
            )}
            {store.status === FETCH.FAILED && (
                <Stub
                    icon={ErrorIcon}
                    message={t('searchQuery.failed')}
                    description={t('searchQuery.failed', { context: 'description' })}
                />
            )}
            {store.status === FETCH.WAIT && (
                <Stub
                    icon={StreamIcon}
                    message={t('searchQuery.wait')}
                    description={t('searchQuery.wait', { context: 'description' })}
                />
            )}
        </React.Fragment>
    );
}

const ObserverChangeQuery = observer(ChangeQuery);

export { headerProps as header, ObserverChangeQuery as content };

export default {
    header: headerProps,
    content: ObserverChangeQuery,
    props: pageProps,
};
