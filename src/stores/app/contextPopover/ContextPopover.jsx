import React, { useRef } from 'react';
import { Popover, Box, Paper } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactResizeDetector from 'react-resize-detector';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    resetPaper: {
        background: 'none',
        overflow: 'unset',
    },
    paper: {
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
    nonBlockEventsBackdrop: {
        pointerEvents: 'none',
        '& $paper': { pointerEvents: 'all' },
    },
}));

function ContextPopover({ stateKey, service }) {
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
            data-role="contextpopover"
            data-open={service.isOpen[stateKey]}
            action={(actions) => { updatePosition.current = actions?.updatePosition; }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            anchorReference="anchorPosition"
            elevation={0}
            transitionDuration={{
                appear: theme.transitions.duration.standard,
                enter: theme.transitions.duration.enteringScreen,
                exit: theme.transitions.duration.leavingScreen,
            }}
            className={clsx(service.popovers[stateKey].nonBlockEventsBackdrop && classes.nonBlockEventsBackdrop)}
            anchorPosition={service.popovers[stateKey].position}
            open={service.isOpen[stateKey]}
            PaperProps={{ className: classes.resetPaper }}
            onClose={() => service.close(stateKey)}
            TransitionProps={{ onExited: () => service.clear(stateKey) }}
            disableAutoFocus={service.popovers[stateKey].disableAutoFocus}
            disableEnforceFocus={service.popovers[stateKey].disableEnforceFocus}
            disableRestoreFocus={service.popovers[stateKey].disableRestoreFocus}
        >
            <Paper className={clsx(classes.paper, service.popovers[stateKey].classes.paper)} elevation={22}>
                <ReactResizeDetector handleWidth handleHeight onResize={updatePopper}>
                    {() => (
                        <Box>
                            {service.popovers[stateKey].content()}
                        </Box>
                    )}
                </ReactResizeDetector>
            </Paper>
        </Popover>
    );
}

export default observer(ContextPopover);
