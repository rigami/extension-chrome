import React, { useEffect } from 'react';
import { EditRounded as EditIcon } from '@material-ui/icons';
import {
    Breadcrumbs,
    Button,
    Tooltip,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable, observer } from 'mobx-react-lite';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import EditFolderModal from './EditModal';

const useStyles = makeStyles((theme) => ({
    folderSelectButton: { textTransform: 'unset' },
    notSelect: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

function FolderSelector({ value, onChange }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        anchorEl: null,
        isOpen: false,
        isBlockEvent: false,
        path: t('loading'),
    }));

    useEffect(() => {
        if (value) {
            FoldersUniversalService.getPath(value)
                .then((folderPath) => { store.path = folderPath; });
        }
    }, [value]);

    return (
        <React.Fragment>
            <EditFolderModal
                isOpen={store.isOpen}
                anchorEl={store.anchorEl}
                selectId={value}
                onClose={() => {
                    if (store.isBlockEvent) return;
                    store.isOpen = false;
                }}
                onSave={(folderId) => {
                    onChange(folderId);
                    store.isOpen = false;
                }}
            />
            <Tooltip title={t('folder.editor.changeTooltip')}>
                <Button
                    data-ui-path="folder.editor.change"
                    endIcon={<EditIcon />}
                    className={classes.folderSelectButton}
                    onClick={(event) => {
                        store.anchorEl = event.currentTarget;
                        if (store.isBlockEvent) store.isOpen = true;
                        store.isBlockEvent = false;
                    }}
                    onMouseDown={() => {
                        if (!store.isOpen) store.isBlockEvent = true;
                    }}
                >
                    {(value && Array.isArray(store.path) && (
                        <Breadcrumbs>
                            {store.path.map(({ name, id }, index) => (
                                <Typography
                                    key={id}
                                    color={index === store.path.length - 1 ? 'textPrimary' : 'textSecondary'}
                                >
                                    {name}
                                </Typography>
                            ))}
                        </Breadcrumbs>
                    )) || (value && store.path) || (
                        <Typography className={classes.notSelect}>
                            {t('folder.editor.notSelect')}
                        </Typography>
                    )}
                </Button>
            </Tooltip>
        </React.Fragment>
    );
}

export default observer(FolderSelector);
