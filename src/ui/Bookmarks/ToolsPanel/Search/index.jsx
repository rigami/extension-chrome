import React, { useRef, useState } from 'react';
import {
    Box,
    Fade,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CloseRounded as ResetIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import FullSearch from '@/ui/Bookmarks/ToolsPanel/Search/FullSearch';
import Preview from './Preview';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    wrapper: {
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
        fontFamily: theme.typography.specialFontFamily,
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
        borderTopRightRadius: theme.shape.borderRadiusBold,
        borderBottomRightRadius: theme.shape.borderRadiusBold,
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
            borderBottomRightRadius: theme.shape.borderRadiusBold,
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
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const searchService = useSearchService();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef();

    const { usedFields } = searchService.searchRequest;

    const oneRow = (!usedFields.tags && usedFields.query) || (usedFields.tags && !usedFields.query);

    return (
        <Box className={clsx(classes.wrapper, isOpen && classes.open, oneRow && classes.extend)} ref={rootRef}>
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
    );
}

export default observer(Search);
