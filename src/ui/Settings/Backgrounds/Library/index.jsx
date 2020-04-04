import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE} from "dict";
import settings from "config/settings";
import {
    Box,
    Avatar,
    Button,
} from "@material-ui/core";
import {
    WallpaperRounded as WallpaperIcon,
    AddRounded as AddIcon,
    CloudDownloadRounded as GetFromLibraryIcon,
    Add as UploadFromComputerIcon,
} from "@material-ui/icons";

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
    },
    bgCardWrapper: {
        paddingRight: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        flexBasis: '25%',
    }
}));

function BGCard() {
    const classes = useStyles();

    return (
        <Box className={classes.bgCardWrapper}>
            <Avatar variant="square" className={classes.bgCard}>
                <WallpaperIcon/>
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
                            Upload from computer
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<GetFromLibraryIcon />}
                        >
                            Get from library
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