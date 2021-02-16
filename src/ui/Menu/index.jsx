import React, { useState, useEffect } from 'react';
import {
    List,
    Divider,
    Backdrop,
    Portal,
    Slide,
} from '@material-ui/core';
import {
    PauseRounded as PauseIcon,
    PlayArrowRounded as PlayIcon,
    AddRounded as AddIcon,
    CheckRounded as AddedIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import {
    BG_SELECT_MODE,
    BG_TYPE,
    BG_SHOW_MODE,
    BG_SOURCE,
} from '@/enum';
import useCoreService from '@/stores/app/BaseStateProvider';
import Header from '@/ui/Menu/PageHeader';
import { useTranslation } from 'react-i18next';
import Scrollbar from '@/ui-components/CustomScroll';
import { eventToBackground } from '@/stores/server/bus';
import useAppStateService from '@/stores/app/AppStateProvider';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import FabMenu from './FabMenu';
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
    divider: {
        backgroundColor: fade(theme.palette.common.white, 0.12),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    description: { color: theme.palette.text.secondary },
    trackY: {
        top: theme.spacing(2),
        bottom: theme.spacing(2),
        right: theme.spacing(0.75),
        pointerEvents: 'auto',
    },
    thumbY: { backgroundColor: theme.palette.background.paper },
    backdrop: { zIndex: theme.zIndex.drawer },
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
    const { backgrounds } = useAppStateService();
    const coreService = useCoreService();
    const { t } = useTranslation();

    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [stack, setStack] = useState([
        {
            content: HomePage,
            header: homePageHeader,
        },
    ]);
    const [fastSettings, setFastSettings] = useState([]);

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

    useEffect(() => {
        const settings = [];

        if (!backgrounds.currentBGId) {
            setFastSettings(settings);
            return;
        }

        console.log('menu:', backgrounds.bgShowMode, backgrounds.currentBG.type);

        if (backgrounds.currentBG.type === BG_TYPE.VIDEO && backgrounds.bgShowMode === BG_SHOW_MODE.LIVE) {
            settings.push({
                id: 'pauseVideo',
                tooltip: (
                    <React.Fragment>
                        <b>{t('bg.pauseVideo')}</b>
                        <Divider className={classes.divider} />
                        {t('bg.pauseVideoDescription')}
                    </React.Fragment>
                ),
                onClick: () => coreService.localEventBus.call('background/pause'),
                icon: <PauseIcon />,
            });
        }

        if (backgrounds.currentBG.type === BG_TYPE.VIDEO && backgrounds.bgShowMode === BG_SHOW_MODE.STATIC) {
            settings.push({
                id: 'playVideo',
                tooltip: t('bg.playVideo'),
                onClick: () => coreService.localEventBus.call('background/play'),
                icon: <PlayIcon />,
            });
        }

        if (
            backgrounds.settings.selectionMethod === BG_SELECT_MODE.STREAM
            && backgrounds.currentBG.source !== BG_SOURCE.USER
            && !backgrounds.currentBG.isSaved
        ) {
            settings.push({
                id: 'addToLibrary',
                tooltip: t('bg.addToLibrary'),
                onClick: () => BackgroundsUniversalService.addToLibrary(backgrounds.currentBG),
                icon: <AddIcon />,
            });
        }

        if (
            backgrounds.settings.selectionMethod === BG_SELECT_MODE.STREAM
            && backgrounds.currentBG.source !== BG_SOURCE.USER
            && backgrounds.currentBG.isSaved
        ) {
            settings.push({
                id: 'addedToLibrary',
                tooltip: t('bg.addedToLibrary'),
                icon: <AddedIcon />,
                disableRipple: true,
            });
        }

        setFastSettings(settings);
    }, [
        backgrounds.currentBGId,
        backgrounds.bgShowMode,
        backgrounds.settings.selectionMethod,
        backgrounds.currentBG?.isSaved,
        backgrounds.currentBG?.source,
    ]);

    const Page = stack[stack.length - 1].content;
    const headerProps = stack[stack.length - 1] && stack[stack.length - 1].header;
    const pageProps = (stack[stack.length - 1] && stack[stack.length - 1].props) || {};

    return (
        <React.Fragment>
            <FabMenu
                onOpenMenu={() => setIsOpen(true)}
                onRefreshBackground={() => {
                    eventToBackground('backgrounds/nextBg');
                }}
                fastSettings={fastSettings}
            />
            <Portal>
                <Backdrop
                    open={isOpen}
                    onClick={handleClose}
                    invisible
                    className={classes.backdrop}
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
        </React.Fragment>
    );
}

export default observer(Menu);
