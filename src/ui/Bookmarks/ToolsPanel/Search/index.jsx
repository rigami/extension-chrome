import React, { useRef, useState } from 'react';
import {
    Box,
    Fade,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { CloseRounded as ResetIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import FullSearch from '@/ui/Bookmarks/ToolsPanel/Search/FullSearch';
import Preview from './Preview';

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
    extend: {
        '& $resetIconWrapper': {
            height: 44,
            borderBottomRightRadius: theme.shape.borderRadius,
        },
    },
    open: {
        '& $resetIconWrapper': {
            height: 44,
            borderBottomRightRadius: 0,
        },
    },
    search: {
        paddingRight: 42,
        '-webkit-mask': 'linear-gradient(to left, transparent 42px, black 60px)',
        display: 'flex',
    },
}));

function Search({ searchService: globalService, alignLeft }) {
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
                                }, { force: true });

                                globalService.applyChanges();
                            }}
                        >
                            <ResetIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
            <Fade in={!isOpen}>
                <Preview
                    query={usedFields.query && globalService.searchRequest.query}
                    tags={usedFields.tags && globalService.searchRequest.tags}
                    alignLeft={alignLeft}
                    onClick={() => setIsOpen(true)}
                />
            </Fade>
            <Box className={clsx(classes.fullSearchWrapper, !isOpen && classes.disabledFullSearch)}>
                <FullSearch
                    searchService={globalService}
                    open={isOpen}
                    onClose={(event, apply) => {
                        if (event && event.path.find((elem) => (
                            elem.dataset?.role === 'contextmenu'
                            || elem.dataset?.role === 'dialog'
                        ))) return;

                        if (!event || !event.path.includes(rootRef.current)) {
                            setIsOpen(false);
                            if (apply) globalService.applyChanges();
                            else globalService.resetChanges();
                        }
                    }}
                />
            </Box>
        </Box>
    );
}

export default observer(Search);
