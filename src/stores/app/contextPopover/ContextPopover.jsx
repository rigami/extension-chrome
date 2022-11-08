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

function ContentPopover({ content, onReCalc, className: externalClassName }) {
    const classes = useStyles();
    const contentRef = useRef(null);

    useResizeDetector({
        handleHeight: true,
        handleWidth: true,
        targetRef: contentRef,
        onResize: onReCalc,
    });

    const Content = useCallback(() => content(), []);

    return (
        <Paper
            className={clsx(classes.paper, externalClassName)}
            elevation={22}
            ref={contentRef}
        >
            <Content />
        </Paper>
    );
}

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
            <ContentPopover
                content={service.popovers[stateKey].content}
                onReCalc={updatePopper}
                className={service.popovers[stateKey].classes.paper}
            />
        </Popover>
    );
}

export default observer(ContextPopover);
