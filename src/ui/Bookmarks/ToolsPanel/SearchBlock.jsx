import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Paper, CardActionArea, Typography, Collapse, ClickAwayListener, Divider, Fade, IconButton,
} from '@material-ui/core';
import { ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { makeStyles } from '@material-ui/core/styles';
import { CloseRounded as ResetIcon, SearchRounded as SearchIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Tags from '@/ui/Bookmarks/Tags';
import { observer } from 'mobx-react-lite';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import Search from './Search';

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
    fullSearch: { },
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

function SearchBlock({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const rootRef = useRef();
    const inputRef = useRef();

    const handleKeyDown = (event) => {
        if (event.code === 'Escape' || event.code === 'Enter') setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown, true);
            if (inputRef.current) inputRef.current.focus();
        }

        return () => {
            if (isOpen) window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    useEffect(() => {
        Promise.all(service.tags.map((tagId) => TagsUniversalService.get(tagId)))
            .then((fullTags) => setTags(fullTags));
    }, [service.tags]);

    const { usedFields } = service.searchRequest;

    const oneRow = (!usedFields.tags && usedFields.query)
        || (usedFields.tags && !usedFields.query);

    return (
        <Box className={clsx(classes.wrapper, isOpen && classes.open, oneRow && classes.extend)} ref={rootRef}>
            {(usedFields.query || usedFields.tags) && (
                <Box className={classes.resetIconWrapper}>
                    <IconButton
                        className={classes.resetIcon}
                        size="medium"
                        onClick={() => {
                            service.updateRequest({
                                query: '',
                                tags: [],
                            });
                        }}
                    >
                        <ResetIcon />
                    </IconButton>
                </Box>
            )}
            <Fade in={!isOpen}>
                <ExtendButtonGroup className={classes.root}>
                    <CardActionArea
                        className={classes.alignFix}
                        onClick={() => setIsOpen(true)}
                    >
                        <SearchIcon className={classes.icon} />
                        <Box className={classes.rows}>
                            {usedFields.query && (
                                <Box className={classes.row}>
                                    <Typography variant="caption" className={classes.query}>
                                        {service.query}
                                    </Typography>
                                </Box>
                            )}
                            {usedFields.tags && (
                                <Box className={classes.row}>
                                    {tags.map((tag, index) => (
                                        <span
                                            key={tag.id}
                                            className={clsx(classes.tag, classes.query, index > 2 && classes.tagSmall)}
                                        >
                                            <div style={{ backgroundColor: tag.color }} />
                                            {tag.name}
                                        </span>
                                    ))}
                                </Box>
                            )}
                        </Box>
                        {(!usedFields.query && !usedFields.tags) && (
                            <Typography variant="caption" className={classes.placeholder}>
                                {t('search.bookmarks', { context: 'placeholder' })}
                            </Typography>
                        )}
                    </CardActionArea>
                </ExtendButtonGroup>
            </Fade>
            <Box className={clsx(classes.fullSearchWrapper, !isOpen && classes.disabledFullSearch)}>
                <ClickAwayListener
                    onClickAway={(event) => {
                        if (!event.path.includes(rootRef.current)) setIsOpen(false);
                    }}
                >
                    <Paper
                        className={clsx(classes.fullSearch, isOpen && classes.openFullSearch)}
                        elevation={isOpen ? 18 : 0}
                    >
                        <Collapse collapsedHeight={42} in={isOpen}>
                            <Search className={classes.search} inputRef={inputRef} searchService={service} />
                            <Divider />
                            <Tags
                                className={classes.tags}
                                value={service.tags}
                                onChange={(changedTags) => service.updateRequest({ tags: changedTags })}
                            />
                        </Collapse>
                    </Paper>
                </ClickAwayListener>
            </Box>
        </Box>
    );
}

export default observer(SearchBlock);
