import React, { useEffect } from 'react';
import {
    Box,
    Breadcrumbs,
    Button,
    Typography,
    IconButton,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowForward as GoToIcon, HomeRounded as HomeIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { NULL_UUID } from '@/utils/generate/uuid';

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
        minWidth: 'unset',
    },
    breadcrumbsRoot: { width: '100%' },
    ol: {
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'row',
        width: 'inherit',
        flexWrap: 'nowrap',
    },
    li: {
        overflow: 'auto',
        width: 'auto',
        flexShrink: 1,
    },
    separator: {
        marginLeft: theme.spacing(0.25),
        marginRight: theme.spacing(0.25),
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
        showRoot = false,
        lastClickable = false,
        maxItems = 2,
        className: externalClassName,
        classes: externalClasses = {},
        onSelectFolder,
        ...other
    } = props;
    const classes = useStyles();
    const workingSpaceService = useWorkingSpaceService();
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
    }, [folderId, workingSpaceService.lastTruthSearchTimestamp]);

    return (
        <Box className={clsx(classes.root, externalClassName, externalClasses.root)} {...other}>
            <Breadcrumbs
                maxItems={maxItems}
                classes={{
                    root: classes.breadcrumbsRoot,
                    ol: classes.ol,
                    li: classes.li,
                    separator: classes.separator,
                }}
            >
                {showRoot && (
                    <IconButton
                        onClick={() => {
                            if (onSelectFolder) onSelectFolder(NULL_UUID);
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                )}
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
