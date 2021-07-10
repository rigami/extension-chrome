import React, { useState } from 'react';
import {
    List,
    Backdrop,
    Portal,
    Slide,
    Box,
} from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Header from '@/ui/Menu/PageHeader';
import Scrollbar from '@/ui-components/CustomScroll';
import clsx from 'clsx';
import useAppService from '@/stores/app/AppStateProvider';
import { ACTIVITY } from '@/enum';
import { useTheme } from '@material-ui/styles';
import HomePage, { header as homePageHeader } from './Pages';

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
        marginLeft: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        boxShadow: `0px 4px ${theme.spacing(2)}px #00000017`,
        // boxShadow: theme.shadows[20],
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
        zIndex: theme.zIndex.modal,
    },
}));

function Menu({ open, onClose }) {
    const classes = useStyles();
    const theme = useTheme();
    const appService = useAppService();
    const [stack, setStack] = useState([
        {
            content: HomePage,
            header: homePageHeader,
        },
    ]);

    const handleBack = () => {
        if (stack.length === 1) {
            onClose();
        } else {
            setStack(stack.slice(0, stack.length - 1));
        }
    };

    const Page = stack[stack.length - 1].content;
    const headerProps = stack[stack.length - 1] && stack[stack.length - 1].header;
    const pageProps = (stack[stack.length - 1] && stack[stack.length - 1].props) || {};

    return (
        <Portal>
            <Backdrop
                open={open}
                onClick={onClose}
                invisible
                className={clsx(classes.backdrop, appService.activity !== ACTIVITY.DESKTOP && classes.darkBackdrop)}
            />
            <Slide
                in={open}
                direction="left"
                unmountOnExit
                onExited={() => setStack([
                    {
                        content: HomePage,
                        header: homePageHeader,
                    },
                ])}
            >
                <Box className={classes.drawer} style={{ width: (pageProps.width || 520) + theme.spacing(2) * 2 }}>
                    <Scrollbar
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
                </Box>
            </Slide>
        </Portal>
    );
}

export default observer(Menu);
