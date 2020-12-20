import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Divider,
    InputBase,
    LinearProgress,
    GridListTile,
    Box,
    GridList,
    CardMedia,
    Chip,
    IconButton,
} from '@material-ui/core';
import { FETCH, } from '@/enum';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    ErrorRounded as ErrorIcon,
    PlaceRounded as PlaceIcon,
    CheckRounded as ApplyIcon,
    ToysRounded as StationIcon,
} from '@material-ui/icons';
import {
    WrongLocationRounded as WrongLocationIcon,
} from '@/icons';
import { makeStyles } from '@material-ui/core/styles';
import FullScreenStub from '@/ui-components/FullscreenStub';
import useCoreService from '@/stores/app/BaseStateProvider';
import { runInAction } from 'mobx';
import fetchData from '@/utils/xhrPromise';
import appVariables from '@/config/appVariables';
import FullscreenStub from '@/ui-components/FullscreenStub';

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
    submit: { flexShrink: 0 },
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
    title: 'settings.bg.scheduler.query.title',
};
const pageProps = { width: 960 };

function ChangeQuery({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.persistent.backgroundRadioQuery,
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
            const { response: list } = await fetchData(`${appVariables.rest.url}/backgrounds/search?count=30&type=image&query=${store.searchRequest}`);

            console.log('list', list)

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
            backgroundRadioQuery: store.searchRequest,
            bgsRadio: [],
        });

        coreService.localEventBus.call('background/play')
    }

    return (
        <React.Fragment>
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    inputRef={inputRef}
                    className={classes.input}
                    placeholder={t('settings.bg.scheduler.query.placeholder')}
                    variant="outlined"
                    autoFocus
                    value={store.searchRequest}
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                    }}
                />
                <IconButton onClick={handleSelect}>
                    <ApplyIcon />
                </IconButton>
            </form>
            <Divider />
            <Box className={classes.chipsWrapper}>
                {(appVariables.backgrounds.radio.queryPresets.map((query) => (
                    <Chip
                        className={classes.chip}
                        variant="outlined"
                        key={query}
                        label={query}
                        onClick={() => {
                            store.searchRequest = query;
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
                                    <GridListTile cols={1}>
                                        <CardMedia image={bg.previewSrc} className={classes.bgCard} />
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
                            message={t("settings.bg.scheduler.query.footerMessage.title")}
                            actions={[
                                {
                                    title: t("settings.bg.scheduler.query.footerMessage.useStation"),
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
                    message={t('settings.widgets.dtw.weather.region.search.notFound.title')}
                    description={t('settings.widgets.dtw.weather.region.search.notFound.description')}
                />
            )}
            {store.status === FETCH.FAILED && (
                <FullScreenStub
                    icon={ErrorIcon}
                    message={t('settings.widgets.dtw.weather.region.search.failed.title')}
                    description={t('settings.widgets.dtw.weather.region.search.failed.description')}
                />
            )}
            {store.status === FETCH.WAIT && !coreService.storage.persistent.backgroundRadioQuery && (
                <FullScreenStub
                    icon={WrongLocationIcon}
                    message={t('settings.widgets.dtw.weather.region.search.wait.failed.title')}
                    description={t('settings.widgets.dtw.weather.region.search.wait.failed.description')}
                />
            )}
            {store.status === FETCH.WAIT && coreService.storage.persistent.backgroundRadioQuery && (
                <FullScreenStub
                    icon={PlaceIcon}
                    message={t(
                        'settings.widgets.dtw.weather.region.search.wait.manual.title',
                        { locationName: coreService.storage.persistent.backgroundRadioQuery },
                    )}
                    description={t('settings.widgets.dtw.weather.region.search.wait.manual.description')}
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
