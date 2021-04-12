import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Collapse,
    ClickAwayListener,
    Divider,
    Fade,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { CloseRounded as ResetIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Tags from '@/ui/Bookmarks/Tags';
import { observer } from 'mobx-react-lite';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import CustomScroll from '@/ui-components/CustomScroll';
import { SearchQuery } from '@/stores/universal/bookmarks/searchQuery';
import FullSearch from '@/ui/Bookmarks/ToolsPanel/Search/FullSearch';
import Preview from './Preview';
import SearchField from './SearchField';
import FastResults from './FastResults';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        width: '100%',
        maxWidth: (theme.shape.dataCard.width + theme.spacing(2)) * 3 + theme.spacing(2),
        minWidth: 240,
        minHeight: 42,
        flexGrow: 1,
        flexShrink: 0,
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
    },
    openFullSearch: {},
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
    },
}));

function Search({ searchService: globalService }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef();

    const { usedFields } = globalService.searchRequest;

    const oneRow = (!usedFields.tags && usedFields.query)
        || (usedFields.tags && !usedFields.query);

    return (
        <Box className={clsx(classes.wrapper, isOpen && classes.open, oneRow && classes.extend)} ref={rootRef}>
            {(usedFields.query || usedFields.tags) && (
                <Box className={classes.resetIconWrapper}>
                    <Tooltip title={t('common:button.reset')}>
                        <IconButton
                            className={classes.resetIcon}
                            size="medium"
                            onClick={() => {
                                globalService.updateRequest({
                                    query: '',
                                    tags: [],
                                }, {
                                    force: true,
                                    incrementId: !isOpen,
                                });
                            }}
                        >
                            <ResetIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
            <Fade in={!isOpen}>
                <Preview
                    query={usedFields.query && globalService.query}
                    tags={usedFields.tags && globalService.tags}
                    onClick={() => setIsOpen(true)}
                />
            </Fade>
            <Box className={clsx(classes.fullSearchWrapper, !isOpen && classes.disabledFullSearch)}>
                <FullSearch
                    searchService={globalService}
                    open={isOpen}
                    onClose={(event) => {
                        if (!event || !event.path.includes(rootRef.current)) {
                            setIsOpen(false);
                            globalService.applyRequest(true);
                        }
                    }}
                />
            </Box>
        </Box>
    );
}

export default observer(Search);
