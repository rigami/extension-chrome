import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    ButtonBase,
    Tooltip,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    ChevronRightRounded as ChevronRightIcon,
    ExpandMoreRounded,
    StarRounded as FavoriteIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { Item, ItemAction } from '@/ui/WorkingSpace/SidePanel/Item';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import SimpleEditor from '@/ui/WorkingSpace/Folders/Editor';
import { useContextActions, useContextEdit } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
    expandIcon: {
        borderRadius: theme.shape.borderRadius,
        padding: 2,
        marginRight: 'auto',
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    disabledExpand: { color: theme.palette.action.disabled },
    favorite: {
        color: theme.palette.favorite.main,
        width: 18,
        height: 18,
        marginLeft: theme.spacing(1),
        marginRight: 'auto',
        padding: theme.spacing(0.25),
        boxSizing: 'content-box',
    },
    folderItem: {
        '&:hover $addSubFolder': { display: 'flex' },
        '&:hover $userActions': { display: 'flex' },
    },
    addSubFolder: { display: 'none' },
    userActions: { display: 'none' },
}));

function FolderItem(props) {
    const {
        id,
        name,
        childExist,
        isDisabled,
        isExpand,
        isSelected,
        level,
        actions,
        onClick,
        onExpandChange,
        onCreateSubFolder,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const rootRef = useRef();
    const workingSpaceService = useWorkingSpaceService();
    const contextActions = useContextActions({
        itemId: id,
        itemType: 'folder',
    });

    const { dispatchEdit, isOpen: isOpenEdit } = useContextEdit();
    const { dispatchContextMenu, isOpen: isOpenContextMenu } = useContextMenuService(contextActions);
    const [isPin, setIsPin] = useState(workingSpaceService.findFavorite({
        itemId: id,
        itemType: 'folder',
    }));

    useEffect(() => {
        setIsPin(workingSpaceService.findFavorite({
            itemId: id,
            itemType: 'folder',
        }));
    }, [workingSpaceService.favorites.length]);

    return (
        <Item
            ref={rootRef}
            level={level}
            disabled={isDisabled}
            selected={isOpenContextMenu || isOpenEdit || isSelected}
            onContextMenu={dispatchContextMenu}
            title={name}
            onClick={() => {
                if (isExpand && isSelected) onExpandChange();
                if (!isExpand) onExpandChange();
                onClick();
            }}
            className={classes.folderItem}
            startAction={childExist && (
                <ButtonBase
                    disabled={isDisabled}
                    className={clsx(classes.expandIcon, isDisabled && classes.disabledExpand)}
                    onClick={onExpandChange}
                    // style={{ marginLeft: level * 8 }}
                >
                    {isExpand ? (<ExpandMoreRounded />) : (<ChevronRightIcon />)}
                </ButtonBase>
            )}
            actions={(
                <React.Fragment>
                    {isPin && (
                        <FavoriteIcon className={classes.favorite} />
                    )}
                    {!isDisabled && onCreateSubFolder && (
                        <Tooltip title={t('button.create', { context: 'sub' })}>
                            <ItemAction
                                className={classes.addSubFolder}
                                onClick={(event) => dispatchEdit({
                                    itemType: 'folder',
                                    parentId: id,
                                    onSave: onCreateSubFolder,
                                }, event)}
                            >
                                <AddIcon />
                            </ItemAction>
                        </Tooltip>
                    )}
                    <Box className={classes.userActions}>
                        {actions && actions({
                            id,
                            name,
                            permanent: false,
                        })}
                    </Box>
                    <Box>
                        {actions && actions({
                            id,
                            name,
                            permanent: true,
                        })}
                    </Box>
                </React.Fragment>
            )}
        />
    );
}

export default observer(FolderItem);
