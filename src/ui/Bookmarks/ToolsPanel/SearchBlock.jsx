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
import Search from './Search';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        width: '100%',
        maxWidth: 600,
        minWidth: 240,
        height: 42,
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
    },
    alignFix: {
        display: 'flex',
        alignItems: 'center',
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
    },
    resetIconWrapper: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 'inherit',
        zIndex: 3,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    resetIcon: {
        padding: Math.sqrt(882) - 12,
        margin: -(Math.sqrt(882) - 21),
        marginLeft: 0,
    },
}));

function SearchBlock({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef();
    const inputRef = useRef();

    const handleKeyDown = (event) => {
        console.log(event);

        if (event.code === 'Escape') setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) window.addEventListener('keydown', handleKeyDown, true);

        return () => {
            if (isOpen) window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    return (
        <Box className={classes.wrapper} ref={rootRef}>
            {service.query && (
                <Box className={classes.resetIconWrapper}>
                    <IconButton
                        className={classes.resetIcon}
                        size="medium"
                        onClick={() => {
                            service.updateRequest({ query: '' });
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
                        {service.query && (
                            <Typography variant="caption" className={classes.query}>
                                {service.query}
                                {' '}
                                или
                                {' '}
                                {service.tags.map((name) => name).join('; ')}
                            </Typography>
                        )}
                        {!service.query && (
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
                            <Search inputRef={inputRef} searchService={service} />
                            <Divider />
                            <Tags
                                className={classes.tags}
                                value={service.tags}
                                onChange={(tags) => service.updateRequest({ tags })}
                            />
                        </Collapse>
                    </Paper>
                </ClickAwayListener>
            </Box>
        </Box>
    );
}

export default observer(SearchBlock);
