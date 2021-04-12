import React, { useEffect } from 'react';
import {
    Box,
    Breadcrumbs, Button,
    Link,
    Typography,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 42,
        display: 'flex',
        alignItems: 'center',
    },
    buttonLabel: { fontWeight: 'inherit' },
    middle: {
        textTransform: 'none',
        color: theme.palette.text.secondary,
        fontWeight: 600,
        padding: theme.spacing(0.5, 1),
        fontSize: theme.typography.body1.fontSize,
        letterSpacing: 'unset',
    },
    last: {
        textTransform: 'none',
        color: theme.palette.text.primary,
        fontWeight: 600,
        padding: theme.spacing(0.5, 1),
        fontSize: theme.typography.body1.fontSize,
        letterSpacing: 'unset',
    },
}));

function FolderBreadcrumbs({ folderId, lastClickable = false, onSelectFolder, className: externalClassName }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        path: null,
        pathState: FETCH.WAIT,
    }));

    useEffect(() => {
        if (folderId === null) {
            store.path = null;
            store.pathState = FETCH.WAIT;
            return;
        }

        store.pathState = FETCH.PENDING;

        FoldersUniversalService.getPath(folderId)
            .then((path) => {
                console.log('getPath:', folderId, path);
                store.path = path;
                store.pathState = FETCH.DONE;
            });
    }, [folderId, bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            <Breadcrumbs>
                {store.path && store.path.map((folder, index) => (index === store.path.length - 1 ? (
                    <React.Fragment>
                        {lastClickable ? (
                            <Button
                                key={folder.id}
                                className={classes.last}
                                classes={{ label: classes.buttonLabel }}
                                endIcon={(<GoToIcon />)}
                                onClick={() => {
                                    if (onSelectFolder) onSelectFolder(folder.id);
                                }}
                            >
                                {folder.name}
                            </Button>
                        ) : (
                            <Typography
                                key={folder.id}
                                className={classes.last}
                            >
                                {folder.name}
                            </Typography>
                        )}
                    </React.Fragment>
                ) : (
                    <Button
                        key={folder.id}
                        className={classes.middle}
                        classes={{ label: classes.buttonLabel }}
                        onClick={() => {
                            if (onSelectFolder) onSelectFolder(folder.id);
                        }}
                    >
                        {folder.name}
                    </Button>
                )))}
            </Breadcrumbs>
        </Box>
    );
}

export default observer(FolderBreadcrumbs);
