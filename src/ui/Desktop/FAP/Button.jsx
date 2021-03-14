import React, { useRef } from 'react';
import { ButtonBase, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useTranslation } from 'react-i18next';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';

const useStyles = makeStyles((theme) => ({ root: { borderRadius: theme.shape.borderRadiusBold } }));

function FAPButton(props) {
    const {
        id,
        tooltip,
        type = 'bookmark',
        children,
        disableEdit = false,
        disableRemove = false,
        className: externalClassName,
        ...other
    } = props;
    const ref = useRef();
    const classes = useStyles();
    const appService = useAppService();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();

    const contextMenu = () => [
        pin({
            itemId: id,
            itemType: type,
            t,
            bookmarksService,
        }),
        !disableEdit && edit({
            itemId: id,
            itemType: type,
            t,
            coreService,
            anchorEl: ref.current,
        }),
        !disableRemove && remove({
            itemId: id,
            itemType: type,
            t,
            coreService,
        }),
    ];

    return (
        <Tooltip
            title={tooltip}
            enterDelay={400}
            enterNextDelay={400}
        >
            <ButtonBase
                ref={ref}
                className={clsx(
                    classes.root,
                    externalClassName,
                )}
                onContextMenu={appService.contextMenu(contextMenu)}
                {...other}
            >
                {children}
            </ButtonBase>
        </Tooltip>
    );
}

export default observer(FAPButton);
