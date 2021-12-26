import React, { useCallback, useRef, useState } from 'react';
import {
    Box,
    Fade,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { CloseRounded as ResetIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useResizeDetector } from 'react-resize-detector';
import FullSearch from '@/ui/Bookmarks/ToolsPanel/Search/FullSearch';
import Preview from './Preview';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        // width: '100%',
        maxWidth: (theme.shape.dataCard.width + theme.spacing(2)) * 3 + theme.spacing(2),
        minWidth: (theme.shape.dataCard.width + theme.spacing(2)) + theme.spacing(2),
        height: 36,
        flexGrow: 1,
        flexShrink: 0,
        position: 'relative',
    },
    root: {
        position: 'absolute',
        right: 0,
        top: 0,
        marginLeft: 'auto',
    },
    fullSearchWrapper: {
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    fullSearch: {
        minHeight: 36,
        border: `1px solid ${theme.palette.divider}`,
    },
    disabledFullSearch: {},
    tags: { padding: theme.spacing(1.5) },
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
        height: Math.sqrt(882) + 18,
        zIndex: 3,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
        borderTopRightRadius: theme.shape.borderRadiusButton,
        borderBottomRightRadius: theme.shape.borderRadiusButton,
        pointerEvents: 'none',
    },
    resetIcon: {
        padding: Math.sqrt(882) - 12,
        margin: -(Math.sqrt(882) - 18),
        marginLeft: 0,
        pointerEvents: 'all',
    },
    extend: {
        '& $resetIconWrapper': {
            height: 36,
            borderBottomRightRadius: theme.shape.borderRadiusButton,
        },
    },
    open: {
        '& $resetIconWrapper': {
            height: 36,
            borderBottomRightRadius: 0,
        },
    },
    search: {
        paddingRight: 36,
        '-webkit-mask': 'linear-gradient(to left, transparent 36px, black 60px)',
        display: 'flex',
    },
}));

function Search() {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const searchService = useSearchService();
    const [isOpen, setIsOpen] = useState(false);
    const [columnsCount, setColumnsCount] = useState(0);
    const rootRef = useRef();

    const onResize = useCallback((width) => {
        const maxColumnsCount = Math.floor((width - 32 + 16) / (theme.shape.dataCard.width + 16));
        setColumnsCount(Math.max(
            Math.min(
                maxColumnsCount,
                3,
            ),
            1,
        ));
    }, []);

    const { ref: wrapperRef } = useResizeDetector({ onResize });

    console.log('searchService:', searchService, searchService.searchRequest);

    const { usedFields } = searchService.searchRequest;

    const oneRow = (!usedFields.tags && usedFields.query)
        || (usedFields.tags && !usedFields.query);

    return (
        <Box className={clsx(classes.wrapper, isOpen && classes.open, oneRow && classes.extend)} ref={wrapperRef}>
            <Box
                ref={rootRef}
                className={classes.root}
                style={{ width: columnsCount * (theme.shape.dataCard.width + theme.spacing(2)) + theme.spacing(2) + 2 }}
            >
                {(usedFields.query || usedFields.tags) && (
                    <Box className={classes.resetIconWrapper}>
                        <Tooltip title={t('common:button.reset')}>
                            <IconButton
                                className={classes.resetIcon}
                                size="medium"
                                onClick={() => {
                                    searchService.updateRequest({
                                        query: '',
                                        tags: [],
                                    }, { force: true });

                                    searchService.applyChanges();
                                }}
                            >
                                <ResetIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                <Fade in={!isOpen}>
                    <Preview
                        query={usedFields.query && searchService.searchRequest.query}
                        tags={usedFields.tags && searchService.searchRequest.tags}
                        onClick={() => setIsOpen(true)}
                    />
                </Fade>
                <Box className={clsx(classes.fullSearchWrapper, !isOpen && classes.disabledFullSearch)}>
                    <FullSearch
                        columns={columnsCount}
                        open={isOpen}
                        onClose={(event, apply) => {
                            if (event && event.path.find((elem) => (
                                elem.dataset?.role === 'contextmenu'
                                || elem.dataset?.role === 'dialog'
                            ))) return;

                            if (!event || !event.path.includes(rootRef.current)) {
                                setIsOpen(false);
                                if (apply) searchService.applyChanges();
                                else searchService.resetChanges();
                            }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default observer(Search);
