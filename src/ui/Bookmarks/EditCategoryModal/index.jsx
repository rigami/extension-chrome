import React from 'react';
import {
    Popper,
    ClickAwayListener,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditCategory from "@/ui/Bookmarks/EditCategoryModal/EditCategory";

const useStyles = makeStyles((theme) => ({
    popper: { zIndex: theme.zIndex.modal },
}));

function EditCategoryModal({ anchorEl, isOpen, onSave, onClose, ...other }) {
    const classes = useStyles();

    return (
        <ClickAwayListener
            onClickAway={onClose}
            mouseEvent="onMouseDown"
        >
            <Popper
                open={!!isOpen}
                anchorEl={anchorEl}
                placement="bottom"
                className={classes.popper}
            >
                <EditCategory
                    onSave={(categoryId) => onSave && onSave(categoryId)}
                    {...other}
                />
            </Popper>
        </ClickAwayListener>
    );
}

export default EditCategoryModal;
