import React, { useCallback, useRef } from 'react';
import { Popover, Paper } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useResizeDetector } from 'react-resize-detector';
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

    const updatePopper = useCallback(() => {
        if (!updatePosition?.current) return;

        requestAnimationFrame(() => {
            updatePosition.current();
        });
    }, []);

    const { ref: contentRef } = useResizeDetector({ onResize: updatePopper });
    useResizeDetector({
        targetRef: service.popovers[stateKey].anchorEl || { current: null },
        onResize: updatePopper,
    });

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
            anchorReference={service.popovers[stateKey].anchorEl ? 'anchorEl' : 'anchorPosition'}
            elevation={0}
            transitionDuration={{
                appear: theme.transitions.duration.standard,
                enter: theme.transitions.duration.enteringScreen,
                exit: theme.transitions.duration.leavingScreen,
            }}
            className={clsx(service.popovers[stateKey].nonBlockEventsBackdrop && classes.nonBlockEventsBackdrop)}
            anchorPosition={service.popovers[stateKey].position}
            anchorEl={service.popovers[stateKey].anchorEl?.current}
            open={service.isOpen[stateKey]}
            PaperProps={{ className: classes.resetPaper }}
            onClose={() => service.close(stateKey)}
            TransitionProps={{ onExited: () => service.clear(stateKey) }}
            disableAutoFocus={service.popovers[stateKey].disableAutoFocus}
            disableEnforceFocus={service.popovers[stateKey].disableEnforceFocus}
            disableRestoreFocus={service.popovers[stateKey].disableRestoreFocus}
        >
            <Paper
                className={clsx(classes.paper, service.popovers[stateKey].classes.paper)}
                elevation={22}
                ref={contentRef}
            >
                {service.popovers[stateKey].content()}
            </Paper>
        </Popover>
    );
}

export default observer(ContextPopover);
