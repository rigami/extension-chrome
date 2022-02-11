import React, { Fragment, useRef, useState } from 'react';
import {
    Button,
    Checkbox,
    ClickAwayListener,
    Grow,
    ListItemIcon, ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popper,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { captureException } from '@sentry/react';
import { SaveAltRounded as SaveIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import appVariables from '@/config/config';
import { eventToApp, eventToBackground } from '@/stores/universal/serviceBus';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import SectionHeader from '@/ui/Menu/SectionHeader';

const useStyles = makeStyles((theme) => ({
    backupButton: { flexShrink: 0 },
    fullWidth: { width: '100%' },
    saveIcon: { marginLeft: 10 },
    paper: {
        margin: theme.spacing(1),
        width: 252,
    },
    optionLabel: {
        wordBreak: 'break-word',
        whiteSpace: 'break-spaces',
    },
    popper: { zIndex: theme.zIndex.modal },
    input: { display: 'none' },
    fixOverflow: { whiteSpace: 'normal' },
    alignTop: { alignSelf: 'flex-start' },
}));

function BackupCreate() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [saveItems, setSaveItems] = useState({
        settings: true,
        bookmarks: true,
        backgrounds: false,
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
                data-ui-path="localBackup.create"
                ref={anchorRef}
                onClick={handleToggle}
                color="primary"
                variant="contained"
                fullWidth
                className={classes.backupButton}
            >
                {t('localBackup.create.button.create')}
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
                                        <ListItemIcon className={classes.alignTop}>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.settings}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('localBackup.syncItem.settings')}
                                        />
                                    </MenuItem>
                                    {BUILD === 'full' && (
                                        <MenuItem
                                            onClick={() => handleChange('bookmarks', !saveItems.bookmarks)}
                                        >
                                            <ListItemIcon className={classes.alignTop}>
                                                <Checkbox
                                                    color="primary"
                                                    checked={saveItems.bookmarks}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                classes={{ primary: classes.optionLabel }}
                                                primary={t('localBackup.syncItem.bookmarks')}
                                            />
                                        </MenuItem>
                                    )}
                                    <MenuItem
                                        onClick={() => handleChange('backgrounds', !saveItems.backgrounds)}
                                        divider
                                    >
                                        <ListItemIcon className={classes.alignTop}>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.backgrounds}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{
                                                primary: classes.optionLabel,
                                                secondary: classes.fixOverflow,
                                            }}
                                            primary={t('localBackup.syncItem.wallpapers')}
                                            secondary={t(
                                                'localBackup.syncItem.wallpapers',
                                                { context: 'description' },
                                            )}
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
                                            primary={t('localBackup.create.button.create')}
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

function LocalBackup() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);

    const handleLocalRestore = async (event) => {
        const form = event.target;
        if (form.files.length === 0) return;

        try {
            eventToApp('system/backup/local/restore/progress', { result: 'start' });
            const file = form.files[0];
            const type = file.name.substring(file.name.lastIndexOf('.') + 1);

            const cache = await caches.open('temp');

            const zipResponse = new Response(file);

            await cache.put(`${appVariables.rest.url}/temp/backup.zip`, zipResponse);

            eventToBackground('system/backup/local/restore', {
                type,
                path: `${appVariables.rest.url}/temp/backup.zip`,
            });
        } catch (e) {
            captureException(e);
            eventToApp('system/backup/local/restore/progress', { result: 'brokenFile' });
        }
    };

    return (
        <Fragment>
            <SectionHeader title={t('localBackup.title')} />
            <MenuRow
                title={t('localBackup.create.title')}
                description={t('localBackup.create.description')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (<BackupCreate />),
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
                                accept=".json,.ctbup,.rigami"
                                onChange={handleLocalRestore}
                            />
                            <label htmlFor="upload-from-system" className={classes.fullWidth}>
                                <Button
                                    data-ui-path="localBackup.restore"
                                    variant="contained"
                                    component="span"
                                    color="primary"
                                    fullWidth
                                    className={classes.backupButton}
                                >
                                    {t('localBackup.restore.button.restore')}
                                </Button>
                            </label>
                        </React.Fragment>
                    ),
                }}
            />
        </Fragment>
    );
}

export default observer(LocalBackup);
