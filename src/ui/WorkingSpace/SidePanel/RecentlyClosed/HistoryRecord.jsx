import React from 'react';
import { Avatar, Tooltip } from '@material-ui/core';
import { AddRounded as AddIcon, PublicRounded as WebSiteIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import copyToClipboard from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { getFaviconUrl } from '@/utils/localSiteParse';
import { Item, ItemAction } from '@/ui/WorkingSpace/SidePanel/Item';
import { useContextEdit } from '@/stores/app/contextActions';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon, ContentCopyFilled as CopyToClipboardIcon } from '@/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(1),
        '&:hover $action': { display: 'flex' },
    },
    favicon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
    action: { display: 'none' },
    forceShow: { display: 'flex' },
}));

function HistoryRecord({ sessionId, url, favIconUrl, title }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const { dispatchEdit, isOpen: isOpenEdit } = useContextEdit();
    const { dispatchContextMenu, isOpen: isOpenContext } = useContextMenuService((event, position, next) => [
        new ContextMenuItem({
            title: t('bookmark:button.add', { context: 'short' }),
            icon: AddBookmarkIcon,
            onClick: () => dispatchEdit({
                itemType: 'bookmark',
                defaultUrl: url,
                defaultName: title,
            }, event, position, next),
        }),
        new ContextMenuItem({
            title: t('bookmark:button.copyUrl'),
            icon: CopyToClipboardIcon,
            onClick: () => copyToClipboard(url),
        }),
    ]);

    return (
        <Item
            button
            onClick={() => { chrome.sessions.restore(sessionId); }}
            icon={(
                <Avatar
                    variant="rounded"
                    src={favIconUrl || getFaviconUrl(url)}
                    className={classes.favicon}
                >
                    <WebSiteIcon />
                </Avatar>
            )}
            title={title || url || 'Unknown tab'}
            level={null}
            className={classes.root}
            selected={isOpenEdit || isOpenContext}
            onContextMenu={dispatchContextMenu}
            actions={(
                <Tooltip title={t('bookmark:button.add', { context: 'short' })}>
                    <ItemAction
                        className={clsx(classes.action, isOpenEdit && classes.forceShow)}
                        onClick={(event) => dispatchEdit({
                            itemType: 'bookmark',
                            defaultUrl: url,
                            defaultName: title,
                        }, event)}
                    >
                        <AddIcon />
                    </ItemAction>
                </Tooltip>
            )}
        />
    );
}

export default observer(HistoryRecord);
