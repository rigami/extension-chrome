import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { useContextActions } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
    root: {
        width: theme.shape.dataCard.width,
        borderRadius: theme.shape.borderRadiusButton,
    },
    header: { padding: theme.spacing(2) },
    headerContent: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: 600,
    },
    active: { backgroundColor: theme.palette.action.selected },
    subFolder: { padding: theme.spacing(1.5, 2) },
    subFolderIcon: {
        alignItems: 'center',
        display: 'flex',
    },
}));

function FolderCard(props) {
    const {
        id,
        name,
        active = false,
        className: externalClassName,
        onClick,
        ...other
    } = props;
    const classes = useStyles();
    const contextActions = useContextActions({
        itemId: id,
        itemType: 'folder',
    });
    const { dispatchContextMenu } = useContextMenuService(contextActions);

    return (
        <Card
            variant="outlined"
            className={clsx(classes.root, active && classes.active, externalClassName)}
            {...other}
        >
            <CardActionArea
                onClick={onClick}
                onContextMenu={dispatchContextMenu}
            >
                <CardHeader
                    avatar={<FolderIcon />}
                    title={name}
                    classes={{
                        root: clsx(classes.header, classes.subFolder),
                        content: classes.headerContent,
                        title: classes.title,
                        avatar: classes.subFolderIcon,
                    }}
                />
            </CardActionArea>
        </Card>
    );
}

export default FolderCard;
