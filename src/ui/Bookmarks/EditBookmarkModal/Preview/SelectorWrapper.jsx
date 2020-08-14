import React, { useState } from 'react';
import {
    Box,
    ClickAwayListener,
    Popover,
    Fade,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import ReactResizeDetector from 'react-resize-detector';
import Scrollbar from "@/ui-components/CustomScroll";
import PreviewSelector from "@/ui/Bookmarks/EditBookmarkModal/Preview/Selector";

const useStyles = makeStyles((theme) => ({
    input: { marginTop: theme.spacing(2) },
    paper: {

    },
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
    scrollContent: {
        padding: theme.spacing(3, 0),
    },
}));

function SelectorWrapper({ isOpen, onClose, minHeight, ...other }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const store = useLocalStore(() => ({
        popperRef: null,
        filedWidth: 0,
    }));

    return useObserver(() => (
        <React.Fragment>
            <ReactResizeDetector
                handleHeight
                onResize={(width) => {
                    console.log('width', width)
                    store.filedWidth = width;
                }}
            >
                <Box ref={(ref) => setAnchorEl(ref)} />
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
                disableEnforceFocus
                onClose={() => {
                    console.log("CLOSE POPOVER");
                }}
            >
                <Scrollbar>
                    <Box
                        className={classes.scrollContent}
                        style={{
                            paddingTop: anchorEl?.getBoundingClientRect?.()?.top,
                            paddingLeft: anchorEl?.getBoundingClientRect?.()?.left,
                        }}
                        onClick={() => {
                            console.log("CLICK BACKDROP");
                        }}
                    >
                        <ClickAwayListener
                            onClickAway={() => {
                                console.log("CLOSE");
                                onClose();
                            }}
                            mouseEvent="onMouseDown"
                        >
                            <Box>
                                <PreviewSelector
                                    {...other}
                                    style={{ width: store.filedWidth, minHeight, }}
                                    onClick={() => {
                                        console.log("CLICK PAPER");
                                    }}
                                />
                            </Box>
                        </ClickAwayListener>
                    </Box>
                </Scrollbar>
            </Popover>
        </React.Fragment>
    ));
}

export default SelectorWrapper;
