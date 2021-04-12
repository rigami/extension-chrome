import {
    ClickAwayListener, Collapse, Divider, Paper,
} from '@material-ui/core';
import clsx from 'clsx';
import SearchField from '@/ui/Bookmarks/ToolsPanel/Search/SearchField';
import Tags from '@/ui/Bookmarks/Tags';
import CustomScroll from '@/ui-components/CustomScroll';
import FastResults from '@/ui/Bookmarks/ToolsPanel/Search/FastResults';
import React, { useEffect, useRef, useState } from 'react';
import { SearchQuery } from '@/stores/universal/bookmarks/searchQuery';
import { useTranslation } from 'react-i18next';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        width: '100%',
        maxWidth: 600,
        minWidth: 240,
        minHeight: 42,
        flexGrow: 1,
        position: 'relative',
    },
    root: {
        position: 'relative',
        zIndex: 2,
        border: `1px solid ${fade(theme.palette.divider, 0.05)}`,
        backdropFilter: 'none',
        backgroundColor: theme.palette.background.backdrop,
    },
    icon: {
        margin: theme.spacing(1.125),
        color: theme.palette.text.secondary,
    },
    placeholder: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        fontSize: '1rem',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        color: theme.palette.text.secondary,
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alignFix: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    fullSearchWrapper: {
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    fullSearch: {
        minHeight: 42,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
    },
    openFullSearch: {},
    disabledFullSearch: {},
    tags: {
        padding: theme.spacing(1.5),
        flexShrink: 0,
    },
    query: {
        fontSize: '1rem',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        color: theme.palette.text.secondary,
        letterSpacing: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    resetIconWrapper: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: Math.sqrt(882) + 21,
        zIndex: 3,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
        pointerEvents: 'none',
    },
    resetIcon: {
        padding: Math.sqrt(882) - 12,
        margin: -(Math.sqrt(882) - 21),
        marginLeft: 0,
        pointerEvents: 'all',
    },
    rows: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1,
        '-webkit-mask': 'linear-gradient(to left, transparent 42px, black 60px)',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 42,
        overflow: 'hidden',
        marginTop: theme.spacing(-1),
        '&:first-child': { marginTop: 0 },
    },
    extend: {
        '& $resetIconWrapper': {
            height: 42,
            borderBottomRightRadius: theme.shape.borderRadius,
        },
    },
    open: {
        '& $resetIconWrapper': {
            height: 42,
            borderBottomRightRadius: 0,
        },
    },
    tag: {
        '& div': {
            opacity: '60%',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 8,
            flexShrink: 0,
        },
        marginRight: 8,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    tagSmall: {
        '& div': { marginRight: 0 },
        fontSize: 0,
        marginRight: 4,
    },
    search: {
        paddingRight: 42,
        '-webkit-mask': 'linear-gradient(to left, transparent 42px, black 60px)',
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
    const { t } = useTranslation(['bookmark']);
    const inputRef = useRef();
    const store = useLocalObservable(() => ({
        showFastResults: false,
        localSearchRequestId: 0,
    }));

    const handleKeyDown = (event) => {
        if (event.code === 'Escape' || event.code === 'Enter') onClose();
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
        <ClickAwayListener
            onClickAway={onClose}
        >
            <Paper
                className={clsx(classes.fullSearch, open && classes.openFullSearch)}
                elevation={open ? 18 : 0}
            >
                <Collapse
                    collapsedHeight={42}
                    in={open}
                    unmountOnExit
                    onEntered={() => { store.showFastResults = true; }}
                    onExited={() => { store.showFastResults = false; }}
                    classes={{ wrapperInner: classes.wrapperInner }}
                >
                    <SearchField
                        className={classes.search}
                        inputRef={inputRef}
                        query={globalService.query}
                        onChange={(newQuery) => {
                            store.localSearchRequestId += 1;
                            globalService.updateRequest({ query: newQuery });
                        }}
                    />
                    <Divider />
                    <Tags
                        className={classes.tags}
                        value={globalService.tags}
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
                            globalService.searchRequest.usedFields?.query
                            || globalService.searchRequest.usedFields?.tags
                        )
                        && (
                            <React.Fragment>
                                <Divider />
                                <CustomScroll translateContentSizeYToHolder>
                                    <FastResults
                                        searchService={globalService}
                                        onGoToFolder={(folderId) => {
                                            globalService.setActiveFolder(folderId);
                                            onClose();
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
