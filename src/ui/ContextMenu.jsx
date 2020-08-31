import React from 'react';
import {
    Menu,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles(() => ({ menu: { width: 230 } }));

function ContextMenu({ isOpen, onClose, position, actions = [] }) {
    const classes = useStyles();

    return (
        <Menu
            open={isOpen}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={position}
            classes={{ list: classes.menu }}
        >
            {actions.map((element) => {
                if (element.type === 'divider') {
                    return (
                        <Divider />
                    );
                } else {
                    const Icon = element.icon;

                    return (
                        <ListItem
                            button
                            dense
                            onClick={() => {
                                element.onClick();
                                onClose();
                            }}
                        >
                            <ListItemIcon>
                                <Icon />
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
