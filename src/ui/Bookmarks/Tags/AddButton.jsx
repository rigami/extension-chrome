import React, { useState } from 'react';
import {
    Tooltip,
    Chip,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import EditTagModal from './EditModal';

const useStyles = makeStyles((theme) => ({
    chip: { boxShadow: 'none !important' },
    addTag: {
        marginLeft: '3px !important',
        marginRight: 3,
    },
    addTagTitle: { display: 'none' },
    chipActive: {
        backgroundColor: theme.palette.action.selected,
        borderColor: theme.palette.divider,
        '&:focus': {
            backgroundColor: `${theme.palette.action.focus} !important`,
            borderColor: theme.palette.divider,
        },
        '&:hover': {
            backgroundColor: `${theme.palette.action.hover} !important`,
            borderColor: theme.palette.divider,
        },
    },
}));

function AddTagButton({ isShowTitle, onCreate }) {
    const classes = useStyles();
    const { t } = useTranslation(['tag']);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <EditTagModal
                isOpen={isOpen}
                anchorEl={anchorEl}
                onClose={() => {
                    if (isBlockEvent) return;
                    setIsOpen(false);
                }}
                onSave={(tagId) => {
                    onCreate(tagId);
                    setIsOpen(false);
                }}
            />
            <Tooltip title={t('button.add')}>
                <Chip
                    onMouseDown={() => {
                        if (!isOpen) setIsBlockEvent(true);
                    }}
                    onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        if (isBlockEvent) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                    classes={{
                        root: clsx(classes.chip, isOpen && classes.chipActive),
                        icon: !isShowTitle && classes.addTag,
                        label: !isShowTitle && classes.addTagTitle,
                    }}
                    icon={<AddIcon />}
                    variant="outlined"
                    label={isShowTitle && t('button.add', { context: 'short' })}
                />
            </Tooltip>
        </React.Fragment>
    );
}

export default AddTagButton;
