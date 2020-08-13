import React, { useEffect, useState } from 'react';
import {
    Button,
    Box,
    CardContent,
    Typography,
    TextField,
    CircularProgess,
    Popper,
    ClickAwayListener,
    Paper,
    Popover,
    Fade,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    DoneRounded as DoneIcon,
} from '@material-ui/icons';
import Categories from "@/ui/Bookmarks/Ctegories";
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import {FETCH} from "@/enum";
import EditCategory from "@/ui/Bookmarks/EditCategoryModal/EditCategory";
import {useService as useAppService} from "@/stores/app";
import Search from "@/ui/Bookmarks/EditBookmarkModal/Search";
import ReactResizeDetector from 'react-resize-detector';
import Scrollbar from "@/ui-components/CustomScroll";

const useStyles = makeStyles((theme) => ({
    content: { flex: '1 0 auto' },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    input: { marginTop: theme.spacing(2) },
    chipContainer: { marginTop: theme.spacing(2) },
    addDescriptionButton: { marginTop: theme.spacing(2) },
    popper: { zIndex: theme.zIndex.modal },
    paper: {

    },
    inputWrapper: {
        padding: theme.spacing(2),
        paddingTop: 0,
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.common.white,
        zIndex: 1,
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    },
    popoverContent: {
        height: '100%',
        maxHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        background: 'none',
    },
    scrollContent: {
        padding: theme.spacing(3, 0),
    },
}));

function SearchField(props) {
    const {
        label,
        searchRequest ='',
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    const store = useLocalStore(() => ({
        searchRequest,
        popperRef: null,
        filedWidth: 0,
    }));

    console.log(anchorEl);

    return useObserver(() => (
        <React.Fragment>
            <ReactResizeDetector
                handleHeight
                onResize={(width) => {
                    store.filedWidth = width;
                }}
            >
                <TextField
                    label={label}
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={store.searchRequest}
                    className={classes.input}
                    onChange={(event) => {
                        store.searchRequest = event.target.value;
                        if (store.searchRequest) {
                            setIsOpen(true);
                        } else {
                            setIsOpen(false);
                        }
                    }}
                    onMouseDown={() => {
                        /* if (!isOpen) */ setIsBlockEvent(true);
                    }}
                    onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        /*if (isBlockEvent)*/
                        if (store.searchRequest) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                />
            </ReactResizeDetector>
            <Popover
                open={isOpen}
                anchorReference="anchorPosition"
                anchorPosition={{ top: 0, left: 0 }}
                marginThreshold={0}
                elevation={0}
                classes={{
                    paper: classes.popoverContent,
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                TransitionComponent={Fade}
            >
                <Scrollbar>
                    <Box
                        className={classes.scrollContent}
                        style={{
                            paddingTop: anchorEl?.getBoundingClientRect?.()?.top - 16,
                            paddingLeft: anchorEl?.getBoundingClientRect?.()?.left - 16,
                        }}
                    >

                        <ClickAwayListener
                            onClickAway={() => {
                                if (isBlockEvent) return;
                                setIsOpen(false);
                            }}
                            mouseEvent="onMouseDown"
                        >
                            <Paper elevation={8} style={{ width: store.filedWidth + 32 }} className={classes.paper}>
                                <Box className={classes.inputWrapper}>
                                    <TextField
                                        label={label}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={store.searchRequest}
                                        className={classes.input}
                                        onChange={(event) => {
                                            store.searchRequest = event.target.value;
                                            if (store.searchRequest) {
                                                setIsOpen(true);
                                            } else {
                                                setIsOpen(false);
                                            }
                                        }}
                                        onMouseDown={() => {
                                            /* if (!isOpen) */ setIsBlockEvent(true);
                                        }}
                                        onClick={(event) => {
                                            /*if (isBlockEvent)*/
                                            if (store.searchRequest) setIsOpen(true);
                                            setIsBlockEvent(false);
                                        }}
                                    />
                                </Box>
                                <Search
                                    query={store.searchRequest}
                                    onSelect={console.log}
                                />
                            </Paper>
                        </ClickAwayListener>
                    </Box>
                </Scrollbar>
            </Popover>
        </React.Fragment>
    ));
}

export default SearchField;
