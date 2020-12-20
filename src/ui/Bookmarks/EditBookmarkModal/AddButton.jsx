import React from 'react';
import {
    Zoom,
    Fab,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import useAppService from '@/stores/app/AppStateProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
        pointerEvents: 'all',
    },
    fabIcon: { marginRight: theme.spacing(1) },
}));

function AddBookmarkButton() {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const appService = useAppService();

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    const handleOpen = () => {
        coreService.localEventBus.call('bookmark/create');
    };

    return (
        <React.Fragment>
            <Zoom
                in={appService.activity === 'bookmarks'}
                timeout={transitionDuration}
                style={{ transitionDelay: 0 }}
                unmountOnExit
            >
                <Fab
                    className={classes.fab}
                    color="primary"
                    variant="extended"
                    onClick={handleOpen}
                >
                    <AddIcon className={classes.fabIcon} />
                    {t('bookmark.addShort')}
                </Fab>
            </Zoom>
        </React.Fragment>
    );
}

export default observer(AddBookmarkButton);
