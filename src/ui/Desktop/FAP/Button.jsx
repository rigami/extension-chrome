import React, { useRef } from 'react';
import { ButtonBase, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { useContextActions } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
    root: { borderRadius: theme.shape.borderRadiusBold },
    selected: { backgroundColor: theme.palette.action.selected },
}));

function FAPButton(props) {
    const {
        id,
        tooltip,
        type = 'bookmark',
        children,
        className: externalClassName,
        ...other
    } = props;
    const ref = useRef();
    const classes = useStyles();
    const contextActions = useContextActions({
        itemId: id,
        itemType: type,
    });
    const { dispatchContextMenu, isOpen } = useContextMenuService(contextActions);

    return (
        <Tooltip
            title={tooltip}
            enterDelay={0}
            enterNextDelay={0}
        >
            <ButtonBase
                ref={ref}
                className={clsx(
                    classes.root,
                    externalClassName,
                    isOpen && classes.selected,
                )}
                onContextMenu={dispatchContextMenu}
                {...other}
            >
                {children}
            </ButtonBase>
        </Tooltip>
    );
}

export default observer(FAPButton);
