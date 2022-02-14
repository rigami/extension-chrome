import React, { useEffect, useRef } from 'react';
import {
    ClickAwayListener,
    Collapse,
    Divider,
    Paper,
} from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles, alpha } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import SearchField from '@/ui/Bookmarks/ToolsPanel/Search/SearchField';
import Tags from './Tags';
import CustomScroll from '@/ui-components/CustomScroll';
import FastResults from '@/ui/Bookmarks/ToolsPanel/Search/FastResults';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    fullSearch: {
        minHeight: 36,
        border: `1px solid ${alpha(theme.palette.background.backdrop, 0.52)}`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: alpha(theme.palette.background.paper, 0),
    },
    openFullSearch: {
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.paper, 1),
    },
    tags: {
        padding: theme.spacing(1.5),
        paddingBottom: theme.spacing(0.75),
        flexShrink: 0,
    },
    search: {
        paddingRight: theme.spacing(5),
        display: 'flex',
        flexShrink: 0,
    },
    wrapperInner: {
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    scrollContent: { width: '100%' },
    scroller: { display: 'flex' },
}));

function FullSearch({ open, onClose }) {
    const classes = useStyles();
    const inputRef = useRef();
    const searchService = useSearchService();
    const store = useLocalObservable(() => ({
        showFastResults: false,
        localSearchRequestId: 0,
    }));

    const handleKeyDown = (event) => {
        if (event.code === 'Escape') {
            onClose(null, false);
        }
        if (event.code === 'Enter') {
            onClose(null, true);
        }
    };

    useEffect(() => {
        if (open) {
            window.addEventListener('keydown', handleKeyDown, true);
            if (inputRef.current) inputRef.current.focus();
            store.localSearchRequestId = searchService.searchRequestId;
        }

        return () => {
            if (open) window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [open]);

    return (
        <ClickAwayListener mouseEvent="onClick" onClickAway={(event) => onClose(event, false)}>
            <Paper
                className={clsx(classes.fullSearch, open && classes.openFullSearch)}
                elevation={open ? 18 : 0}
            >
                <Collapse
                    collapsedSize={36}
                    in={open}
                    unmountOnExit
                    onEntered={() => { store.showFastResults = true; }}
                    onExited={() => { store.showFastResults = false; }}
                    classes={{ wrapperInner: classes.wrapperInner }}
                >
                    <SearchField
                        className={classes.search}
                        inputRef={inputRef}
                        query={searchService.tempSearchRequest.query}
                        onChange={(newQuery) => {
                            store.localSearchRequestId += 1;
                            searchService.updateRequest({ query: newQuery });
                        }}
                    />
                    <Divider />
                    <Tags
                        className={classes.tags}
                        value={searchService.tempSearchRequest.tags}
                        onChange={(changedTags) => {
                            store.localSearchRequestId += 1;
                            searchService.updateRequest({ tags: changedTags });
                        }}
                    />
                    {
                        store.showFastResults
                        && store.localSearchRequestId !== searchService.searchRequestId
                        && (
                            searchService.tempSearchRequest.usedFields?.query
                            || searchService.tempSearchRequest.usedFields?.tags
                        )
                        && (
                            <React.Fragment>
                                <Divider />
                                <CustomScroll
                                    translateContentSizeYToHolder
                                    classes={{
                                        scroller: classes.scroller,
                                        content: classes.scrollContent,
                                    }}
                                >
                                    <FastResults
                                        onGoToFolder={(folderId, apply) => {
                                            if (!apply) searchService.resetChanges();
                                            searchService.setSelectFolder(folderId, false);
                                            onClose(null, apply);
                                        }}
                                    />
                                </CustomScroll>
                            </React.Fragment>
                        )
                    }
                </Collapse>
            </Paper>
        </ClickAwayListener>
    );
}

export default observer(FullSearch);
