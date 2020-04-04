import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE} from "dict";
import settings from "config/settings";
import {
    Box,
    Avatar,
    Button,
    IconButton,
    Divider, Tooltip,
} from "@material-ui/core";
import {
    WallpaperRounded as WallpaperIcon,
    AddRounded as AddIcon,
    CloudDownloadRounded as GetFromLibraryIcon,
    Add as UploadFromComputerIcon,
    DeleteForeverRounded as DeleteIcon,
    CheckRounded as SetIcon,
} from "@material-ui/icons";
import { fade } from '@material-ui/core/styles/colorManipulator';

import locale from "i18n/RU";
import PageHeader from "ui/Menu/PageHeader";
import SectionHeader from "ui/Menu/SectionHeader";
import SettingsRow from "ui/Menu/SettingsRow";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    bgWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 960,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1.5),
    },
    bgCard: {
        width: '100%',
        height: theme.spacing(20),
        position: 'relative',
    },
    bgCardWrapper: {
        paddingRight: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        flexBasis: '25%',
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
    }
}));

function BGCard() {
    const classes = useStyles();

    return (
        <Box className={classes.bgCardWrapper}>
            <Avatar variant="square" className={classes.bgCard}>
                <WallpaperIcon fontSize="large"/>
                <Box className={classes.bgActionsWrapper}>
                    <Tooltip title={locale.settings.backgrounds.general.library.set_bg}>
                        <IconButton className={classes.setIcon}>
                            <SetIcon />
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" variant="middle" className={classes.bgActionDivider} />
                    <Tooltip title={locale.settings.backgrounds.general.library.remove_bg}>
                        <IconButton className={classes.deleteIcon}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Avatar>
        </Box>
    );
}

function LibraryMenu({onSelect, onClose}) {
    const classes = useStyles();

    console.log(locale)

    return (
        <Fragment>
            <PageHeader
                title={locale.settings.backgrounds.general.library.title}
                onBack={() => onClose()}
                actions={(
                    <Fragment>
                        <Button
                            variant="contained"
                            disableElevation
                            color="primary"
                            startIcon={<UploadFromComputerIcon />}
                            style={{ marginRight: 16 }}
                        >
                            {locale.settings.backgrounds.general.library.upload_from_computer}
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<GetFromLibraryIcon />}
                        >
                            {locale.settings.backgrounds.general.library.get_from_library}
                        </Button>
                    </Fragment>
                )}
            />
            <SectionHeader title={locale.settings.backgrounds.general.library[BG_TYPE.IMAGE]} />
            <Box className={classes.bgWrapper}>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
            </Box>
            <SectionHeader title={locale.settings.backgrounds.general.library[BG_TYPE.ANIMATION]} />
            <Box className={classes.bgWrapper}>
                <BGCard/>
                <BGCard/>
                <BGCard/>
            </Box>
            <SectionHeader title={locale.settings.backgrounds.general.library[BG_TYPE.VIDEO]} />
            <Box className={classes.bgWrapper}>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
            </Box>
            <SectionHeader title={locale.settings.backgrounds.general.library[BG_TYPE.FILL_COLOR]} />
            <Box className={classes.bgWrapper}>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
            </Box>
        </Fragment>
    );
}

export default LibraryMenu;