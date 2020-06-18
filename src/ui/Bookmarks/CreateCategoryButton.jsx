import React, { useState } from 'react';
import {
    Tooltip,
    Chip,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import EditCategoryModal from './EditCategoryModal';

const useStyles = makeStyles((theme) => ({
    addCategory: {
        marginLeft: '3px !important',
        marginRight: 3,
    },
    addCategoryTitle: { display: 'none' },
    chipActive: {
        backgroundColor: '#616161',
        borderColor: '#616161',
        '&:focus': {
            backgroundColor: '#616161 !important',
            borderColor: '#616161',
        },
        '&:hover': {
            backgroundColor: '#888888 !important',
            borderColor: '#888888',
        },
    },
}));


function CreateCategoryButton({ isShowTitle, onCreate }) {
    const classes = useStyles();
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
            <Tooltip title="Добавить новую категорию">
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
                        root: isOpen && classes.chipActive,
                        icon: !isShowTitle && classes.addCategory,
                        label: !isShowTitle && classes.addCategoryTitle,
                    }}
                    icon={<AddIcon />}
                    variant="outlined"
                    label={isShowTitle && 'Добавить категорию'}
                />
            </Tooltip>
        </React.Fragment>
    );
}

export default CreateCategoryButton;
