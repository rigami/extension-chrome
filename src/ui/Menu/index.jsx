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
import { BG_SELECT_MODE, BG_TYPE } from '@/dict';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
import HomePage from './Settings';
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

    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [stack, setStack] = useState([HomePage]);
    const [fastSettings, setFastSettings] = useState([]);

    const handleClose = () => {
        setStack([HomePage]);
        setIsOpen(false);
    };

    useEffect(() => {
        if (backgroundsStore.currentBGId && backgroundsStore.getCurrentBG().type === BG_TYPE.VIDEO) {
            if (backgroundsStore.bgState === 'play') {
                setFastSettings([
                    {
                        tooltip: (
                            <React.Fragment>
                                <b>Остановить видео</b>
                                <Divider className={classes.divider} />
                                Живые обой это красиво, но они потребляют больше энергии чем статическое изображения.
                                Для сбережения энергии можно остановить видео
                            </React.Fragment>
                        ),
                        onClick: () => backgroundsStore.pause(),
                        icon: <PauseIcon />,
                    },
                ]);
            } else {
                setFastSettings([
                    {
                        tooltip: 'Воспроизвести видео',
                        onClick: () => backgroundsStore.play(),
                        icon: <PlayIcon />,
                    },
                ]);
            }
        } else {
            setFastSettings([]);
        }
    }, [backgroundsStore.currentBGId, backgroundsStore.bgState]);

    const Page = stack[stack.length - 1];

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
                    <Page
                        onClose={() => {
                            if (stack.length === 1) {
                                handleClose();
                            } else {
                                setStack(stack.slice(0, stack.length - 1));
                            }
                        }}
                        onSelect={(page) => setStack([...stack, page])}
                    />
                </List>
            </Drawer>
        </React.Fragment>
    );
}

export default observer(Menu);
