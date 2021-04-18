import React, { useEffect, useRef } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import useAppService from '@/stores/app/AppStateProvider';
import { ACTIVITY } from '@/enum';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        width: '100vw',
        transition: theme.transitions.create(['transform'], {
            duration: 550,
            easing: 'cubic-bezier(0.08, 0.85, 0.19, 1.01)',
        }),
    },
    hideScroll: { opacity: 0 },
}));

export const DIRECTION = {
    UP: 'UP',
    DOWN: 'DOWN',
};

function GlobalScroll({ children }) {
    const classes = useStyles();
    const appService = useAppService();
    const ref = useRef();
    const store = useLocalObservable(() => ({
        direction: 0,
        activeView: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS ? 1 : 0,
        blockViewTop: false,
        blockViewBottom: false,
        viewsCallbacks: {},
    }));

    const scrollHandler = (delta) => {
        store.direction = delta > 0 ? DIRECTION.DOWN : DIRECTION.UP;

        const { activeView } = store;

        if (store.viewsCallbacks[activeView]) store.viewsCallbacks[activeView](store.direction);
        if (store.direction === DIRECTION.UP && !store.blockViewTop) {
            store.activeView = Math.max(store.activeView - 1, 0);
        } else if (store.direction === DIRECTION.DOWN && !store.blockViewBottom) {
            store.activeView = Math.min(store.activeView + 1, children.length - 1);
        }
        if (activeView === store.activeView) return;

        appService.setActivity(children[store.activeView].props.value);
    };

    const wheelHandler = (e) => {
        if (e.path.indexOf(ref.current) === -1) return;

        scrollHandler(e.deltaY);
    };

    useEffect(() => {
        addEventListener('wheel', wheelHandler, true);

        return () => removeEventListener('wheel', wheelHandler);
    }, []);

    return (
        <Box
            className={classes.root}
            ref={ref}
            style={{
                transform: `translateY(${store.activeView * -100}vh)`,
                height: `${children.length * 100}vh`,
            }}
        >
            {children.map((item, index) => React.cloneElement(item, {
                key: item.props.value,
                active: store.activeView === index,
                onScroll: ({ blockTop, blockBottom }) => {
                    if (store.activeView === index) {
                        store.blockViewTop = blockTop;
                        store.blockViewBottom = blockBottom;
                    }
                },
                onTryScrollCallback: (callback) => {
                    store.viewsCallbacks[index] = callback;
                },
            }))}
        </Box>
    );
}

export default observer(GlobalScroll);
