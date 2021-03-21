import React, { useEffect, useState } from 'react';
import {
    Menu,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useTranslation } from 'react-i18next';
import useCoreService from '@/stores/app/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    menu: { width: 230 },
    emptyMenu: {
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
    },
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

function ContextMenu() {
    const { t } = useTranslation();
    const classes = useStyles();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        position: null,
        actions: [],
        reactions: [],
    }));
    const [, setForceRender] = useState(0);

    useEffect(() => {
        const listenId = coreService.localEventBus.on('system/contextMenu', (props) => {
            if (store.position) return;

            store.position = props.position;
            store.actions = props.actions;
            store.reactions = props.reactions || [];
        });

        return () => coreService.localEventBus.removeListener(listenId);
    }, []);

    useEffect(() => {
        store.reactions.forEach((rule) => {
            reaction(rule, () => {
                setForceRender((old) => (old > 10 ? 0 : old + 1));
            });
        });
    }, [store.reactions.length]);

    const calcActions = typeof store.actions === 'function' ? store.actions() : store.actions;

    return (
        <Menu
            open={store.position !== null}
            onClose={() => {
                store.position = null;
            }}
            anchorReference="anchorPosition"
            anchorPosition={store.position}
            classes={{ list: classes.menu }}
            onContextMenu={(event) => {
                event.preventDefault();
                store.position = null;
            }}
        >
            {calcActions.length === 0 && (
                <ListItem
                    dense
                    disabled
                    className={classes.emptyMenu}
                >
                    <ListItemText primary={t('contextMenu.empty')} />
                </ListItem>
            )}
            {calcActions.map((element) => {
                if (element.type === 'divider') {
                    return (
                        <Divider key="divider" className={classes.divider} />
                    );
                } else {
                    const Icon = element.icon;

                    return (
                        <ListItem
                            key={element.title}
                            button
                            dense
                            disabled={element.disabled}
                            onClick={() => {
                                element.onClick();
                                store.position = null;
                            }}
                        >
                            <ListItemIcon>
                                <Icon {...element.iconProps} />
                            </ListItemIcon>
                            <ListItemText primary={element.title} secondary={element.description} />
                        </ListItem>
                    );
                }
            })}
        </Menu>
    );
}

export default observer(ContextMenu);
