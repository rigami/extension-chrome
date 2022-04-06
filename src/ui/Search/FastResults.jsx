import React, {
    Fragment, useEffect, useRef, useState,
} from 'react';
import {
    Box,
    Button,
    Divider,
    Typography,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { alpha, makeStyles } from '@material-ui/core/styles';
import {
    map,
    size,
    omit,
    sample,
} from 'lodash';
import clsx from 'clsx';
import stateRender from '@/utils/helpers/stateRender';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { FETCH } from '@/enum';
import FolderBreadcrumbs from '@/ui/WorkingSpace/FolderBreadcrumbs';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useSearchService } from '@/ui/WorkingSpace/searchProvider';
import BookmarksList from '@/ui/WorkingSpace/BookmarksViewer/BookmarksList';
import Stub from '@/ui-components/Stub';
import { useHotKeysService } from '@/stores/app/hotKeys';
import RowItem from '@/ui/WorkingSpace/Bookmark/Row';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingBottom: theme.spacing(1),
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
    },
    goToButton: {
        textTransform: 'none',
        color: theme.palette.secondary.main,
        fontWeight: 800,
    },
    bookmarksGrid: {
        margin: theme.spacing(0, 2),
        marginBottom: theme.spacing(2),
        maxHeight: (theme.shape.dataCard.height + theme.spacing(2)) * 3,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
        paddingBottom: 0,
        paddingLeft: theme.spacing(1),
    },
    countResults: {
        color: theme.palette.text.secondary,
        marginLeft: 'auto',
        flexShrink: 0,
    },
    stub: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(3),
    },
    folderBreadcrumbs: { overflow: 'auto' },
    countOtherResults: {
        padding: theme.spacing(1, 2),
        display: 'block',
        color: theme.palette.text.secondary,
    },
    bookmarksList: {
        margin: 0,
        padding: theme.spacing(0, 1),
    },
    emoticon: {
        fontSize: '5rem',
        color: alpha(theme.palette.text.secondary, 0.06),
        fontWeight: 700,
    },
    message: {
        fontSize: '1.4rem',
        fontWeight: 600,
        marginTop: theme.spacing(5),
        color: theme.palette.text.primary,
    },
    divider: {
        opacity: 1,
        margin: theme.spacing(0.5, 0),
    },
    option: {},
    selected: { backgroundColor: theme.palette.action.selected },
}));

const emoticons = [
    '(^_^)b',
    '(；⌣̀_⌣́)',
    '(⇀‸↼‶)',
    '(눈_눈)',
    '(ᗒᗣᗕ)՞',
    '(￢_￢;)',
    'ヾ( ￣O￣)ツ',
    '(╥_╥)',
    '( ╥ω╥ )',
    '¯\\_(ツ)_/¯',
    '┐( ˘ ､ ˘ )┌',
    '╮( ˘_˘ )╭',
    '(⊙_⊙)',
];

