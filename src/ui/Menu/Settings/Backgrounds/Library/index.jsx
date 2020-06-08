import React, { useState, useEffect, memo } from 'react';
import { BG_TYPE } from '@/dict';
import {
    Box,
    Avatar,
    Button,
    IconButton,
    Divider,
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
import locale from '@/i18n/RU';
import SectionHeader from '@/ui/Menu/SectionHeader';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
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
    setIcon: { color: theme.palette.primary.main },
    deleteIcon: { color: theme.palette.error.main },
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
    title: locale.settings.backgrounds.general.library.title,
    actions: (<HeaderActions />),
    style: { width: 960 },
};

function HeaderActions() {
    return (
        <React.Fragment>
            <LoadBGFromLocalButton />
            <Tooltip title="Пока недоступно">
                <div>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<GetFromLibraryIcon />}
                        disabled
                    >
                        {locale.settings.backgrounds.general.library.get_from_library}
                    </Button>
                </div>
            </Tooltip>
        </React.Fragment>
    );
}

function BGCard({ fileName, onSet, onRemove }) {
    const classes = useStyles();

    return (
        <div className={classes.bgCardWrapper}>
            <Box
                className={classes.bgCard}
                style={{ backgroundImage: `url('${FSConnector.getURL(fileName, 'preview')}')` }}
            >
                <Avatar variant="square" className={classes.bgStub}>
                    <WallpaperIcon fontSize="large" />
                </Avatar>
                <Box className={classes.bgActionsWrapper}>
                    <Tooltip title={locale.settings.backgrounds.general.library.set_bg}>
                        <IconButton className={classes.setIcon} onClick={onSet}>
                            <SetIcon />
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" variant="middle" className={classes.bgActionDivider} />
                    <Tooltip title={locale.settings.backgrounds.general.library.remove_bg}>
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
    const backgroundsStore = useBackgroundsService();

    const classes = useStyles();

    const [bgs, setBgs] = useState(null);
    const [state, setState] = useState('pending');


    useEffect(() => {
        backgroundsStore.getAll()
            .then((values) => {
                setBgs(values);
                setState('done');
            })
            .catch((e) => {
                setState('failed');
                console.error('Failed load bg`s from db:', e);
            });
    }, [backgroundsStore.count]);

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
                            <SectionHeader title={locale.settings.backgrounds.general.library[BG_TYPE[BGType]]} />
                            <Box className={classes.bgWrapper}>
                                {bgs.filter(({ type }) => type === BG_TYPE[BGType]).map((bg) => (
                                    <MemoBGCard
                                        {...bg}
                                        key={bg.id}
                                        onSet={() => backgroundsStore.setCurrentBG(bg.id)}
                                        onRemove={() => backgroundsStore.removeFromStore(bg.id)}
                                    />
                                ))}
                            </Box>
                        </React.Fragment>
                    ))
            }
            {state === 'done' && bgs.length === 0 && (
                <FullscreenStub message="У вас еще нет ни одного фона" />
            )}
            {state === 'failed' && (
                <Box className={classes.centerPage}>
                    <Typography variant="h5" color="error">Ошибка</Typography>
                    <Typography variant="body1" gutterBottom>Не удалось загрузить фоны</Typography>
                </Box>
            )}
        </React.Fragment>
    );
}

const ObserverLibraryMenu = observer(LibraryMenu);

export { headerProps as header, ObserverLibraryMenu as content };
