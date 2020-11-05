import React, { Fragment, useState, useRef } from 'react';
import {
    Popper,
    Button,
    Grow,
    Paper,
    ClickAwayListener,
    MenuList,
    MenuItem,
    Checkbox,
    ListItemText,
    ListItemIcon,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useObserver } from 'mobx-react-lite';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { SaveAltRounded as SaveIcon } from '@material-ui/icons';
import { eventToBackground } from '@/stores/backgroundApp/busApp';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
    backupButton: {
        width: 270,
        flexShrink: 0,
    },
    saveIcon: { marginLeft: 10 },
    paper: {
        margin: theme.spacing(1),
        width: 270,
    },
    optionLabel: {
        wordBreak: 'break-word',
        whiteSpace: 'break-spaces',
    },
    popper: { zIndex: theme.zIndex.modal },
    input: { display: 'none' },
}));

const headerProps = { title: 'settings.backup.title' };

function LocalBackup() {
    const classes = useStyles();
    const { t } = useTranslation();
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [saveItems, setSaveItems] = useState({
        settings: true,
        bookmarks: true,
    });

    const handleChange = (key, value) => {
        setSaveItems({
            ...saveItems,
            [key]: value,
        });
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const handleSave = () => {
        setOpen(false);

        eventToBackground('system/backup/local/create', saveItems);
    };

    return (
        <Fragment>
            <Button
                ref={anchorRef}
                onClick={handleToggle}
                color="primary"
                variant="contained"
                className={classes.backupButton}
            >
                {t('settings.backup.localBackup.create')}
            </Button>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                className={classes.popper}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom'
                                ? 'center top'
                                : 'center bottom',
                        }}
                    >
                        <Paper className={classes.paper} elevation={8}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList disablePadding>
                                    <MenuItem
                                        onClick={() => handleChange('settings', !saveItems.settings)}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.settings}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('settings.backup.localBackup.item.settings')}
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => handleChange('bookmarks', !saveItems.bookmarks)}
                                        divider
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.bookmarks}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('settings.backup.localBackup.item.bookmark')}
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleSave}
                                        color="primary"
                                        disabled={!saveItems.settings && !saveItems.bookmarks}
                                    >
                                        <ListItemIcon>
                                            <SaveIcon className={classes.saveIcon} />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('settings.backup.localBackup.save')}
                                        />
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Fragment>
    );
}

function BackupSettings() {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    const handleLocalRestore = (event) => {
        const form = event.target;
        if (form.files.length === 0) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const file = JSON.parse(reader.result);
                console.log('file', file);
                eventToBackground('system/backup/local/restore', { backup: file });
            } catch (e) {
                enqueueSnackbar({
                    message: t('settings.backup.localBackup.noty.failed.brokenFile'),
                    variant: 'success',
                });
            }
        };
        reader.readAsText(form.files[0]);
    };

    return useObserver(() => (
        <React.Fragment>
            <MenuRow
                title={t('settings.backup.localBackup.title')}
                description={t('settings.backup.localBackup.description')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (<LocalBackup />),
                }}
            />
            <MenuRow
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (
                        <React.Fragment>
                            <input
                                className={classes.input}
                                id="upload-from-system"
                                type="file"
                                accept=".json,.ctbup"
                                onChange={handleLocalRestore}
                            />
                            <label htmlFor="upload-from-system">
                                <Button
                                    variant="contained"
                                    component="span"
                                    color="primary"
                                    className={classes.backupButton}
                                >
                                    {t('settings.backup.localBackup.restore')}
                                </Button>
                            </label>
                        </React.Fragment>
                    ),
                }}
            />
        </React.Fragment>
    ));
}

export { headerProps as header, BackupSettings as content };
