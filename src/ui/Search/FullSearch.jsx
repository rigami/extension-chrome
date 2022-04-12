import React, { useRef } from 'react';
import { Divider, Box } from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import SearchField from '@/ui/Search/SearchField';
import Tags from './Tags';
import FastResults from '@/ui/Search/FastResults';
import { useSearchService } from '@/stores/app/search';
import { useNavigationService } from '@/stores/app/navigation';

const useStyles = makeStyles((theme) => ({
    fullSearch: {
        overflow: 'hidden',
        boxSizing: 'border-box',
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
        display: 'flex',
        flexDirection: 'column',
    },
    scrollContent: { width: '100%' },
    scroller: { display: 'flex' },
}));

function FullSearch({ onClose }) {
    const classes = useStyles();
    const inputRef = useRef();
    const searchService = useSearchService();
    const navigationService = useNavigationService();
    const store = useLocalObservable(() => ({ localSearchRequestId: 0 }));

    return (
        <Box className={clsx(classes.fullSearch)}>
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
                store.localSearchRequestId !== searchService.searchRequestId
                && (
                    searchService.tempSearchRequest.usedFields?.query
                    || searchService.tempSearchRequest.usedFields?.tags
                )
                && (
                    <React.Fragment>
                        <Divider />
                        <FastResults
                            onGoToFolder={(folderId, apply) => {
                                searchService.updateRequest({ folderId });
                                navigationService.setFolder(folderId);
                                onClose(apply);
                            }}
                        />
                    </React.Fragment>
                )
            }
        </Box>
    );
}

export default observer(FullSearch);
