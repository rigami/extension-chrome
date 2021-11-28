import React, { useEffect } from 'react';
import {
    Box,
    Breadcrumbs,
    Button,
    Typography,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import useBookmarksService from '@/stores/app/BookmarksProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: 36,
        display: 'flex',
        alignItems: 'center',
    },
    middle: {
        textTransform: 'none',
        color: theme.palette.text.secondary,
        fontWeight: 600,
        padding: theme.spacing(0.5, 1),
        fontSize: theme.typography.button.fontSize,
        letterSpacing: 'unset',
    },
    last: {
        textTransform: 'none',
        color: theme.palette.text.primary,
        fontWeight: 600,
        padding: theme.spacing(0.5, 1),
        fontSize: theme.typography.button.fontSize,
        letterSpacing: 'unset',
    },
    overflow: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
    },
    breadcrumbsRoot: { width: '100%' },
    ol: {
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'row',
        width: 'inherit',
    },
    li: {
        overflow: 'auto',
        width: 'auto',
        flexShrink: 1,
    },
    label: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        display: 'block',
    },
    icon: {
        display: 'inline-flex',
        verticalAlign: 'sub',
    },
}));

function FolderBreadcrumbs(props) {
    const {
        folderId,
        lastClickable = false,
        className: externalClassName,
        classes: externalClasses = {},
        onSelectFolder,
    } = props;
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
                store.path = path;
                store.pathState = FETCH.DONE;
            });
    }, [folderId, bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Box className={clsx(classes.root, externalClassName, externalClasses.root)}>
            <Breadcrumbs
                maxItems={2}
                classes={{
                    root: classes.breadcrumbsRoot,
                    ol: classes.ol,
                    li: classes.li,
                }}
            >
                {store.path && store.path.map((folder, index) => (index === store.path.length - 1 ? (
                    lastClickable ? (
                        <Button
                            key={folder.id}
                            classes={{
                                root: clsx(classes.overflow, classes.last, externalClasses.last),
                                label: classes.label,
                                endIcon: classes.icon,
                            }}
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
                            className={clsx(classes.overflow, classes.last, externalClasses.last)}
                        >
                            {folder.name}
                        </Typography>
                    )
                ) : (
                    <Button
                        key={folder.id}
                        classes={{
                            root: clsx(classes.overflow, classes.middle),
                            label: classes.label,
                        }}
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
