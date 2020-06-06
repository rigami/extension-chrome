import React, { useState } from 'react';
import {
    Zoom,
    Fab,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CreateBookmarkModal from '@/ui/Bookmarks/CreateBookmarkButton/DrawerCreator';
import { useService as useAppService } from '@/stores/app';

const useStyles = makeStyles((theme) => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
    },
    fabIcon: { marginRight: theme.spacing(1) },
}));

function CreateBookmarkButton() {
    const theme = useTheme();
    const classes = useStyles();
    const appService = useAppService();
    const [isOpen, setIsOpen] = useState(false);

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
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
                    onClick={() => setIsOpen(true)}
                >
                    <AddIcon className={classes.fabIcon} />
                    Добавить закладку
                </Fab>
            </Zoom>
            <CreateBookmarkModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </React.Fragment>
    );
}

export default observer(CreateBookmarkButton);
