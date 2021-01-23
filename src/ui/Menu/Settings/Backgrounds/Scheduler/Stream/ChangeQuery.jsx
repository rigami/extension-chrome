import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Divider,
    InputBase,
    LinearProgress,
    GridListTile,
    Box,
    GridList,
    Chip,
    IconButton, Button,
} from '@material-ui/core';
import { BG_SOURCE, BG_TYPE, FETCH, } from '@/enum';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    ErrorRounded as ErrorIcon,
    CheckRounded as ApplyIcon,
    ToysRounded as StationIcon,
    WifiTetheringRounded as StreamIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import FullScreenStub from '@/ui-components/FullscreenStub';
import useCoreService from '@/stores/app/BaseStateProvider';
import { runInAction } from 'mobx';
import fetchData from '@/utils/xhrPromise';
import appVariables from '@/config/appVariables';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { eventToBackground } from '@/stores/server/bus';
import useAppStateService from '@/stores/app/AppStateProvider';
import BackgroundCard from '@/ui-components/BackgroundCard';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import Background from '@/stores/universal/backgrounds/entities/background';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: 4,
    },
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
        fontFamily: '"Manrope", "Open Sans", sans-serif',
    },
    submit: { flexShrink: 0, marginLeft: theme.spacing(2) },
    locationRow: {
        paddingLeft: theme.spacing(4),
    },
    geoButtonWrapper: {
        position: 'relative',
    },
    geoButton: {

    },
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
    footer: {
        height: 400,
    },
}));

const headerProps = {
    title: 'settings.bg.scheduler.query.custom.createTitle',
};
const pageProps = { width: 960 };

function ChangeQuery({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const { backgrounds } = useAppStateService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.persistent.backgroundStreamQuery?.value,
        foundRequest: "",
        list: [],
        status: FETCH.WAIT,
    }));
    const inputRef = useRef(null);

    const handleSearch = async (event) => {
        event?.preventDefault();

        if (store.foundRequest === store.searchRequest) return;

        store.foundRequest = store.searchRequest;
        store.status = FETCH.PENDING;

        try {
            const { response: list } = await fetchData(`${
                appVariables.rest.url
            }/backgrounds/search?count=30&type=${
                backgrounds.settings.type.join(',').toLowerCase()
            }&query=${
                store.searchRequest
            }`);

            runInAction(() => {
                store.list = list;
                store.status = FETCH.DONE;
            });

        } catch (e) {
            console.error(e);
            store.status = FETCH.FAILED;
        }
    }

    const handleSelect = () => {
        coreService.storage.updatePersistent({
            backgroundStreamQuery: {
                id: 'CUSTOM_QUERY',
                type: 'custom-query',
                value: store.searchRequest,
            },
            bgsStream: [],
        });

        eventToBackground('backgrounds/nextBg');

        onClose();
    }

    return (
        <React.Fragment>
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    inputRef={inputRef}
                    className={classes.input}
                    placeholder={t('settings.bg.scheduler.query.search.placeholder')}
                    variant="outlined"
                    autoFocus
                    value={store.searchRequest}
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                    }}
                />
                {(store.foundRequest !== store.searchRequest || store.status === FETCH.FAILED) && (
                    <Button
                        type="submit"
                        variant="text"
                        className={classes.submit}
                        disabled={store.foundRequest === store.searchRequest}
                    >
                        {t('settings.bg.scheduler.query.search.button')}
                    </Button>
                )}
                {store.foundRequest === store.searchRequest && store.status === FETCH.PENDING && (
                    <Button
                        variant="text"
                        className={classes.submit}
                        disabled
                    >
                        {t('settings.bg.scheduler.query.search.process')}
                    </Button>
                )}
                {store.foundRequest === store.searchRequest && store.status === FETCH.DONE && (
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        className={classes.submit}
                        onClick={handleSelect}
                    >
                        {t('settings.bg.scheduler.query.search.saveButton')}
                    </Button>
                )}
            </form>
            <Divider />
            <Box className={classes.chipsWrapper}>
                {(appVariables.backgrounds.stream.queryPresets.map((query) => (
                    <Chip
                        className={classes.chip}
                        variant="outlined"
                        key={query.id}
                        label={query.value}
                        onClick={() => {
                            store.searchRequest = query.value;
                            handleSearch();
                        }}
                    />
                )))}
            </Box>
            {store.status === FETCH.PENDING && (<LinearProgress />)}
            {store.status === FETCH.DONE && (
                <React.Fragment>
                    <Box className={classes.root}>
                        {store.list.length !== 0 && (
                            <GridList cellHeight={220} cols={3}>
                                {store.list.map((bg) => (
                                    <GridListTile key={bg.id}>
                                        <BackgroundCard
                                            {...bg}
                                            source={bg.service}
                                            select={coreService.storage.persistent.bgCurrent?.id === bg.id}
                                            onSet={() => backgrounds.setBG(new Background({
                                                ...bg,
                                                originId: bg.bgId,
                                                source: BG_SOURCE[bg.service],
                                                type: BG_TYPE[bg.type],
                                                downloadLink: bg.fullSrc,
                                            }))}
                                            onAdd={() => BackgroundsUniversalService.addToLibrary(new Background({
                                                ...bg,
                                                originId: bg.bgId,
                                                source: BG_SOURCE[bg.service],
                                                type: BG_TYPE[bg.type],
                                                downloadLink: bg.fullSrc,
                                            }))}
                                        />
                                    </GridListTile>
                                ))}
                            </GridList>
                        )}
                        {store.list.length === 0 && (
                            <FullscreenStub message={t('bg.notFound')} />
                        )}
                    </Box>
                    {store.list.length !== 0 && (
                        <FullscreenStub
                            className={classes.footer}
                            icon={StationIcon}
                            message={t("settings.bg.scheduler.query.search.footerMessage.title")}
                            actions={[
                                {
                                    title: t("settings.bg.scheduler.query.search.footerMessage.useStream"),
                                    variant: 'contained',
                                    color: 'primary',
                                    onClick: handleSelect,
                                }
                            ]}
                        />
                    )}
                </React.Fragment>
            )}
            {store.status === FETCH.DONE && store.list.length === 0 && (
                <FullScreenStub
                    message={t('settings.bg.scheduler.query.search.notFound.title')}
                    description={t('settings.bg.scheduler.query.search.notFound.description')}
                />
            )}
            {store.status === FETCH.FAILED && (
                <FullScreenStub
                    icon={ErrorIcon}
                    message={t('settings.bg.scheduler.query.search.failed.title')}
                    description={t('settings.bg.scheduler.query.search.failed.description')}
                />
            )}
            {store.status === FETCH.WAIT && (
                <FullScreenStub
                    icon={StreamIcon}
                    message={t('settings.bg.scheduler.query.search.wait.title')}
                    description={t('settings.bg.scheduler.query.search.wait.description')}
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
