import React, { useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import {
    FolderRounded as FolderIcon,
    ArrowForward as GoToIcon,
    MoreVertRounded as ContextMenuIcon,
} from '@material-ui/icons';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { FETCH } from '@/enum';
import asyncAction from '@/utils/helpers/asyncAction';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import BookmarksViewer from '@/ui/WorkingSpace/BookmarksViewer';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { useContextActions } from '@/stores/app/contextActions';
import { useNavigationService } from '@/stores/app/navigation';

const useStyles = makeStyles((theme) => ({
    folderContainer: {
        marginBottom: theme.spacing(12),
        paddingLeft: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        flexDirection: 'column',
        '&:hover $icon': { opacity: 1 },
        '&:hover $contextMenuButton': { opacity: 1 },
    },
    containerActive: { backgroundColor: theme.palette.action.selected },
    header: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(2, 0),
    },
    childFolders: {
        gridTemplateColumns: `repeat(auto-fit, ${theme.shape.dataCard.width}px)`,
        display: 'grid',
        gridGap: theme.spacing(0.5, 2),
        paddingBottom: theme.spacing(1),
    },
    childFolderContainer: { width: theme.shape.dataCard.width },
    childFolderBtnLabel: { fontWeight: 600 },
    childFolder: {
        width: 'fit-content',
        maxWidth: '100%',
        margin: theme.spacing(1),
        marginLeft: theme.spacing(-1),
    },
    middle: {
        textTransform: 'none',
        color: theme.palette.text.secondary,
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
    label: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        display: 'block',
    },
    last: {
        textTransform: 'none',
        color: theme.palette.text.primary,
        fontWeight: 600,
        padding: theme.spacing(0.5, 1),
        fontSize: theme.typography.body1.fontSize,
        letterSpacing: 'unset',
        marginLeft: theme.spacing(-1),
    },
    icon: {
        opacity: 0,
        display: 'inline-flex',
        verticalAlign: 'sub',
    },
    contextMenuButton: {
        opacity: 0,
        marginLeft: 'auto',
        flexShrink: 0,
        alignSelf: 'center',
        marginRight: theme.spacing(2),
    },
    forceShowIcon: { opacity: 1 },
}));

function SubFolder({ id, name }) {
    const classes = useStyles();
    const navigationService = useNavigationService();
    const contextActions = useContextActions({
        itemId: id,
        itemType: 'folder',
    });
    const { dispatchContextMenu, isOpen } = useContextMenuService(contextActions);

    return (
        <ExtendButtonGroup key={id} className={clsx(classes.childFolder, isOpen && classes.containerActive)}>
            <ExtendButton
                label={name}
                onClick={() => navigationService.setFolder(id)}
                icon={() => <FolderIcon />}
                onContextMenu={dispatchContextMenu}
                unwrap
            />
        </ExtendButtonGroup>
    );
}

function Folder({ data, columns }) {
    const theme = useTheme();
    const classes = useStyles();
    const navigationService = useNavigationService();
    const { t } = useTranslation(['bookmark']);
    const contextActions = useContextActions({
        itemId: data.id,
        itemType: 'folder',
    });
    const { dispatchContextMenu, isOpen } = useContextMenuService(contextActions);

    return (
        <Box
            className={clsx(classes.folderContainer, isOpen && classes.containerActive)}
            style={{ width: columns * (theme.shape.dataCard.width + 16) + 16 }}
            onContextMenu={dispatchContextMenu}
        >
            <Box className={classes.header}>
                <Button
                    classes={{
                        root: clsx(classes.overflow, classes.last),
                        label: classes.label,
                        endIcon: clsx(classes.icon, isOpen && classes.forceShowIcon),
                    }}
                    endIcon={(<GoToIcon />)}
                    onClick={() => navigationService.setFolder(data.id)}
                >
                    {data.name}
                </Button>
                <Tooltip title={t('common:button.contextMenu')}>
                    <IconButton
                        className={clsx(classes.contextMenuButton, isOpen && classes.forceShowIcon)}
                        size="small"
                        onClick={dispatchContextMenu}
                    >
                        <ContextMenuIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <BookmarksViewer
                folderId={data.id}
                columns={columns}
                dense
                emptyRender={() => (
                    <Box key="empty" mb={2}>
                        <Typography color="textSecondary">{t('empty')}</Typography>
                    </Box>
                )}
            />
            <Box className={classes.childFolders}>
                {data.children.map((childFolder) => (
                    <SubFolder key={childFolder.id} id={childFolder.id} name={childFolder.name} />
                ))}
            </Box>
        </Box>
    );
}

const ObserverFolder = observer(Folder);

function SecondaryContent({ columns }) {
    const navigationService = useNavigationService();
    const store = useLocalObservable(() => ({
        tree: [],
        anchorEl: null,
        state: FETCH.WAIT,
    }));
    const workingSpaceService = useWorkingSpaceService();

    useEffect(() => {
        store.state = FETCH.PENDING;

        asyncAction(async () => {
            const folders = navigationService.folderId
                ? await FoldersUniversalService.getTree(navigationService.folderId)
                : [];

            console.log('[SecondaryContent] folders:', folders, navigationService.folderId);
            store.tree = folders;
            store.state = FETCH.DONE;
        }).catch((error) => {
            console.error(error);
            captureException(error);
            store.state = FETCH.FAILED;
        });
    }, [navigationService.folderId, workingSpaceService.lastTruthSearchTimestamp]);

    if (store.state === FETCH.FAILED) {
        return 'Что то пошло не так';
    }

    return store.tree.map((folder) => (
        <ObserverFolder
            key={folder.id}
            data={folder}
            columns={columns}
        />
    ));
}

export default observer(SecondaryContent);
