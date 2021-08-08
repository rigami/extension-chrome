import React, { useRef } from 'react';
import { Popover, Box, Paper } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactResizeDetector from 'react-resize-detector';
import PopoverCard from './PopoverCard';
import PopoverDialogHeader from './PopoverDialogHeader';

const useStyles = makeStyles((theme) => ({
    resetPaper: {
        background: 'none',
        overflow: 'unset',
    },
    paper: {
        margin: theme.spacing(1),
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
    },
}));

function PopoverDialog({ children, PaperProps = {}, ...props }) {
    const classes = useStyles();
    const theme = useTheme();
    const updatePosition = useRef(null);

    const updatePopper = () => {
        if (!updatePosition?.current) return;

        requestAnimationFrame(() => {
            updatePosition.current();
        });
    };

    return (
        <Popover
            action={(actions) => { updatePosition.current = actions?.updatePosition; }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            elevation={0}
            transitionDuration={{
                appear: theme.transitions.duration.standard,
                enter: theme.transitions.duration.enteringScreen,
                exit: theme.transitions.duration.leavingScreen,
            }}
            {...props}
            PaperProps={{ className: classes.resetPaper }}
        >
            <Paper {...PaperProps} className={clsx(classes.paper, PaperProps.className)} elevation={22}>
                <ReactResizeDetector handleWidth handleHeight onResize={updatePopper}>
                    {() => (
                        <Box>
                            {children}
                        </Box>
                    )}
                </ReactResizeDetector>
            </Paper>
        </Popover>
    );
}

export default PopoverDialog;
export { PopoverDialogHeader, PopoverCard };
