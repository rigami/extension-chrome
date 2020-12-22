import React, { useState, useEffect, memo } from 'react';
import { BG_SOURCE, FETCH } from '@/enum';
import {
    Box,
    Avatar,
    Button,
    IconButton,
    Tooltip,
    CircularProgress,
    Typography,
    GridList,
    GridListTile,
    ListSubheader,
    GridListTileBar,
    Link,
} from '@material-ui/core';
import {
    WallpaperRounded as WallpaperIcon,
    DeleteForeverRounded as DeleteIcon,
    CheckRounded as SetIcon,
    ArrowForwardRounded as LeftIcon,
} from '@material-ui/icons';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import FullscreenStub from '@/ui-components/FullscreenStub';
import LoadBGFromLocalButton from './LoadBGFromLocalButton';
import { last } from 'lodash';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppStateService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        overflow: 'hidden',
    },
    bgCard: {
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: '50%',
        height: '100%',
        width: '100%',
    },
    bgCardWrapper: {
        height: theme.spacing(20),
    },
    bgActionsWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: fade(theme.palette.common.black, 0.7),
        opacity: 0,
        transition: theme.transitions.create('', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shortest,
        }),
        '&:hover': { opacity: 1 },
    },
    setIcon: {
        color: theme.palette.primary.main,
        width: '100%',
        height: '100%',
        '& svg': {
            width: 36,
            height: 36,
        },
    },
    deleteIcon: {
        color: theme.palette.common.white,
        opacity: 0.7,
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        '&:hover': {
            opacity: 1,
            color: theme.palette.error.main,
        },
    },
    centerPage: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgStub: {
        position: 'absolute',
        zIndex: -1,
        height: '100%',
        width: '100%',
    },
    titleBar: {
        position: 'relative',
        width: '100%',
        height: 'auto',
        padding: theme.spacing(1, 0),
        paddingRight: theme.spacing(2),
        background: 'none',
        borderTop: `1px solid ${fade(theme.palette.common.white, 0.12)}`,
    },
    icon: {
        display: 'flex',
        color: theme.palette.common.white,
    },
    link: {
        position: 'relative',
        width: '100%',
    },
    selectIcon: {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.common.black,
    },
}));

const headerProps = {
    title: 'settings.bg.general.library.title',
    actions: (<HeaderActions />),
};
const pageProps = { width: 960 };

function HeaderActions() {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <LoadBGFromLocalButton />
            {/* <Tooltip title={t('notAvailableYet')}>
                <div>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<GetFromLibraryIcon />}
                        disabled
                    >
                        {t('settings.bg.general.library.getFromLibrary')}
                    </Button>
                </div>
            </Tooltip> */}
        </React.Fragment>
    );
}

function Bg(props) {
    const {
        fileName,
        sourceLink,
        previewSrc,
        fullSrc,
        source,
        author,
        select,
        antiAliasing,
        format,
        onSet,
        onRemove,
        ...other
    } = props;
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <GridListTile className={classes.bgCardWrapper} {...other}>
            <Box
                className={classes.bgCard}
                style={{ backgroundImage: `url('${previewSrc}')` }}
            >
                <Avatar variant="square" className={classes.bgStub}>
                    <WallpaperIcon fontSize="large" />
                </Avatar>
                {select && (
                    <SetIcon className={classes.selectIcon} />
                )}
                <Box className={classes.bgActionsWrapper}>
                    {!select && (
                        <Tooltip title={t('settings.bg.apply')} placement="top">
                            <Button className={classes.setIcon} onClick={onSet}>
                                <SetIcon />
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip title={t('bg.remove')}>
                        <IconButton className={classes.deleteIcon} onClick={onRemove}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    {source === BG_SOURCE.UNSPLASH && (
                        <Tooltip title={t('settings.bg.openSource')} placement="top">
                            <Link
                                className={classes.link}
                                underline="none"
                                href={sourceLink}
                                target="_blank"
                            >
                                <GridListTileBar
                                    className={classes.titleBar}
                                    classes={{
                                        actionIcon: classes.icon,
                                    }}
                                    subtitle={`by ${author}, Unsplash`}
                                    actionIcon={(<LeftIcon />)}
                                />
                            </Link>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </GridListTile>
    );
}

const MemoBg = memo(Bg);

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
                console.log('getAll', values)
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

        const listenerId = coreService.localEventBus.on('backgrounds/new', () => {
            fetchBackgrounds();
        });

        return () => coreService.localEventBus.removeListener(listenerId);
    }, []);

    return (
        <React.Fragment>
            {state === FETCH.PENDING && (
                <FullscreenStub>
                    <CircularProgress />
                </FullscreenStub>
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
                                    <GridListTile cols={4} style={{ height: 'auto' }}>
                                        <ListSubheader component="div">
                                            {t(`settings.bg.general.library.type.${group.type}`)}
                                        </ListSubheader>
                                    </GridListTile>
                                ),
                                ...group.list.map((bg) => (
                                    <MemoBg
                                        key={bg.id}
                                        {...bg}
                                        select={coreService.storage.persistent.bgCurrent?.id === bg.id}
                                        onSet={() => backgrounds.setCurrentBG(bg.id)}
                                        onRemove={() => backgrounds.removeFromStore(bg.id)}
                                    />
                                ))
                            ])}
                        </GridList>
                    )}
                    {bgs.length === 0 && (
                        <FullscreenStub message={t('bg.notFound')} />
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
