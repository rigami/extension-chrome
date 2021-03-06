import React, { useEffect, useState } from 'react';
import {
    Menu,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    menu: { width: 230 },
    emptyMenu: {
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
    },
}));

function ContextMenu(props) {
    const {
        isOpen,
        onClose,
        position,
        actions = [],
        reactions = [],
    } = props;
    const { t } = useTranslation();
    const classes = useStyles();
    const [, setForceRender] = useState(0);

    console.log('reactions:', reactions);

    useEffect(() => {
        reactions.forEach((rule) => {
            reaction(rule, () => {
                console.log('Reaction:', rule);
                setForceRender((old) => (old > 10 ? 0 : old + 1));
            });
        });
    }, [reactions.length]);

    const calcActions = typeof actions === 'function' ? actions() : actions;

    return (
        <Menu
            open={isOpen}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={position}
            classes={{ list: classes.menu }}
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
                        <Divider key="divider" />
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
                                onClose();
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
