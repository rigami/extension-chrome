import React, { useRef } from 'react';
import { ButtonBase, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import useContextMenu from '@/stores/app/ContextMenuProvider';

const useStyles = makeStyles((theme) => ({ root: { borderRadius: theme.shape.borderRadiusBold } }));

function FAPButton(props) {
    const {
        id,
        tooltip,
        type = 'bookmark',
        children,
        disableMove = false,
        disableRemove = false,
        className: externalClassName,
        ...other
    } = props;
    const ref = useRef();
    const classes = useStyles();
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: type,
        disableMove,
        disableRemove,
    });

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
                )}
                onContextMenu={contextMenu}
                {...other}
            >
                {children}
            </ButtonBase>
        </Tooltip>
    );
}

export default observer(FAPButton);
