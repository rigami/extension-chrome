import React, { Fragment, useEffect, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import { FolderRounded as FolderIcon, ArrowForward as GoToIcon } from '@material-ui/icons';
import { Box, Button, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';
import { FETCH } from '@/enum';
import asyncAction from '@/utils/helpers/asyncAction';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { FIRST_UUID } from '@/utils/generate/uuid';

const useStyles = makeStyles((theme) => ({
    folderContainer: {
        marginBottom: theme.spacing(12),
        paddingLeft: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        flexDirection: 'column',
        '&:hover $icon': { opacity: 1 },
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
}));

function Folder({ data, columns }) {
    const theme = useTheme();
    const classes = useStyles();
    const searchService = useSearchService();
    const { t } = useTranslation(['bookmark']);
    const [isActive, setIsActive] = useState(false);
    const { dispatchContextMenu } = useContextMenuService((baseContextMenu) => baseContextMenu({
        itemId: data.id,
        itemType: 'folder',
    }), {
        onOpen: () => { setIsActive(true); },
        onClose: () => { setIsActive(false); },
    });

    return (
        <Box
            className={clsx(classes.folderContainer, isActive && classes.containerActive)}
            style={{ width: columns * (theme.shape.dataCard.width + 16) + 16 }}
            onContextMenu={dispatchContextMenu}
        >
            <Box className={classes.header}>
                <Button
                    classes={{
                        root: clsx(classes.overflow, classes.last),
                        label: classes.label,
                        endIcon: classes.icon,
                    }}
                    endIcon={(<GoToIcon />)}
                    onClick={() => searchService.setSelectFolder(data.id)}
                >
                    {data.name}
                </Button>
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
                nothingFoundRender={() => (
                    <Box key="empty" mb={2}>
                        <Typography color="textSecondary">{t('search.nothingFoundInFolder')}</Typography>
                    </Box>
                )}
            />
            <Box className={classes.childFolders}>
                {data.children.map((childFolder) => (
                    <ExtendButtonGroup key={childFolder.id} className={classes.childFolder}>
                        <ExtendButton
                            label={childFolder.name}
                            onClick={() => searchService.setSelectFolder(childFolder.id)}
                            icon={() => <FolderIcon />}
                            unwrap
                        />
                    </ExtendButtonGroup>
                ))}
            </Box>
        </Box>
    );
}

function SecondaryContent({ columns }) {
    const searchService = useSearchService();
    const store = useLocalObservable(() => ({
        tree: [],
        anchorEl: null,
        state: FETCH.WAIT,
    }));
    const workingSpaceService = useWorkingSpaceService();

    useEffect(() => {
        store.state = FETCH.PENDING;

        asyncAction(async () => {
            const folders = searchService.selectFolderId
                ? await FoldersUniversalService.getTree(searchService.selectFolderId)
                : [];

            console.log('[SecondaryContent] folders:', folders, searchService.selectFolderId);
            store.tree = folders;
            store.state = FETCH.DONE;
        }).catch((error) => {
            console.error(error);
            captureException(error);
            store.state = FETCH.FAILED;
        });
    }, [searchService.selectFolderId, workingSpaceService.lastTruthSearchTimestamp]);

    if (store.state === FETCH.FAILED) {
        return 'Что то пошло не так';
    }

    return store.tree.map((folder) => (
        <Folder
            key={folder.id}
            data={folder}
            columns={columns}
        />
    ));
}

export default observer(SecondaryContent);
