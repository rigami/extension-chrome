import React, { Fragment, useEffect } from 'react';
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
import useBookmarksService from '@/stores/app/BookmarksProvider';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import { ExtendButton } from '@/ui-components/ExtendButton';

const useStyles = makeStyles((theme) => ({
    folderContainer: {
        marginTop: theme.spacing(12),
        '&:hover $icon': { opacity: 1 },
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(2, 0),
    },
    childFolders: {
        gridTemplateColumns: `repeat(auto-fit, ${theme.shape.dataCard.width}px)`,
        display: 'grid',
        gridGap: theme.spacing(0.5, 2),
    },
    childFolderContainer: { width: theme.shape.dataCard.width },
    childFolderBtnLabel: { fontWeight: 600 },
    childFolder: {
        width: 'fit-content',
        maxWidth: '100%',
        marginLeft: theme.spacing(-1),
        padding: theme.spacing(1),
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

function SecondaryContent({ columns }) {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const searchService = useSearchService();
    const store = useLocalObservable(() => ({
        tree: [],
        anchorEl: null,
        state: FETCH.WAIT,
    }));
    const bookmarksService = useBookmarksService();

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
    }, [searchService.selectFolderId, bookmarksService.lastTruthSearchTimestamp]);

    if (store.state === FETCH.PENDING) {
        return 'Загрузка...';
    }

    if (store.state === FETCH.FAILED) {
        return 'Что то пошло не так';
    }

    return (
        <Fragment>
            {/* ---SECONDARY--- */}
            {store.tree.map((folder) => (
                <Box
                    className={classes.folderContainer}
                    key={folder.id}
                    style={{ width: columns * (theme.shape.dataCard.width + 16) + 24 + 8 }}
                >
                    <Box className={classes.header}>
                        <Button
                            classes={{
                                root: clsx(classes.overflow, classes.last),
                                label: classes.label,
                                endIcon: classes.icon,
                            }}
                            endIcon={(<GoToIcon />)}
                            onClick={() => searchService.setSelectFolder(folder.id)}
                        >
                            {folder.name}
                        </Button>
                    </Box>
                    <BookmarksViewer
                        folderId={folder.id}
                        columns={columns}
                        dense
                        emptyRender={() => (
                            <Box key="empty" mb={2}>
                                <Typography color="textSecondary">{t('empty')}</Typography>
                            </Box>
                        )}
                    />
                    <Box className={classes.childFolders}>
                        {folder.children.map((childFolder) => (
                            <ExtendButton
                                key={childFolder.id}
                                className={classes.childFolder}
                                label={childFolder.name}
                                onClick={() => searchService.setSelectFolder(childFolder.id)}
                                icon={() => <FolderIcon />}
                                unwrap
                            />
                        ))}
                    </Box>
                </Box>
            ))}
        </Fragment>
    );
}

export default observer(SecondaryContent);
