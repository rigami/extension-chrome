import React, { useState, useEffect } from 'react';
import {
    List,
    Backdrop,
    Portal,
    Slide,
} from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import Header from '@/ui/Menu/PageHeader';
import Scrollbar from '@/ui-components/CustomScroll';
import clsx from 'clsx';
import useAppService from '@/stores/app/AppStateProvider';
import { ACTIVITY } from '@/enum';
import HomePage, { header as homePageHeader } from './Settings';

const useStyles = makeStyles((theme) => ({
    list: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
        backgroundColor: theme.palette.background.paper,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginLeft: 'auto',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[20],
        pointerEvents: 'auto',
    },
    trackY: {
        top: theme.spacing(2),
        bottom: theme.spacing(2),
        right: theme.spacing(0.75),
        pointerEvents: 'auto',
    },
    thumbY: { backgroundColor: theme.palette.background.paper },
    backdrop: { zIndex: theme.zIndex.drawer },
    darkBackdrop: { backgroundColor: fade(theme.palette.common.black, 0.5) },
    drawer: {
        position: 'absolute !important',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: theme.zIndex.modal,
        pointerEvents: 'none',
    },
}));

function Menu({ }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const appService = useAppService();
    const [isOpen, setIsOpen] = useState(false);
    const [stack, setStack] = useState([
        {
            content: HomePage,
            header: homePageHeader,
        },
    ]);

    const handleClose = () => {
        setStack([
            {
                content: HomePage,
                header: homePageHeader,
            },
        ]);
        setIsOpen(false);
    };

    const handleBack = () => {
        if (stack.length === 1) {
            handleClose();
        } else {
            setStack(stack.slice(0, stack.length - 1));
        }
    };

    const Page = stack[stack.length - 1].content;
    const headerProps = stack[stack.length - 1] && stack[stack.length - 1].header;
    const pageProps = (stack[stack.length - 1] && stack[stack.length - 1].props) || {};

    useEffect(() => {
        const listenerId = coreService.localEventBus.on('settings/open', () => {
            setIsOpen(true);
        });

        return () => coreService.localEventBus.removeListener(listenerId);
    }, []);

    return (
        <Portal>
            <Backdrop
                open={isOpen}
                onClick={handleClose}
                invisible
                className={clsx(classes.backdrop, appService.activity === ACTIVITY.BOOKMARKS && classes.darkBackdrop)}
            />
            <Slide in={isOpen} direction="left">
                <Scrollbar
                    className={classes.drawer}
                    classes={{
                        trackY: classes.trackY,
                        thumbY: classes.thumbY,
                    }}
                >
                    <List
                        disablePadding
                        className={classes.list}
                        style={{ width: pageProps.width || 520 }}
                    >
                        <Header onBack={handleBack} {...headerProps} />
                        <Page
                            onClose={handleBack}
                            onSelect={(page) => setStack([...stack, page])}
                        />
                    </List>
                </Scrollbar>
            </Slide>
        </Portal>
    );
}

export default observer(Menu);
