import React, { Fragment, useEffect, useState } from 'react';
import {
    Menu,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    ListItemSecondaryAction,
    Box,
} from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    menu: {
        width: 230,
        padding: theme.spacing(0.5, 0),
        boxShadow: `inset 0px 0px 0px 1px ${theme.palette.divider}`,
        borderRadius: 'inherit',
    },
    emptyMenu: {
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
    },
    divider: {
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    item: {
        padding: theme.spacing(0.5, 1.5),
        margin: theme.spacing(0, 0.5),
        width: `calc(100% - ${theme.spacing(1)}px)`,
        borderRadius: theme.shape.borderRadiusButton,
    },
    icon: {
        minWidth: 22 + 12,
        display: 'flex',
        alignItems: 'center',
        '& svg': {
            width: 22,
            height: 22,
        },
    },
    secondaryAction: {
        justifyContent: 'flex-end',
        display: 'flex',
        alignItems: 'center',
        justifySelf: 'center',
        position: 'relative',
        right: 'unset',
        top: 'unset',
        transform: 'unset',
        flexShrink: 0,
        flexGrow: 1,
        paddingLeft: theme.spacing(1),
        // paddingRight: theme.spacing(2),
    },
    itemContainer: { display: 'flex' },
    itemHelper: {
        display: 'flex',
        width: '100%',
    },
    paper: {
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(35px) brightness(110%) contrast(1.2)',
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
}));

function ContextMenu({ service }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const store = useLocalObservable(() => ({
        position: null,
        actions: null,
        reactions: [],
        userClassName: null,
    }));
    const [, setForceRender] = useState(0);

    useEffect(() => {
        if (!service.activeItem) return;

        store.position = service.activeItem.position;
        store.actions = service.activeItem.actions;
        store.reactions = service.activeItem.reactions || [];
        store.userClassName = service.activeItem.className;
    }, [service.activeItem]);

    useEffect(() => {
        store.reactions.forEach((rule) => {
            reaction(rule, () => {
                setForceRender((old) => (old > 10 ? 0 : old + 1));
            });
        });
    }, [store.reactions.length]);

    useEffect(() => {
        if (store.position) service.handleOpen();
    }, [store.position]);

    if (!store.actions) return null;

    const calcActions = store.actions().filter(Boolean);

    return (
        <Menu
            data-role="contextmenu"
            open={store.position !== null}
            onClose={() => {
                store.position = null;
                service.handleClose();
            }}
            anchorReference="anchorPosition"
            anchorPosition={store.position}
            classes={{ list: clsx(classes.menu, store.userClassName) }}
            onContextMenu={(event) => {
                event.preventDefault();
                store.position = null;
                service.handleClose();
            }}
            elevation={18}
            PaperProps={{ className: classes.paper }}
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
            {calcActions.map((group, index) => (
                [
                    index !== 0 && (<Divider key="divider" className={classes.divider} />),
                    group.map((element) => {
                        if (element.type === 'divider') {
                            return (
                                <Divider key="divider" className={classes.divider} />
                            );
                        } else if (element.type === 'customItem') {
                            return element.render();
                        } else {
                            const Icon = element.icon;

                            return (
                                <ListItem
                                    classes={{ container: classes.itemContainer }}
                                    className={classes.item}
                                    key={element.title}
                                    button={element.onClick}
                                    dense
                                    disabled={element.disabled}
                                    onClick={async () => {
                                        const result = await element.onClick(() => {
                                            store.position = null;
                                            service.handleClose();
                                        });

                                        if (!result) {
                                            store.position = null;
                                            service.handleClose();
                                        }
                                    }}
                                >
                                    <Box className={classes.itemHelper}>
                                        <ListItemIcon className={classes.icon}>
                                            {Icon && (<Icon {...element.iconProps} />)}
                                        </ListItemIcon>
                                        <ListItemText primary={element.title} secondary={element.description} />
                                        {element.action && (
                                            <ListItemSecondaryAction className={classes.secondaryAction}>
                                                {element.action}
                                            </ListItemSecondaryAction>
                                        )}
                                    </Box>
                                </ListItem>
                            );
                        }
                    }),
                ]
            ))}
        </Menu>
    );
}

export default observer(ContextMenu);
