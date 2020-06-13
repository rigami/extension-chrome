import React, { useState } from 'react';
import {
    Card,
    Popper,
    ClickAwayListener,
    Tooltip,
    Chip,
    InputBase,
    Button,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';

const useStyles = makeStyles((theme) => ({
    popperWrapper: { zIndex: theme.zIndex.modal },
    popper: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    addCategory: {
        marginLeft: '3px !important',
        marginRight: 3,
    },
    addCategoryTitle: { display: 'none' },
    input: { padding: theme.spacing(2) },
    saveButton: { marginRight: theme.spacing(2) },
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

function CreateCard({ onCreate }) {
    const classes = useStyles();
    const [categoryName, setCategoryName] = useState('');
    const bookmarksStore = useBookmarksService();

    const handlerSubmit = (event) => {
        event.preventDefault();
        if (categoryName.trim() !== '') {
            onCreate();
            bookmarksStore.addCategory(categoryName)
                .then((categoryId) => onCreate(categoryId));
        }
    };

    return (
        <Card className={classes.popper} elevation={16}>
            <form onSubmit={handlerSubmit}>
                <InputBase
                    className={classes.input}
                    placeholder="Категория"
                    variant="outlined"
                    autoFocus
                    onChange={(event) => setCategoryName(event.target.value)}
                />
                <Button
                    className={classes.saveButton}
                    onClick={handlerSubmit}
                    variant="contained"
                    color="primary"
                    type="submit"
                >
                    Сохранить
                </Button>
            </form>
        </Card>
    );
}

function CreateCategoryButton({ isShowTitle, onCreate }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <ClickAwayListener
                onClickAway={() => {
                    if (isBlockEvent) return;

                    setIsOpen(false);
                }}
                mouseEvent="onMouseDown"
            >
                <Popper
                    open={isOpen} anchorEl={anchorEl} placement="bottom"
                    className={classes.popperWrapper}
                >
                    <CreateCard
                        onCreate={() => {
                            setIsOpen(false);
                            onCreate();
                        }}
                    />
                </Popper>
            </ClickAwayListener>
            <Tooltip title="Добавить новую категорию">
                <Chip
                    ref={anchorEl}
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
