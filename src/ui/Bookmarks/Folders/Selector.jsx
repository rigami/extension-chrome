import { EditRounded as EditIcon } from '@material-ui/icons';
import { Box, Breadcrumbs, Button, Chip, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import EditFolderModal from './EditModal';
import useBookmarksService from '@/stores/BookmarksProvider';

const useStyles = makeStyles((theme) => ({
    folderSelectButton: {
        textTransform: 'unset',
    },
    notSelect: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

function FolderSelector({ value, onChange }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const bookmarksService = useBookmarksService();
    const foldersService = bookmarksService.folders;
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);
    const [path, setPath] = useState(t('loading'));

    useEffect(() => {
        if (value) {
            foldersService.getPath(value)
                .then((folderPath) => setPath(folderPath));
        }
    }, [value]);

    return (
        <React.Fragment>
            <EditFolderModal
                isOpen={isOpen}
                anchorEl={anchorEl}
                onClose={() => {
                    if (isBlockEvent) return;
                    setIsOpen(false);
                }}
                onSave={(folderId) => {
                    onChange(folderId);
                    setIsOpen(false);
                }}
            />
            <Tooltip title={t('folder.editor.changeTooltip')}>
                <Button
                    endIcon={<EditIcon />}
                    className={classes.folderSelectButton}
                    onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        if (isBlockEvent) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                    onMouseDown={() => {
                        if (!isOpen) setIsBlockEvent(true);
                    }}
                >
                    {(value && Array.isArray(path) && (
                        <Breadcrumbs>
                            {path.map(({ name, id }, index) => (
                                <Typography
                                    key={id}
                                    color={index === path.length - 1 ? 'textPrimary': 'textSecondary'}
                                >
                                    {name}
                                </Typography>
                            ))}
                        </Breadcrumbs>
                    )) || (value && path) || (
                        <Typography className={classes.notSelect}>
                            {t('folder.editor.notSelect')}
                        </Typography>
                    )}
                </Button>
            </Tooltip>
        </React.Fragment>
    );
}

export default FolderSelector;
