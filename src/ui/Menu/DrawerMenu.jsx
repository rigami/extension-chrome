import React, { useState } from 'react';
import {
    List,
    Backdrop,
    Portal,
    Slide,
    Box,
} from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Header from '@/ui/Menu/PageHeader';
import Scrollbar from '@/ui-components/CustomScroll';
import clsx from 'clsx';
import useAppService from '@/stores/app/AppStateProvider';
import { ACTIVITY } from '@/enum';
import { useTheme } from '@material-ui/styles';
import backgroundsPage from './Pages/QuietMode';
import MenuList from './Pages';

const useStyles = makeStyles((theme) => ({
    list: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        // boxShadow: theme.shadows[20],
        pointerEvents: 'auto',
        borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    },
    listContainer: {},
    trackY: {
        top: theme.spacing(2),
        bottom: theme.spacing(2),
        right: theme.spacing(0.75),
        pointerEvents: 'auto',
    },
    thumbY: { backgroundColor: theme.palette.background.paper },
    backdrop: { zIndex: theme.zIndex.drawer },
    darkBackdrop: { backgroundColor: alpha(theme.palette.common.black, 0.5) },
    drawer: {
        position: 'absolute !important',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.modal,
        display: 'flex',
    },
    section: { height: '100%' },
    scrollContent: {
        display: 'flex',
        boxShadow: `0px 4px ${theme.spacing(2)}px #00000017`,
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(2),
        minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
        backgroundColor: '#f5f5f5',
    },
    menu: {
        minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
        borderRight: `1px solid ${theme.palette.divider}`,
    },
}));

function Menu({ open, onClose }) {
    const classes = useStyles();
    const theme = useTheme();
    const appService = useAppService();
    const [stack, setStack] = useState([backgroundsPage]);

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
                onExited={() => setStack([backgroundsPage])}
            >
                <Box className={classes.drawer}>
                    <Box className={classes.section} style={{ width: 300 + 750 + theme.spacing(2) * 2 }}>
                        <Scrollbar
                            classes={{
                                trackY: classes.trackY,
                                thumbY: classes.thumbY,
                                content: classes.scrollContent,
                            }}
                        >
                            <Box className={classes.menu}>
                                <MenuList
                                    selected={stack[stack.length - 1]}
                                    onClose={handleBack}
                                    onSelect={(page) => setStack([page])}
                                />
                            </Box>
                            <List
                                disablePadding
                                className={classes.list}
                                style={{ width: 750 }}
                            >
                                <Header onBack={stack.length > 1 ? handleBack : null} {...headerProps} />
                                <Page
                                    onClose={handleBack}
                                    onSelect={(page) => setStack([...stack, page])}
                                />
                            </List>
                        </Scrollbar>
                    </Box>
                </Box>
            </Slide>
        </Portal>
    );
}

export default observer(Menu);
