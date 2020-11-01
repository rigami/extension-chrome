import React, { useState, createRef, useEffect } from 'react';
import {
    Box,
    TextField,
    ClickAwayListener,
    Paper,
    Popover,
    Fade,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useObserver, useLocalObservable } from 'mobx-react-lite';
import ReactResizeDetector from 'react-resize-detector';
import Scrollbar from '@/ui-components/CustomScroll';
import Search from './Search';

const useStyles = makeStyles((theme) => ({
    input: { marginTop: theme.spacing(2) },
    paper: {},
    inputWrapper: {
        padding: theme.spacing(2),
        paddingTop: 0,
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.paper,
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
}));

function SearchSiteField({ searchRequest = '', marginThreshold = 24, onSelect, onChange }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);
    const secondInput = createRef();

    const store = useLocalObservable(() => ({
        searchRequest,
        popperRef: null,
        filedWidth: 0,
    }));

    const handleChange = (event) => {
        store.searchRequest = event.target.value;
        onChange(store.searchRequest);
        if (store.searchRequest) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        console.log('searchRequest', searchRequest);
        store.searchRequest = searchRequest;
    }, [searchRequest]);

    return useObserver(() => (
        <React.Fragment>
            <ReactResizeDetector
                handleHeight
                onResize={(width) => {
                    store.filedWidth = width;
                }}
            >
                <TextField
                    label={t('bookmark.editor.urlFieldLabel')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={store.searchRequest}
                    className={classes.input}
                    onChange={handleChange}
                    onMouseDown={() => setIsBlockEvent(true)}
                    onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        if (store.searchRequest) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                />
            </ReactResizeDetector>
            <Popover
                open={isOpen}
                anchorReference="anchorPosition"
                anchorPosition={{
                    top: 0,
                    left: 0,
                }}
                marginThreshold={0}
                elevation={0}
                classes={{ paper: classes.popoverContent }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                TransitionComponent={Fade}
                disableEnforceFocus
            >
                <Scrollbar>
                    <Box
                        style={{
                            paddingTop: Math.max(anchorEl?.getBoundingClientRect?.()?.top - 16, marginThreshold),
                            paddingLeft: anchorEl?.getBoundingClientRect?.()?.left - 16,
                            paddingBottom: marginThreshold,
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
                                        label={t('bookmark.editor.urlFieldLabel')}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        autoFocus
                                        ref={secondInput}
                                        value={store.searchRequest || ' '}
                                        className={classes.input}
                                        onChange={handleChange}
                                        onMouseDown={() => setIsBlockEvent(true)}
                                        onClick={() => {
                                            if (store.searchRequest) setIsOpen(true);
                                            setIsBlockEvent(false);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.nativeEvent.code === 'Enter') {
                                                onSelect({
                                                    url: store.searchRequest,
                                                    forceAdded: true,
                                                });
                                                setIsOpen(false);
                                            }
                                        }}
                                    />
                                </Box>
                                <Search
                                    query={store.searchRequest}
                                    onSelect={(result) => {
                                        onSelect(result);
                                        setIsOpen(false);
                                    }}
                                />
                            </Paper>
                        </ClickAwayListener>
                    </Box>
                </Scrollbar>
            </Popover>
        </React.Fragment>
    ));
}

export default SearchSiteField;
