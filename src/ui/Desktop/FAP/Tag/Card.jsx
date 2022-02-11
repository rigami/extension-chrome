import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LabelRounded as TagIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { useContextMenu } from '@/stores/app/ContextMenuProvider';

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
    const classes = useStyles();
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: 'tag',
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
