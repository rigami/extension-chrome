import React, {useEffect, useState} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {inject, observer} from "mobx-react";

import {useSnackbar} from "notistack";
import {
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    CircularProgress,
    Tooltip,
    Card,
    Checkbox,
    CardContent,
    Typography,
    CardMedia,
    FormControlLabel,
    Switch,
    Drawer,
    Container,
} from "@material-ui/core";
import {
    Add as UploadFromComputerIcon,
    CloseRounded as DeleteIcon,
    WarningRounded as WarningIcon,
    CheckRounded as SuccessIcon,
} from "@material-ui/icons";
import Modal from "ui-components/Modal";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import locale from "i18n/RU";
import { ERRORS as BG_UPLOAD_ERRORS } from "stores/backgrounds";

const useStyles = makeStyles((theme) => ({
    input: {
        display: 'none',
    },
}));
function LoadBGFromLocalButton({backgroundsStore}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    return (
        <Fragment>
            <input
                className={classes.input}
                id="upload-from-system"
                multiple
                type="file"
                accept="video/*,image/*"
                onChange={(event) => {
                    if (event.target.files.length === 0) return;

                    backgroundsStore.addToUploadQueue(event.target.files)
                        .catch((e) => enqueueSnackbar({
                            ...locale.settings.backgrounds.general.library[e],
                            variant: 'error'
                        }))
                        .finally(() => {
                            event.target.value = '';
                        })
                }}
            />
            <label htmlFor="upload-from-system">
                <Button
                    variant="contained"
                    component="span"
                    disableElevation
                    color="primary"
                    startIcon={<UploadFromComputerIcon/>}
                    style={{marginRight: 16}}
                >
                    {locale.settings.backgrounds.general.library.upload_from_computer}
                </Button>
            </label>
        </Fragment>
    );
}

export default inject('backgroundsStore')(observer(LoadBGFromLocalButton));