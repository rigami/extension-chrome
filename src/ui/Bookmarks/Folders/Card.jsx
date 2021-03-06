import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import clsx from 'clsx';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';

const useStyles = makeStyles((theme) => ({
    root: { width: 180 },
    header: { padding: theme.spacing(1, 2) },
    headerContent: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}));

function FolderCard({ id, name, className: externalClassName, ...other }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const appService = useAppService();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();

    const contextMenu = (event) => [
        pin({
            itemId: id,
            itemType: 'folder',
            t,
            bookmarksService,
        }),

        edit({
            itemId: id,
            itemType: 'folder',
            t,
            coreService,
            anchorEl: event.currentTarget,
        }),
        remove({
            itemId: id,
            itemType: 'folder',
            t,
            coreService,
        }),
    ];

    return (
        <Card variant="outlined" className={clsx(classes.root, externalClassName)} {...other}>
            <CardActionArea onContextMenu={appService.contextMenu(contextMenu)}>
                <CardHeader
                    avatar={<FolderIcon />}
                    title={name}
                    classes={{
                        root: classes.header,
                        content: classes.headerContent,
                        title: classes.title,
                    }}
                />
            </CardActionArea>
        </Card>
    );
}

export default FolderCard;
