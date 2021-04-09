import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FolderRounded as FolderIcon, LabelRounded as TagIcon } from '@material-ui/icons';
import clsx from 'clsx';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';

const useStyles = makeStyles((theme) => ({
    root: { width: theme.shape.dataCard.width },
    header: { padding: theme.spacing(2) },
    headerContent: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontFamily: theme.typography.secondaryFontFamily,
        fontWeight: 600,
    },
    active: { backgroundColor: theme.palette.action.selected },
}));

function TagCard(props) {
    const {
        id,
        name,
        color,
        active = false,
        className: externalClassName,
        onClick,
        ...other
    } = props;
    const { t } = useTranslation();
    const classes = useStyles();
    const appService = useAppService();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();

    const contextMenu = (event) => [
        pin({
            itemId: id,
            itemType: 'tag',
            t,
            bookmarksService,
        }),

        edit({
            itemId: id,
            itemType: 'tag',
            t,
            coreService,
            anchorEl: event.currentTarget,
        }),
        remove({
            itemId: id,
            itemType: 'tag',
            t,
            coreService,
        }),
    ];

    return (
        <Card
            variant="outlined"
            className={clsx(classes.root, active && classes.active, externalClassName)}
            {...other}
        >
            <CardActionArea
                onClick={onClick}
                onContextMenu={appService.contextMenu(contextMenu)}
            >
                <CardHeader
                    avatar={<TagIcon style={{ color }} />}
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

export default TagCard;
