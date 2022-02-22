import React, { useEffect, useState } from 'react';
import {
    Menu,
    ListItem,
    ListItemText,
    Divider,
} from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import SelectItem from './SelectItem';
import DefaultItem from './DefaultItem';

const useStyles = makeStyles((theme) => ({
    menu: {
        width: 230,
        padding: theme.spacing(0.625, 0),
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
    paper: {
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(35px) brightness(110%) contrast(1.2)',
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
}));

function ContextMenu({ service }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const [, setForceRender] = useState(0);

    useEffect(() => {
        if (!service.menu || !service.isOpen || !Array.isArray(service.menu.reactions)) return;

        service.menu.reactions.forEach((rule) => {
            reaction(rule, () => {
                setForceRender((old) => (old > 10 ? 0 : old + 1));
            });
        });
    }, [service.menu?.reactions?.length]);

    if (!service.menu?.actions) return null;

    const calcActions = service.menu?.actions().filter(Boolean);

    return (
        <Menu
            data-role="contextmenu"
            open={service.isOpen}
            onClose={service.close}
            anchorReference="anchorPosition"
            anchorPosition={service.menu?.position}
            classes={{ list: clsx(classes.menu, service.menu?.classes?.root) }}
            onContextMenu={(event) => {
                event.preventDefault();
                service.close();
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
                        } else if (element.type === 'select') {
                            return (
                                <SelectItem
                                    key={element.title}
                                    {...element}
                                    classes={service.menu?.classes}
                                    service={service}
                                />
                            );
                        } else {
                            return (
                                <DefaultItem
                                    key={element.title}
                                    {...element}
                                    classes={service.menu?.classes}
                                    service={service}
                                />
                            );
                        }
                    }),
                ]
            ))}
        </Menu>
    );
}

export default observer(ContextMenu);
