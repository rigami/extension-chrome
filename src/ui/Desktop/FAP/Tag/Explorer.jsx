import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CircularProgress,
    Box,
    Button,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import {
    CloseRounded as CloseIcon,
    LabelRounded as LabelIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import Scrollbar from '@/ui-components/CustomScroll';
import Stub from '@/ui-components/Stub';
import BookmarksGrid from '@/ui/WorkingSpace/BookmarksViewer/BookmarksGrid';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useCoreService } from '@/stores/app/core';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { useContextEdit } from '@/stores/app/contextActions';
import { search, SearchQuery } from '@/stores/universal/workingSpace/search';
import getUniqueColor from '@/utils/generate/uniqueColor';
import sorting from '@/ui/WorkingSpace/BookmarksViewer/utils/sort';
import { BKMS_DISPLAY_VARIANT } from '@/enum';
import BookmarksList from '@/ui/WorkingSpace/BookmarksViewer/BookmarksList';

const useStyles = makeStyles((theme) => ({
    root: {
        width: (theme.shape.dataCard.width + theme.spacing(2)) * 2 + theme.spacing(2) + 1,
        height: 620,
        maxHeight: 'inherit',
        maxWeight: 'inherit',
        display: 'flex',
        flexDirection: 'column',
    },
    avatar: {
        display: 'flex',
        height: theme.spacing(4),
        alignItems: 'center',
    },
    action: { marginBottom: theme.spacing(-1) },
    bookmarks: {
        flexGrow: 1,
        overflow: 'auto',
    },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontFamily: theme.typography.specialFontFamily,
    },
    scrollContent: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
    },
    listBookmarks: {
        width: '100%',
        margin: theme.spacing(0, -1),
    },
}));

function Folder({ id }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const workingSpaceService = useWorkingSpaceService();
    const coreService = useCoreService();
    const [tag, setTag] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const { dispatchEdit } = useContextEdit();
    const { dispatchContextMenu } = useContextMenuService((event, position, next) => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => dispatchEdit({
                itemType: 'bookmark',
                defaultTagsIds: [id],
            }, event, position, next),
        }),
    ]);

    useEffect(() => {
        setIsSearching(true);
        TagsUniversalService.get(id).then((findTag) => setTag(findTag));

        const sort = sorting[workingSpaceService.settings.sorting](workingSpaceService);

        search(new SearchQuery({ tags: [id] }))
            .then(({ all }) => {
                setFindBookmarks(sort(all));
                setIsSearching(false);
            });
    }, [workingSpaceService.lastTruthSearchTimestamp]);

    const color = getUniqueColor(tag?.colorKey) || '#000';

    return (
        <Card
            className={classes.root} elevation={16}
            onContextMenu={dispatchContextMenu}
        >
            <CardHeader
                avatar={(
                    <LabelIcon style={{ color }} />
                )}
                action={(
                    <Tooltip title={t('common:button.close')}>
                        <IconButton
                            onClick={() => {
                                if (coreService.tempStorage.data.closeFapPopper) {
                                    coreService.tempStorage.data.closeFapPopper();
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                )}
                title={tag?.name}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                    title: classes.title,
                }}
            />
            {isSearching && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {!isSearching && findBookmarks.length === 0 && (
                <Stub message={t('bookmark:empty')}>
                    <Button
                        onClick={(event) => dispatchEdit(
                            {
                                itemType: 'bookmark',
                                defaultTagsIds: [id],
                            }, event,
                        )}
                        startIcon={<AddBookmarkIcon />}
                        variant="contained"
                        color="primary"
                    >
                        {t('bookmark:button.add', { context: 'first' })}
                    </Button>
                </Stub>
            )}
            {findBookmarks && findBookmarks.length !== 0 && (
                <Box display="flex" className={classes.bookmarks}>
                    <Scrollbar classes={{ content: classes.scrollContent }}>
                        <Box display="flex" ml={2}>
                            {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                                <BookmarksGrid
                                    bookmarks={findBookmarks}
                                    columns={2}
                                />
                            )}
                            {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                                <BookmarksList
                                    bookmarks={findBookmarks}
                                    className={classes.listBookmarks}
                                />
                            )}
                        </Box>
                    </Scrollbar>
                </Box>
            )}
        </Card>
    );
}

export default observer(Folder);
