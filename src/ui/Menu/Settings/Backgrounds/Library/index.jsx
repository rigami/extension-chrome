import React, { useState, useEffect, memo } from 'react';
import { BG_TYPE } from '@/enum';
import {
    Box,
    Avatar,
    Button,
    IconButton,
    Tooltip,
    CircularProgress,
    Typography,
} from '@material-ui/core';
import {
    WallpaperRounded as WallpaperIcon,
    CloudDownloadRounded as GetFromLibraryIcon,
    DeleteForeverRounded as DeleteIcon,
    CheckRounded as SetIcon,
} from '@material-ui/icons';
import { fade } from '@material-ui/core/styles/colorManipulator';
import FSConnector from '@/utils/fsConnector';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/ui/Menu/SectionHeader';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import FullscreenStub from '@/ui-components/FullscreenStub';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';
import LoadBGFromLocalButton from './LoadBGFromLocalButton';

const useStyles = makeStyles((theme) => ({
    bgWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 960,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
    },
    bgCard: {
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: '50%',
        height: '100%',
        width: '100%',
    },
    bgCardWrapper: {
        paddingRight: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        flexBasis: '25%',
        height: theme.spacing(20),
    },
    bgActionsWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fade(theme.palette.common.black, 0.7),
        opacity: 0,
        transition: theme.transitions.create('', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.short,
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
    bgActionDivider: {
        backgroundColor: fade(theme.palette.common.white, 0.5),
        height: 30,
        width: 2,
    },
    centerPage: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: { display: 'none' },
    bgStub: {
        position: 'absolute',
        zIndex: -1,
        height: '100%',
        width: '100%',
    },
}));

const headerProps = {
    title: 'settings.bg.general.library.title',
    actions: (<HeaderActions />),
    style: { width: 960 },
};

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

function BGCard({ fileName, onSet, onRemove }) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <div className={classes.bgCardWrapper}>
            <Box
                className={classes.bgCard}
                style={{ backgroundImage: `url('${FSConnector.getBGURL(fileName, 'preview')}')` }}
            >
                <Avatar variant="square" className={classes.bgStub}>
                    <WallpaperIcon fontSize="large" />
                </Avatar>
                <Box className={classes.bgActionsWrapper}>
                    <Tooltip title={t('settings.bg.apply')}>
                        <Button className={classes.setIcon} onClick={onSet}>
                            <SetIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('bg.remove')}>
                        <IconButton className={classes.deleteIcon} onClick={onRemove}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </div>
    );
}

const MemoBGCard = memo(BGCard);

function LibraryMenu() {
    const backgroundsService = useBackgroundsService();
    const { t } = useTranslation();
    const classes = useStyles();

    const [bgs, setBgs] = useState(null);
    const [state, setState] = useState('pending');

    useEffect(() => {
        backgroundsService.getAll()
            .then((values) => {
                setBgs(values);
                setState('done');
            })
            .catch((e) => {
                setState('failed');
                console.error('Failed load bg`s from db:', e);
            });
    }, [backgroundsService.count]);

    return (
        <React.Fragment>
            {state === 'pending' && (
                <Box className={classes.centerPage}>
                    <CircularProgress />
                </Box>
            )}
            {
                state === 'done' && Object.keys(BG_TYPE)
                    .filter((BGType) => bgs.filter(({ type }) => type === BG_TYPE[BGType]).length > 0)
                    .map((BGType) => (
                        <React.Fragment key={BGType}>
                            <SectionHeader title={t(`settings.bg.general.library.type.${BG_TYPE[BGType]}`)} />
                            <Box className={classes.bgWrapper}>
                                {bgs.filter(({ type }) => type === BG_TYPE[BGType]).map((bg) => (
                                    <MemoBGCard
                                        {...bg}
                                        key={bg.id}
                                        onSet={() => backgroundsService.setCurrentBG(bg.id)}
                                        onRemove={() => backgroundsService.removeFromStore(bg.id)}
                                    />
                                ))}
                            </Box>
                        </React.Fragment>
                    ))
            }
            {state === 'done' && bgs.length === 0 && (
                <FullscreenStub message={t('bg.notFound')} />
            )}
            {state === 'failed' && (
                <Box className={classes.centerPage}>
                    <Typography variant="h5" color="error">{t('error')}</Typography>
                    <Typography variant="body1" gutterBottom>{t('bg.loadFailed')}</Typography>
                </Box>
            )}
        </React.Fragment>
    );
}

const ObserverLibraryMenu = observer(LibraryMenu);

export { headerProps as header, ObserverLibraryMenu as content };
