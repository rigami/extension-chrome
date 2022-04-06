import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    ClickAwayListener,
    Dialog,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import FullSearch from '@/ui/Search/FullSearch';
import { useSearchService } from '@/ui/WorkingSpace/searchProvider';
import { useCoreService } from '@/stores/app/core';
import Scrollbar from '@/ui-components/CustomScroll';
import { useHotKeysService } from '@/stores/app/hotKeys';
import { useAppStateService } from '@/stores/app/appState';

const useStyles = makeStyles((theme) => ({
    dialog: {
        alignItems: 'flex-start',
        width: '100%',
    },
    paper: {
        width: '100%',
        height: '100%',
        background: 'none',
        maxWidth: '100%',
        margin: 0,
        maxHeight: '100%',
        borderRadius: 0,
    },
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: '24vh',
        paddingBottom: theme.spacing(3),
    },
}));

function Search() {
    const classes = useStyles();
    const appStateService = useAppStateService();
    const coreService = useCoreService();
    const searchService = useSearchService();
    const hotKeysService = useHotKeysService();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const busListener = coreService.localEventBus.on('search', () => {
            setIsOpen(true);
        });

        const hotKeysListeners = [];

        if (appStateService.settings.searchRunOnAnyKey) {
            hotKeysListeners.push(hotKeysService.on(['*'], (combination) => {
                if (
                    combination.length !== 1
                    || (
                        combination[0].indexOf('Key') === -1
                        && combination[0].indexOf('Digit') === -1
                    )
                ) return;

                setIsOpen(true);
            }));
        } else {
            hotKeysListeners.push(hotKeysService.on(['ControlLeft', 'KeyQ'], () => {
                setIsOpen(true);
            }));
        }

        return () => {
            coreService.localEventBus.removeListener(busListener);
            hotKeysListeners.forEach((listener) => hotKeysService.removeListener(listener));
        };
    }, [appStateService.settings.searchRunOnAnyKey]);

    const handleClose = (event) => {
        if (event && event.path.find((elem) => (
            elem.dataset?.role === 'contextmenu'
            || elem.dataset?.role === 'dialog'
        ))) return;

        setIsOpen(false);
    };

    return (
        <Dialog
            open={isOpen}
            classes={{
                container: classes.dialog,
                paper: classes.paper,
            }}
            onClose={handleClose}
        >
            <Scrollbar>
                <Container
                    maxWidth="sm"
                    className={classes.container}
                >
                    <ClickAwayListener onClickAway={handleClose}>
                        <Paper>
                            <FullSearch
                                onClose={(apply) => {
                                    handleClose();
                                    if (apply) searchService.applyChanges();
                                    else searchService.resetChanges();
                                }}
                            />
                        </Paper>
                    </ClickAwayListener>
                </Container>
            </Scrollbar>
        </Dialog>
    );
}

export default observer(Search);
