import { Box, CardActionArea, Typography } from '@material-ui/core';
import { SearchRounded as SearchIcon } from '@material-ui/icons';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { makeStyles, alpha } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { ExtendButtonGroup } from '@/ui-components/ExtendButton';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import Tag from '@/ui/Bookmarks/Tag';
import Collapser from '@/ui/Bookmarks/Tag/Collapser';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'relative',
        zIndex: 2,
        // border: '1px solid transparent',
        backdropFilter: 'none',
        // backgroundColor: alpha(theme.palette.background.backdrop, 0.52),
    },
    icon: {
        width: 22,
        height: 22,
        margin: theme.spacing(1 - 0.125),
        color: theme.palette.text.secondary,
    },
    placeholder: {
        width: '100%',
        textAlign: 'center',
        fontSize: '1rem',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        color: theme.palette.text.secondary,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'flex-start',
    },
    alignFix: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    tags: { padding: theme.spacing(1.5) },
    query: {
        fontSize: '1rem',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        color: theme.palette.text.primary,
        letterSpacing: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    rows: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1,
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 36,
        overflow: 'hidden',
        marginTop: theme.spacing(-1),
        paddingRight: theme.spacing(1),
        '&:first-child': {
            marginTop: 0,
            paddingRight: theme.spacing(5),
        },
    },
    tag: {
        marginRight: theme.spacing(1),
        flexShrink: 0,
        /* '& div': {
            opacity: '60%',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 8,
            flexShrink: 0,
        },
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0, */
    },
    tagSmall: {
        '& div': { marginRight: 0 },
        fontSize: 0,
        marginRight: 4,
    },
    tagsWrapper: { flexGrow: 1 },
}));

function Preview(props) {
    const {
        query,
        tags: tagsIds,
        onClick,
        ...other
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        if (!tagsIds) {
            setTags([]);
            return;
        }

        Promise.all(tagsIds.map((tagId) => TagsUniversalService.get(tagId)))
            .then((fullTags) => setTags(fullTags));
    }, [tagsIds]);

    return (
        <ExtendButtonGroup className={classes.root} variant="outline" {...other}>
            <CardActionArea
                className={classes.alignFix}
                onClick={onClick}
            >
                <SearchIcon className={classes.icon} />
                <Box className={classes.rows}>
                    {query && (
                        <Box className={classes.row}>
                            <Typography variant="caption" className={classes.query}>
                                {query}
                            </Typography>
                        </Box>
                    )}
                    {tagsIds && (
                        <Box className={classes.row}>
                            <Collapser className={classes.tagsWrapper}>
                                {tags.map((tag) => (
                                    <Tag
                                        key={tag.id}
                                        className={classes.tag}
                                        dense
                                        name={tag.name}
                                        colorKey={tag.colorKey}
                                    />
                                ))}
                            </Collapser>
                        </Box>
                    )}
                </Box>
                {(!query && !tagsIds) && (
                    <Typography
                        variant="caption"
                        className={classes.placeholder}
                    >
                        {t('search.bookmarks', { context: 'placeholder' })}
                    </Typography>
                )}
            </CardActionArea>
        </ExtendButtonGroup>
    );
}

export default Preview;