function FastResults({ onGoToFolder }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const workingSpaceService = useWorkingSpaceService();
    const hotKeysService = useHotKeysService();
    const [emoticon] = useState(() => sample(emoticons));
    const searchService = useSearchService();
    const store = useLocalObservable(() => ({
        bookmarks: null,
        currentFolder: [],
        otherFolders: [],
        requestId: 0,
        loadState: FETCH.WAIT,
        options: [],
        currOptionIndex: 1,
        selectedOption: null,
    }));
    const ref = useRef();

    useEffect(() => {
        store.loadState = FETCH.PENDING;
        store.requestId += 1;
        const currentRequestId = store.requestId;

        BookmarksUniversalService.query(new SearchQuery({
            query: searchService.tempSearchRequest.query,
            tags: searchService.tempSearchRequest.tags,
        }))
            .then((result) => {
                if (currentRequestId !== store.requestId) return;
                const byFolders = {};

                [...(result.best || []), ...(result.part || [])].forEach((bookmark) => {
                    byFolders[bookmark.folderId] = [...(byFolders[bookmark.folderId] || []), bookmark];
                });

                store.currentFolder = byFolders[searchService.selectFolderId] || [];
                store.otherFolders = map(
                    omit(byFolders, [searchService.selectFolderId]),
                    (bookmarks, folderId) => ({
                        bookmarks,
                        folderId,
                    }),
                );
                store.loadState = FETCH.DONE;
                store.currOptionIndex = 1;
                store.selectedOption = null;
            });
    }, [workingSpaceService.lastTruthSearchTimestamp, searchService.tempSearchRequest]);

    useEffect(() => {
        const hotKeysListeners = [];

        hotKeysListeners.push(hotKeysService.on(['Enter'], () => {
            const item = ref.current.querySelector(`[optionKey=${store.selectedOption}]`);

            if (item) {
                if (item.attributes.optiontype.value === 'folder') {
                    onGoToFolder(item.attributes.optionid.value, true);
                } else if (item.attributes.optiontype.value === 'bookmark') {
                    item.querySelector('button').click();
                }
            }
        }));

        hotKeysListeners.push(hotKeysService.on(['ArrowUp'], () => {
            const items = Array.from(ref.current.querySelectorAll(`.${classes.option}`))
                .map((option) => option.attributes.optionkey?.value);

            store.currOptionIndex -= 1;
            store.currOptionIndex = store.currOptionIndex < 0 ? items.length - 1 : store.currOptionIndex;
            store.selectedOption = items[store.currOptionIndex];
        }));

        hotKeysListeners.push(hotKeysService.on(['ArrowDown'], () => {
            const items = Array.from(ref.current.querySelectorAll(`.${classes.option}`))
                .map((option) => option.attributes.optionkey?.value);

            store.currOptionIndex += 1;
            store.currOptionIndex = store.currOptionIndex >= items.length ? 0 : store.currOptionIndex;
            store.selectedOption = items[store.currOptionIndex];
        }));

        return () => {
            hotKeysListeners.forEach((listener) => hotKeysService.removeListener(listener));
        };
    }, []);

    useEffect(() => {
        if (store.loadState === FETCH.DONE) {
            const items = Array.from(ref.current.querySelectorAll(`.${classes.option}`))
                .map((option) => option.attributes.optionkey?.value);

            store.currOptionIndex = store.currOptionIndex >= items.length ? 0 : store.currOptionIndex;
            store.currOptionIndex = store.currOptionIndex < 0 ? items.length - 1 : store.currOptionIndex;
            store.selectedOption = items[store.currOptionIndex];
        }
    });

    return (
        <Box className={classes.root} ref={ref}>
            {stateRender(
                store.loadState,
                <Fragment>
                    {store.currentFolder.length !== 0 && (
                        <Fragment>
                            <Box className={classes.header}>
                                <Button
                                    optionKey={`f-${searchService.selectFolderId}`}
                                    optionType="folder"
                                    optionId={searchService.selectFolderId}
                                    endIcon={(<GoToIcon />)}
                                    className={clsx(
                                        classes.goToButton,
                                        classes.option,
                                        store.selectedOption === `f-${searchService.selectFolderId}` && classes.selected,
                                    )}
                                    onClick={() => {
                                        onGoToFolder(searchService.selectFolderId, true);
                                    }}
                                >
                                    {t('search.currentFolderMatches')}
                                </Button>
                                <Typography
                                    variant="caption"
                                    className={classes.countResults}
                                >
                                    {t('search.results', { count: store.currentFolder.length })}
                                </Typography>
                            </Box>
                            <ul className={clsx(classes.bookmarksList)}>
                                {store.currentFolder.slice(0, 3).map((bookmark, index) => (
                                    <Fragment key={bookmark.id}>
                                        {index !== 0 && (
                                            <Divider
                                                variant="middle"
                                                className={classes.divider}
                                            />
                                        )}
                                        <RowItem
                                            id={bookmark.id}
                                            name={bookmark.name}
                                            url={bookmark.url}
                                            tags={bookmark.tags}
                                            tagsFull={bookmark.tagsFull}
                                            icoVariant={bookmark.icoVariant}
                                            description={bookmark.description}
                                            icoUrl={bookmark.icoUrl}
                                            className={classes.option}
                                            classes={{
                                                button: clsx(
                                                    store.selectedOption === `b-${bookmark.id}` && classes.selected,
                                                ),
                                            }}
                                            optionKey={`b-${bookmark.id}`}
                                            optionType="bookmark"
                                            optionId={bookmark.id}
                                        />
                                    </Fragment>
                                ))}
                                {store.currentFolder.length > 3 && (
                                    <Typography
                                        variant="caption"
                                        className={classes.countOtherResults}
                                    >
                                        {t(
                                            'search.otherResults',
                                            { count: store.bookmarks?.length - Math.min(store.currentFolder.length, 3) },
                                        )}
                                    </Typography>
                                )}
                            </ul>
                        </Fragment>
                    )}
                    {store.otherFolders.map(({ bookmarks, folderId }, index) => (
                        <Fragment key={folderId}>
                            {(index !== 0 || (index === 0 && store.currentFolder.length !== 0)) && (<Divider />)}
                            <Box className={classes.header}>
                                <FolderBreadcrumbs
                                    optionKey={`f-${folderId}`}
                                    optionType="folder"
                                    optionId={folderId}
                                    folderId={folderId}
                                    lastClickable
                                    className={classes.option}
                                    classes={{
                                        root: classes.folderBreadcrumbs,
                                        last: clsx(
                                            classes.goToButton,
                                            store.selectedOption === `f-${folderId}` && classes.selected,
                                        ),
                                    }}
                                    onSelectFolder={(selectFolderId) => {
                                        onGoToFolder(selectFolderId, selectFolderId === folderId);
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    className={classes.countResults}
                                >
                                    {t('search.results', { count: bookmarks.length })}
                                </Typography>
                            </Box>
                            <ul className={clsx(classes.bookmarksList)}>
                                {bookmarks.slice(0, 3).map((bookmark, index) => (
                                    <Fragment key={bookmark.id}>
                                        {index !== 0 && (
                                            <Divider
                                                variant="middle"
                                                className={classes.divider}
                                            />
                                        )}
                                        <RowItem
                                            id={bookmark.id}
                                            name={bookmark.name}
                                            url={bookmark.url}
                                            tags={bookmark.tags}
                                            tagsFull={bookmark.tagsFull}
                                            icoVariant={bookmark.icoVariant}
                                            description={bookmark.description}
                                            icoUrl={bookmark.icoUrl}
                                            className={classes.option}
                                            classes={{
                                                button: clsx(
                                                    store.selectedOption === `b-${bookmark.id}` && classes.selected,
                                                ),
                                            }}
                                            optionKey={`b-${bookmark.id}`}
                                            optionType="bookmark"
                                            optionId={bookmark.id}
                                        />
                                    </Fragment>
                                ))}
                                {bookmarks.length > 3 && (
                                    <Typography
                                        variant="caption"
                                        className={classes.countOtherResults}
                                    >
                                        {t(
                                            'search.otherResults',
                                            { count: bookmarks.length - Math.min(bookmarks.length, 3) },
                                        )}
                                    </Typography>
                                )}
                            </ul>
                        </Fragment>
                    ))}
                    {size(store.otherFolders) === 0 && store.currentFolder.length === 0 && (
                        <Stub
                            maxWidth={false}
                            message={emoticon}
                            description={t('search.nothingFound')}
                            classes={{
                                root: classes.stub,
                                title: classes.emoticon,
                                description: classes.message,
                            }}
                        />
                    )}
                </Fragment>,
                <Stub
                    maxWidth={false}
                    description={t('common:search')}
                    classes={{ root: classes.stub }}
                />,
            )}
        </Box>
    );
}

export default observer(FastResults);
