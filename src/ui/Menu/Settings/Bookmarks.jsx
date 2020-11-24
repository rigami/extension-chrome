import React, { useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import {
    ACTIVITY,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
    DESTINATION,
} from '@/enum';
import {
    Button,
    Collapse,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useBookmarksService from '@/stores/BookmarksProvider';
import MenuInfo from '@/ui/Menu/MenuInfo';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useCoreService from '@/stores/BaseStateProvider';
import useAppService from '@/stores/AppStateProvider';
import { makeStyles } from '@material-ui/core/styles';

const headerProps = { title: 'settings.bookmarks.title' };

const useStyles = makeStyles((theme) => ({
    reRunSyncButton: {
        flexShrink: 0,
    },
}));

function BrowserSync() {
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const [actionEditorOpen, setActionEditorOpen] = useState(false);
    const [actionUrl, setActionUrl] = useState('');

    return useObserver(() => (
        <React.Fragment>
            <SectionHeader title={t("settings.bookmarks.systemBookmarks.title")} />
            <MenuRow
                title={t("settings.bookmarks.systemBookmarks.syncSystemBookmarks.title")}
                description={t("settings.bookmarks.systemBookmarks.syncSystemBookmarks.description")}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksService.settings.syncWithSystem,
                    onChange: (event, value) => {
                        bookmarksService.settings.update({ syncWithSystem: value });
                    },
                }}
            />
            <Collapse in={bookmarksService.settings.syncWithSystem}>
                <MenuRow
                    title={t("settings.bookmarks.systemBookmarks.syncMerge.title")}
                    description={t("settings.bookmarks.systemBookmarks.syncMerge.description")}
                    action={{
                        type: ROWS_TYPE.CHECKBOX,
                        value: bookmarksService.settings.syncMerge,
                        onChange: (event, value) => {
                            bookmarksService.settings.update({ syncMerge: value });
                        },
                    }}
                />
                <Collapse in={bookmarksService.settings.syncWithSystem && !bookmarksService.settings.syncMerge}>
                    <MenuRow
                        title={t('settings.bookmarks.systemBookmarks.folderName.title')}
                        description={t('settings.bookmarks.systemBookmarks.folderName.description')}
                        action={{
                            type: ROWS_TYPE.LINK,
                            onClick: () => { setActionEditorOpen(true); },
                            component: bookmarksService.settings.syncFolderName,
                        }}
                    />
                    <Dialog open={actionEditorOpen} onClose={() => { setActionEditorOpen(false); }}>
                        <DialogTitle>
                            {t('settings.bookmarks.systemBookmarks.folderName.title')}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {t('settings.bookmarks.systemBookmarks.folderName.fullDescription')}
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                defaultValue={bookmarksService.settings.syncFolderName}
                                fullWidth
                                label={t('settings.bookmarks.systemBookmarks.folderName.textFieldLabel')}
                                onChange={(event) => { setActionUrl(event.target.value); }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                color="primary"
                                onClick={() => { setActionEditorOpen(false); }}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                color="primary"
                                onClick={() => {
                                    setActionEditorOpen(false);
                                    bookmarksService.settings.update({ syncFolderName: actionUrl });
                                }}
                            >
                                {t('save')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Collapse>
                <MenuRow
                    title={t('settings.bookmarks.systemBookmarks.reRunSync.title')}
                    description={t('settings.bookmarks.systemBookmarks.reRunSync.description')}
                    action={{
                        type: ROWS_TYPE.CUSTOM,
                        onClick: () => {},
                        component: (
                            <Button
                                variant="contained"
                                component="span"
                                color="primary"
                                className={classes.reRunSyncButton}
                                fullWidth
                                onClick={() => {
                                    coreService.globalEventBus.call('system/parseSystemBookmarks', DESTINATION.BACKGROUND);
                                }}
                            >
                                {t('settings.bookmarks.systemBookmarks.reRunSync.button')}
                            </Button>
                        ),
                    }}
                />
            </Collapse>
        </React.Fragment>
    ));
}

function BookmarksSettings() {
    const bookmarksService = useBookmarksService();
    const appService = useAppService();
    const { t } = useTranslation();

    return useObserver(() => (
        <React.Fragment>
            <SectionHeader title={t('settings.bookmarks.general.title')} />
            <MenuRow
                title={t('settings.bookmarks.general.openOnStartup.title')}
                description={t('settings.bookmarks.general.openOnStartup.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS,
                    onChange: (event, value) => appService.settings
                        .update({ defaultActivity: value ? ACTIVITY.BOOKMARKS : ACTIVITY.DESKTOP }),
                }}
            />
            <SectionHeader title={t('settings.bookmarks.FAP.title')} />
            <MenuRow
                title={t('settings.bookmarks.FAP.useFAP.title')}
                description={t('settings.bookmarks.FAP.useFAP.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => bookmarksService.settings
                        .update({ fapStyle: value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN }),
                }}
            />
            <MenuInfo
                width={750}
                show={(
                    bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
                    && bookmarksService.favorites.length === 0
                )}
                message={t('settings.bookmarks.FAP.fapEmptyWarningMessage')}
            />
            <Collapse in={bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapStyle.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapStyle.style.${value}`),
                        value: bookmarksService.settings.fapStyle,
                        onChange: (event) => bookmarksService.settings.update({ fapStyle: event.target.value }),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT],
                    }}
                />
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapPosition.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapPosition.position.${value}`),
                        value: bookmarksService.settings.fapPosition,
                        onChange: (event) => bookmarksService.settings.update({ fapPosition: event.target.value }),
                        values: [BKMS_FAP_POSITION.TOP, BKMS_FAP_POSITION.BOTTOM],
                    }}
                />
            </Collapse>
            <BrowserSync />
        </React.Fragment>
    ));
}

export { headerProps as header, BookmarksSettings as content };
