import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 180,
    },
    header: {
        padding: theme.spacing(1, 2),
    },
    headerContent: {
        overflow: 'hidden',
    },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}));

function FolderCard({ name, className: externalClassName, ...other }) {
    const classes = useStyles();

    return (
        <Card variant="outlined" className={clsx(classes.root, externalClassName)} {...other}>
            <CardActionArea>
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
