import React, { useRef, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/BaseStateProvider';
import usAppService from '@/stores/AppStateProvider';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';
import ViewScrollPlugin from '@/utils/ViewScrollPlugin';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
    },
    // scrollBar: scrollbarClasses(theme).scrollBar,
    hideScroll: { opacity: 0 },
}));

function GlobalScroll({ children }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const appService = usAppService();
    const rootRef = useRef(null);

    useEffect(() => {
        Scrollbar.use(ViewScrollPlugin, OverscrollPlugin);

        const scrollbar = Scrollbar.init(rootRef.current, {
            damping: 0.2,
            thumbMinSize: 0,
            continuousScrolling: true,
            syncCallbacks: true,
            plugins: {
                overscroll: {
                    effect: 'bounce',
                    maxOverscroll: 150,
                },
                viewScrollPlugin: {
                    breakpoints: [
                        {
                            id: 'desktop',
                            value: 0,
                            block: true,
                        },
                        {
                            id: 'bookmarks',
                            value: document.documentElement.clientHeight,
                        },
                    ],
                    detectOffset: 70,
                    onBreakpoint: (breakpoint) => {
                        if (breakpoint?.id === 'desktop') {
                            appService.setActivity('desktop');
                        } else if (breakpoint?.id === 'bookmarks') {
                            appService.setActivity('bookmarks');
                        }
                    },
                },
            },
        });

        Scrollbar.detachStyle();

        scrollbar.track.xAxis.element.remove();

        scrollbar.addListener(({ offset }) => {
            coreService.localEventBus.call('system/scroll', offset);
        });

        console.log('scrollbar', scrollbar);
    }, []);

    return (
        <Box
            className={classes.root}
            ref={rootRef}
        >
            {children}
        </Box>
    );
}

export default observer(GlobalScroll);
