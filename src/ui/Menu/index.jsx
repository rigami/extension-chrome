import React, { useState, useEffect } from 'react';
import {
    Drawer,
    List,
    Divider,
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
import HomePage, { header as homePageHeader } from './Settings';
import FabMenu from './FabMenu';
import Scrollbar from '@/ui-components/CustomScroll';
import { eventToBackground } from '@/stores/server/bus';
import useAppStateService from '@/stores/app/AppStateProvider';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';

const useStyles = makeStyles((theme) => ({
    list: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    divider: {
        backgroundColor: fade(theme.palette.common.white, 0.12),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    description: { color: theme.palette.text.secondary },
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

        if (backgrounds.currentBG.type === BG_TYPE.VIDEO && backgrounds.bgMode === BG_SHOW_MODE.LIVE) {
            settings.push({
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

        if (backgrounds.currentBG.type !== BG_TYPE.VIDEO && backgrounds.bgMode === BG_SHOW_MODE.STATIC) {
            settings.push({
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
                tooltip: t('bg.addedToLibrary'),
                icon: <AddedIcon />,
                disableRipple: true,
            });
        }

        setFastSettings(settings);
    }, [
        backgrounds.currentBGId,
        backgrounds.bgMode,
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
            <Drawer
                anchor="right"
                open={isOpen}
                onClose={() => handleClose()}
                disableEnforceFocus
                PaperProps={{
                    style: {
                        width: pageProps.width || 520,
                    }
                }}
            >
                <Scrollbar>
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
            </Drawer>
        </React.Fragment>
    );
}

export default observer(Menu);
