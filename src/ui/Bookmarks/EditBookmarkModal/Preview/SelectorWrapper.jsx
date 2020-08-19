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
import Scrollbar from '@/ui-components/CustomScroll';
import PreviewSelector from './Selector';

const useStyles = makeStyles((theme) => ({
    popoverContent: {
        height: '100%',
        maxHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        background: 'none',
    },
}));

function SelectorWrapper({
    isOpen, onClose, minHeight, marginThreshold = 24, ...other
}) {
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
                    store.filedWidth = width;
                }}
            >
                <Box ref={(ref) => setAnchorEl(ref)} />
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
                            paddingTop: Math.max(anchorEl?.getBoundingClientRect?.()?.top, marginThreshold),
                            paddingLeft: anchorEl?.getBoundingClientRect?.()?.left,
                            paddingBottom: marginThreshold,
                        }}
                    >
                        <ClickAwayListener
                            onClickAway={() => onClose()}
                            mouseEvent="onMouseDown"
                        >
                            <Box>
                                <PreviewSelector
                                    {...other}
                                    style={{
                                        width: store.filedWidth,
                                        minHeight,
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
