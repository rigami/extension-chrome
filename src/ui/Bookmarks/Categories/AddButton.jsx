import React, { useState } from 'react';
import {
    Tooltip,
    Chip,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import EditCategoryModal from './EditModal';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    chip: {
        boxShadow: 'none !important',
    },
    addCategory: {
        marginLeft: '3px !important',
        marginRight: 3,
    },
    addCategoryTitle: { display: 'none' },
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


function AddCategoryButton({ isShowTitle, onCreate }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <EditCategoryModal
                isOpen={isOpen}
                anchorEl={anchorEl}
                onClose={() => {
                    if (isBlockEvent) return;
                    setIsOpen(false);
                }}
                onSave={(categoryId) => {
                    onCreate(categoryId);
                    setIsOpen(false);
                }}
            />
            <Tooltip title={t("category.add")}>
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
                        icon: !isShowTitle && classes.addCategory,
                        label: !isShowTitle && classes.addCategoryTitle,
                    }}
                    icon={<AddIcon />}
                    variant="outlined"
                    label={isShowTitle && t("category.addShort")}
                />
            </Tooltip>
        </React.Fragment>
    );
}

export default AddCategoryButton;
