import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
    InputBase,
    Box,
    Button,
    Dialog,
    CardMedia,
    Fade,
    IconButton,
    CircularProgress,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Close as CloseIcon } from '@material-ui/icons';
import { shuffle, debounce } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import { runInAction } from 'mobx';
import { captureException } from '@sentry/react';
import { BG_SOURCE, BG_TYPE, FETCH } from '@/enum';
import { useCoreService } from '@/stores/app/core';
import { useAppStateService } from '@/stores/app/appState';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import api from '@/utils/helpers/api';
import Banner from '@/ui-components/Banner';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 988,
        maxHeight: 687,
        width: 988,
        height: 687,
        overflow: 'hidden',
    },
    closeIcon: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        zIndex: 1,
        color: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
    editor: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    },
    row: {
        width: 752,
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        maxHeight: '100%',
        overflow: 'hidden',
    },
    input: {
        padding: 0,
        fontSize: '3.2rem',
        fontWeight: '900',
        color: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
        '& input': {
            padding: 0,
            height: 62,
        },
    },
    submit: {
        flexShrink: 0,
        marginLeft: theme.spacing(2),
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        padding: theme.spacing(2, 5),
        borderRadius: theme.spacing(4),
        fontSize: '1rem',
        '&:hover': {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
            boxShadow: 'rgb(80 80 80 / 40%) 0px 0px 0px 3px',
        },
    },
    wallpapersWrapper: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    wallpaperPreview: {
        position: 'absolute',
        width: 246,
        height: 180,
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
    loader: { display: 'flex' },
    banner: {
        margin: theme.spacing(2),
        width: `calc(100% - ${theme.spacing(4)}px)`,
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
}));

function WallpaperPreview({ wallpaperSrc, style: externalStyles }) {
    const classes = useStyles();
    const [renderSrc, setRenderSrc] = useState('');
    const [prepareSrc, setPrepareSrc] = useState('');

    useEffect(() => {
        const img = new Image();

        img.onload = () => {
            setRenderSrc((oldRenderSrc) => {
                if (oldRenderSrc === '') {
                    return wallpaperSrc;
                } else {
                    setPrepareSrc(wallpaperSrc);

                    return '';
                }
            });
        };
        img.onerror = () => {
            setPrepareSrc('');
            setRenderSrc('');
        };

        img.src = wallpaperSrc;
    }, [wallpaperSrc]);

    return (
        <Fade
            in={renderSrc !== ''}
            onExited={() => {
                setRenderSrc(prepareSrc);
                setPrepareSrc('');
            }}
        >
            <span>
                <CardMedia
                    className={classes.wallpaperPreview}
                    image={renderSrc}
                    style={externalStyles}
                />
            </span>
        </Fade>
    );
}

const shifts = [
    {
        shift: 40,
        opacity: [
            0.78,
            1,
            0.09,
            1,
            1,
        ],
    },
    {
        shift: 94,
        opacity: [
            1,
            0.18,
            0.18,
            1,
            1,
        ],
    },
    {
        shift: 0,
        opacity: [
            1,
            0.72,
            0.1,
            1,
            0.64,
        ],
    },
    {
        shift: 131,
        opacity: [
            1,
            0.14,
            1,
            0.8,
            1,
        ],
    },
    {
        shift: 37,
        opacity: [
            0.78,
            1,
            0.09,
            0.6,
            1,
        ],
    },
];

