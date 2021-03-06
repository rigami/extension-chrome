import React, { useRef, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import useAppService from '@/stores/app/AppStateProvider';
import { useResizeDetector } from 'react-resize-detector';
import { ACTIVITY } from '@/enum';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        width: '100vw',
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.complex,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    hideScroll: { opacity: 0 },
}));

const DIRECTION = {
    UP: 'UP',
    DOWN: 'DOWN',
};

function GlobalScroll({ children }) {
    const classes = useStyles();
    const appService = useAppService();
    const { width, height, ref: rootRef } = useResizeDetector();
    const store = useLocalObservable(() => ({
        scroll: null,
        speed: 0,
        direction: 0,
        active: false,
        aimScroll: null,
        scrollNow: 0,
        oldTime: 0,
        userActive: false,
        scrollTopBefore: 0,
        scrollTopNow: 0,
        views: [],
        activeView: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS ? 1 : 0,
        topOffset: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS
            ? -document.documentElement.clientHeight
            : 0,
    }));

    const scrollHandler = (delta) => {
        store.direction = delta > 0 ? DIRECTION.DOWN : DIRECTION.UP;

        const { activeView } = store;

        if (store.direction === DIRECTION.UP && store.activeViewTop) {
            store.activeView = Math.max(store.activeView - 1, 0);
        } else if (store.direction === DIRECTION.DOWN && store.activeViewBottom) {
            store.activeView = Math.min(store.activeView + 1, store.views.length - 1);
        }
        if (activeView === store.activeView) return;

        const view = store.views[store.activeView];

        store.topOffset = -view.ref.current.offsetTop;

        appService.setActivity(view.value);
    };

    const wheelHandler = (e) => {
        if (e.path.indexOf(rootRef.current) === -1) return;

        scrollHandler(e.deltaY);
    };

    useEffect(() => {
        addEventListener('wheel', wheelHandler, true);

        return () => removeEventListener('wheel', wheelHandler);
    }, []);

    const views = children.map((child) => ({
        value: child.props.value,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ref: useRef(),
    }));

    useEffect(() => {
        store.views = views;
    }, [children.length]);

    useEffect(() => {
        store.topOffset = -store.views[store.activeView].ref.current.offsetTop;
    }, [width, height]);

    return (
        <Box
            className={classes.root}
            ref={rootRef}
            style={{ transform: `translateY(${store.topOffset}px)` }}
        >
            {children.map((item, index) => React.cloneElement(item, {
                ref: views[index].ref,
                active: store.activeView === index,
                onScroll: ({ isTop, isBottom }) => {
                    if (store.activeView === index) {
                        store.activeViewTop = isTop;
                        store.activeViewBottom = isBottom;
                    }
                },
            }))}
        </Box>
    );
}

export default observer(GlobalScroll);
