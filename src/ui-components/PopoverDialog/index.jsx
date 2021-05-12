import React, { useRef } from 'react';
import { Popover, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactResizeDetector from 'react-resize-detector';
import PopoverCard from './PopoverCard';
import PopoverDialogHeader from './PopoverDialogHeader';

const useStyles = makeStyles((theme) => ({
    paper: {
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
    },
}));

function PopoverDialog({ children, PaperProps = {}, ...props }) {
    const classes = useStyles();
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
            elevation={22}
            {...props}
            PaperProps={{
                ...PaperProps,
                className: clsx(classes.paper, PaperProps.className),
            }}
        >
            <ReactResizeDetector handleWidth handleHeight onResize={updatePopper}>
                {() => (
                    <Box>
                        {children}
                    </Box>
                )}
            </ReactResizeDetector>
        </Popover>
    );
}

export default PopoverDialog;
export { PopoverDialogHeader, PopoverCard };
