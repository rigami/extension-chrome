import React, { useEffect, useRef } from 'react';
import {
    ClickAwayListener,
    Collapse,
    Divider,
    Paper,
} from '@material-ui/core';
import clsx from 'clsx';
import SearchField from '@/ui/Bookmarks/ToolsPanel/Search/SearchField';
import Tags from '@/ui/Bookmarks/Tags';
import CustomScroll from '@/ui-components/CustomScroll';
import FastResults from '@/ui/Bookmarks/ToolsPanel/Search/FastResults';
import { makeStyles, alpha } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    fullSearch: {
        minHeight: 40,
        border: `1px solid ${alpha(theme.palette.background.backdrop, 0.52)}`,
        overflow: 'hidden',
        boxSizing: 'border-box',
    },
    openFullSearch: { border: `1px solid ${theme.palette.divider}` },
    tags: {
        padding: theme.spacing(1.5),
        paddingBottom: theme.spacing(0.75),
        flexShrink: 0,
    },
    search: {
        paddingRight: 40,
        '-webkit-mask': 'linear-gradient(to left, transparent 40px, black 60px)',
        display: 'flex',
        flexShrink: 0,
    },
    wrapperInner: {
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
}));

function FullSearch({ searchService: globalService, open, onClose }) {
    const classes = useStyles();
    const inputRef = useRef();
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
            store.localSearchRequestId = globalService.searchRequestId;
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
                    collapsedHeight={40}
                    in={open}
                    unmountOnExit
                    onEntered={() => { store.showFastResults = true; }}
                    onExited={() => { store.showFastResults = false; }}
                    classes={{ wrapperInner: classes.wrapperInner }}
                >
                    <SearchField
                        className={classes.search}
                        inputRef={inputRef}
                        query={globalService.tempSearchRequest.query}
                        onChange={(newQuery) => {
                            store.localSearchRequestId += 1;
                            globalService.updateRequest({ query: newQuery });
                        }}
                    />
                    <Divider />
                    <Tags
                        className={classes.tags}
                        value={globalService.tempSearchRequest.tags}
                        expandAlways
                        onChange={(changedTags) => {
                            store.localSearchRequestId += 1;
                            globalService.updateRequest({ tags: changedTags });
                        }}
                    />
                    {
                        store.showFastResults
                        && store.localSearchRequestId !== globalService.searchRequestId
                        && (
                            globalService.tempSearchRequest.usedFields?.query
                            || globalService.tempSearchRequest.usedFields?.tags
                        )
                        && (
                            <React.Fragment>
                                <Divider />
                                <CustomScroll translateContentSizeYToHolder>
                                    <FastResults
                                        searchService={globalService}
                                        onGoToFolder={(folderId, apply) => {
                                            if (!apply) globalService.resetChanges();
                                            globalService.setActiveFolder(folderId);
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
