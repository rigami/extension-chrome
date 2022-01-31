import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import clsx from 'clsx';
import useContextMenu from '@/stores/app/ContextMenuProvider';

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
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: 600,
    },
    active: { backgroundColor: theme.palette.action.selected },
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
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: 'folder',
    });

    return (
        <Card
            variant="outlined"
            className={clsx(classes.root, active && classes.active, externalClassName)}
            {...other}
        >
            <CardActionArea
                onClick={onClick}
                onContextMenu={contextMenu}
            >
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
