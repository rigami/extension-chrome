import { EditRounded as EditIcon } from '@material-ui/icons';
import { Box, Button, Chip, Tooltip, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import EditFolderModal from './EditModal';

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
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <EditFolderModal
                isOpen={isOpen}
                anchorEl={anchorEl}
                onClose={() => {
                    if (isBlockEvent) return;
                    setIsOpen(false);
                }}
                onSave={(categoryId) => {
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
                    {value?.path || (
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
