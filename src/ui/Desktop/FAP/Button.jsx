import React, { useRef } from 'react';
import { ButtonBase, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useContextMenuService } from '@/stores/app/contextMenu';

const useStyles = makeStyles((theme) => ({ root: { borderRadius: theme.shape.borderRadiusBold } }));

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
    const { dispatchContextMenu } = useContextMenuService((event, baseContextMenu) => baseContextMenu({
        itemId: id,
        itemType: type,
    }));

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
                onContextMenu={dispatchContextMenu}
                {...other}
            >
                {children}
            </ButtonBase>
        </Tooltip>
    );
}

export default observer(FAPButton);