function QueryEditor({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsQuietMode']);
    const coreService = useCoreService();
    const { wallpapersService } = useAppStateService();
    const store = useLocalObservable(() => ({
        searchRequest: coreService.storage.data.wallpapersStreamQuery?.type !== 'collection'
            && coreService.storage.data.wallpapersStreamQuery?.type !== 'saved-only'
            ? coreService.storage.data.wallpapersStreamQuery?.value
            : '',
        foundRequest: '',
        list: [],
        status: FETCH.WAIT,
    }));
    const inputRef = useRef(null);

    const handleSearch = async (event) => {
        event?.preventDefault();

        if (store.foundRequest === store.searchRequest) return;

        if (store.searchRequest === '') {
            store.foundRequest = store.searchRequest;
            store.status = FETCH.WAIT;
            store.list = [];

            return;
        }

        store.foundRequest = store.searchRequest;
        store.status = FETCH.PENDING;

        try {
            let { response: list } = await api.get('wallpapers/search', {
                query: {
                    count: 25,
                    type: wallpapersService.settings.type.join(',')
                        .toLowerCase(),
                    query: store.searchRequest,
                },
            });

            list = list.map((bg) => bg.previewSrc);

            list.length = list.length === 0 ? 0 : 25;

            runInAction(() => {
                store.list = shuffle(list);
                store.status = FETCH.DONE;
            });
        } catch (e) {
            console.error(e);
            captureException(e);
            store.status = FETCH.FAILED;
        }
    };

    const autoSearch = useCallback(debounce(() => {
        handleSearch();
    }, 1500), []);

    const handleSelect = () => {
        coreService.storage.update({
            wallpapersStreamQuery: {
                type: 'custom-query',
                value: store.searchRequest,
            },
            bgsStream: [],
            prepareBGStream: null,
        });

        onClose();
    };

    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <Box className={classes.editor}>
            <Box
                className={classes.wallpapersWrapper}
                style={{
                    width: 5 * (246 + 8) + 8,
                    height: 5 * (180 + 8) + 8,
                }}
            >
                {store.list.map((wallpaper, index) => (
                    <WallpaperPreview
                        key={index}
                        wallpaperSrc={wallpaper}
                        style={{
                            left: 8 + Math.floor(index / 5) * (246 + 8),
                            top: 8 + (index % 5) * (180 + 8) + shifts[Math.floor(index / 5)].shift,
                            opacity: shifts[Math.floor(index / 5)].opacity[index % 5],
                        }}
                    />
                ))}
            </Box>
            <form className={classes.row} onSubmit={handleSearch}>
                <InputBase
                    fullWidth
                    inputRef={inputRef}
                    className={classes.input}
                    placeholder={t('searchQuery.query', { context: 'placeholder' })}
                    variant="outlined"
                    autoFocus
                    value={store.searchRequest}
                    multiline
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                        autoSearch();
                    }}
                    onKeyDown={(event) => {
                        if (event.code === 'Enter') {
                            event.preventDefault();
                            event.stopPropagation();
                            handleSearch();
                        }
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
                    <CircularProgress className={classes.loader} />
                )}
                {store.foundRequest === store.searchRequest && store.status === FETCH.DONE && (
                    <Button
                        data-ui-path="backgrounds.scheduler.query.custom.save"
                        type="submit"
                        color="primary"
                        variant="contained"
                        className={classes.submit}
                        onClick={handleSelect}
                        disabled={store.list.length === 0}
                    >
                        {t('searchQuery.button.save')}
                    </Button>
                )}
            </form>
            {store.status === FETCH.WAIT && store.searchRequest === '' && (
                <Banner
                    className={classes.banner}
                    variant="info"
                    message={t('searchQuery.wait')}
                    description={t('searchQuery.wait', { context: 'description' })}
                />
            )}
            {store.status === FETCH.DONE && store.list.length === 0 && (
                <Banner
                    className={classes.banner}
                    variant="warn"
                    message={t('searchQuery.notFound')}
                    description={t('searchQuery.notFound', { context: 'description' })}
                />
            )}
            {store.status === FETCH.FAILED && (
                <Banner
                    className={classes.banner}
                    variant="error"
                    message={t('searchQuery.failed')}
                    description={t('searchQuery.failed', { context: 'description' })}
                />
            )}
        </Box>
    );
}

const ObserverQueryEditor = observer(QueryEditor);

function Modal({ isOpen, onClose }) {
    const classes = useStyles();

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            classes={{ paper: classes.root }}
        >
            <IconButton className={classes.closeIcon} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <ObserverQueryEditor onClose={onClose} />
        </Dialog>
    );
}

export default observer(Modal);
