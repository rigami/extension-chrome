import React, {useState, useRef, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE} from "dict";
import {
    Box,
    Avatar,
    Button,
    IconButton,
    Divider,
    Tooltip,
    CircularProgress,
    Typography, DialogContentText,
} from "@material-ui/core";
import {
    WallpaperRounded as WallpaperIcon,
    AddRounded as AddIcon,
    CloudDownloadRounded as GetFromLibraryIcon,
    Add as UploadFromComputerIcon,
    DeleteForeverRounded as DeleteIcon,
    CheckRounded as SetIcon,
} from "@material-ui/icons";
import {fade} from '@material-ui/core/styles/colorManipulator';
import enqueueSnackbar, {useSnackbar} from 'notistack';
import FSConnector from "utils/fsConnector";

import locale from "i18n/RU";
import PageHeader from "ui/Menu/PageHeader";
import SectionHeader from "ui/Menu/SectionHeader";
import SettingsRow from "ui/Menu/SettingsRow";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import LoadBGFromLocalButton from "./LoadBGFromLocalButton";
import FullscreenStub from "ui-components/FullscreenStub";

const useStyles = makeStyles((theme) => ({
    bgWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 960,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1.5),
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
            duration: theme.transitions.duration.short
        }),
        '&:hover': {
            opacity: 1,
        }
    },
    setIcon: {
        color: theme.palette.primary.main,
    },
    deleteIcon: {
        color: theme.palette.error.main,
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
    input: {
        display: 'none',
    },
    bgStub: {
        position: 'absolute',
        zIndex: -1,
        height: '100%',
        width: '100%',
    }
}));


function BGCard({id, fileName, onSet, onRemove}) {
    const classes = useStyles();

    return (
        <div className={classes.bgCardWrapper}>
            <Box className={classes.bgCard} style={{backgroundImage: `url('${FSConnector.getURL(fileName, "preview")}')`}}>
                <Avatar variant="square" className={classes.bgStub}>
                    <WallpaperIcon fontSize="large"/>
                </Avatar>
                <Box className={classes.bgActionsWrapper}>
                    <Tooltip title={locale.settings.backgrounds.general.library.set_bg}>
                        <IconButton className={classes.setIcon} onClick={onSet}>
                            <SetIcon/>
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" variant="middle" className={classes.bgActionDivider}/>
                    <Tooltip title={locale.settings.backgrounds.general.library.remove_bg}>
                        <IconButton className={classes.deleteIcon} onClick={onRemove}>
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </div>
    );
}

function LibraryMenu({backgroundsStore, onSelect, onClose}) {
    const classes = useStyles();

    const [bgs, setBgs] = useState(null);
    const [state, setState] = useState('pending');


    useEffect(() => {
        backgroundsStore.getStore()
            .then((store) => store.getAllItems())
            .then((values) => {
                setBgs(values);
                setState('done');
            })
            .catch((e) => {
                setState('failed');
                console.error("Failed load bg`s from db:", e)
            });
    }, [backgroundsStore.count]);

    return (
        <Fragment>
            <PageHeader
                title={locale.settings.backgrounds.general.library.title}
                onBack={() => onClose()}
                actions={(
                    <Fragment>
                        <LoadBGFromLocalButton/>
                        <Tooltip title="Пока недоступно">
                            <div>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<GetFromLibraryIcon/>}
                                    disabled
                                >
                                    {locale.settings.backgrounds.general.library.get_from_library}
                                </Button>
                            </div>
                        </Tooltip>
                    </Fragment>
                )}
                style={{
                    width: 960,
                }}
            />
            {state === 'pending' && (
                <Box className={classes.centerPage}>
                    <CircularProgress/>
                </Box>
            )}
            {state === 'done' && Object.keys(BG_TYPE).filter((BGType) => bgs.filter(({type}) => type === BG_TYPE[BGType]).length > 0).map((BGType) => (
                <Fragment>
                    <SectionHeader title={locale.settings.backgrounds.general.library[BG_TYPE[BGType]]}/>
                    <Box className={classes.bgWrapper}>
                        {bgs.filter(({type}) => type === BG_TYPE[BGType]).map((bg) => (
                            <BGCard
                                {...bg}
                                onSet={() => backgroundsStore.setCurrentBG(bg.id)}
                                onRemove={() => backgroundsStore.removeFromStore(bg.id)}
                            />
                        ))}
                    </Box>
                </Fragment>
            ))}
            {state === 'done' && bgs.length === 0 && (
                <FullscreenStub message="У вас еще нет ни одного фона" />
            )}
            {state === 'failed' && (
                <Box className={classes.centerPage}>
                    <Typography variant='h5' color='error'>Ошибка</Typography>
                    <Typography variant='body1' gutterBottom>Не удалось загрузить фоны</Typography>
                </Box>
            )}
        </Fragment>
    );
}

export default inject('backgroundsStore')(observer(LibraryMenu));