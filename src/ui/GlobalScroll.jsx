import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalStore } from 'mobx-react-lite';
import { useService as useAppService } from '@/stores/app';
import Scrollbar, { classes as scrollbarClasses } from '@/ui-components/CustomScroll';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
    },
    scrollBar: scrollbarClasses(theme).scrollBar,
    hideScroll: { opacity: 0 },
}));

function GlobalScroll({ children }) {
    const classes = useStyles();
    const appService = useAppService();
    const [isShowScroll, setIsShowScroll] = useState(false);
    const store = useLocalStore(() => ({
        scrollbar: null,
        scrollDirection: null,
    }));

    const handlerScroll = ({ scrollTop }, { scrollTop: prevScrollTop }) => {
        store.scrollDirection = prevScrollTop - scrollTop > 0 ? 'up' : 'down';
        setIsShowScroll(scrollTop >= document.documentElement.clientHeight);
    };

    const handlerScrollStop = ({ scrollTop }) => {
        if (
            (store.scrollDirection === 'down' && scrollTop < 60)
            || (store.scrollDirection === 'up' && scrollTop < document.documentElement.clientHeight - 60)
        ) {
            store.scrollbar.contentElement.parentElement.scrollTo({
                behavior: 'smooth',
                left: 0,
                top: 0,
            });
            appService.setActivity('desktop');
        } else if (
            scrollTop < document.documentElement.clientHeight
        ) {
            store.scrollbar.contentElement.parentElement.scrollTo({
                behavior: 'smooth',
                left: 0,
                top: document.documentElement.clientHeight,
            });
            appService.setActivity('bookmarks');
        }
    };


    return (
        <Scrollbar
            className={classes.root}
            trackYProps={{
                renderer: (props) => {
                    const { elementRef, ...restProps } = props;
                    return (
                        <div
                            {...restProps}
                            ref={elementRef}
                            className={clsx(!isShowScroll && classes.hideScroll, classes.scrollBar)}
                        />
                    );
                },
            }}
            onScroll={handlerScroll}
            onScrollStop={handlerScrollStop}
            refScroll={(ref) => { store.scrollbar = ref; }}
        >
            {children}
        </Scrollbar>
    );
}

export default observer(GlobalScroll);
