import React, { useState, useEffect } from 'react';
import {
    Drawer,
    List,
    Divider,
} from '@material-ui/core';
import {
    PauseRounded as PauseIcon,
    PlayArrowRounded as PlayIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { BG_SELECT_MODE, BG_TYPE } from '@/enum';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
import Header from '@/ui/Menu/PageHeader';
import { useTranslation } from 'react-i18next';
import HomePage, { header as homePageHeader } from './Settings';
import FabMenu from './FabMenu';

const useStyles = makeStyles((theme) => ({
    list: {
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    divider: {
        backgroundColor: fade(theme.palette.common.white, 0.12),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    description: { color: theme.palette.text.secondary },
}));

function Menu({ }) {
    const backgroundsStore = useBackgroundsService();
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
        if (backgroundsStore.currentBGId && backgroundsStore.getCurrentBG().type === BG_TYPE.VIDEO) {
            if (backgroundsStore.bgState === 'play') {
                setFastSettings([
                    {
                        tooltip: (
                            <React.Fragment>
                                <b>{t('bg.pauseVideo')}</b>
                                <Divider className={classes.divider} />
                                {t('bg.pauseVideoDescription')}
                            </React.Fragment>
                        ),
                        onClick: () => backgroundsStore.eventBus.dispatch('pausebg'),
                        icon: <PauseIcon />,
                    },
                ]);
            } else {
                setFastSettings([
                    {
                        tooltip: t('bg.playVideo'),
                        onClick: () => backgroundsStore.eventBus.dispatch('playbg'),
                        icon: <PlayIcon />,
                    },
                ]);
            }
        } else {
            setFastSettings([]);
        }
    }, [backgroundsStore.currentBGId, backgroundsStore.bgState]);

    const Page = stack[stack.length - 1].content;
    const headerProps = stack[stack.length - 1] && stack[stack.length - 1].header;

    return (
        <React.Fragment>
            <FabMenu
                onOpenMenu={() => setIsOpen(true)}
                onRefreshBackground={() => {
                    backgroundsStore.nextBG();
                }}
                fastSettings={fastSettings}
                useChangeBG={backgroundsStore.selectionMethod === BG_SELECT_MODE.RANDOM}
            />
            <Drawer
                anchor="right"
                open={isOpen}
                onClose={() => handleClose()}
                disableEnforceFocus
            >
                <List disablePadding className={classes.list}>
                    <Header onBack={handleBack} {...headerProps} />
                    <Page
                        onClose={handleBack}
                        onSelect={(page) => setStack([...stack, page])}
                    />
                </List>
            </Drawer>
        </React.Fragment>
    );
}

export default observer(Menu);
