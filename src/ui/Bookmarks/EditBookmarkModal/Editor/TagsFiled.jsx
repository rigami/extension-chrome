import React, { Fragment, useEffect } from 'react';
import {
    Box, Divider,
    InputAdornment, ListItem, ListItemText,
    Paper,
    TextField,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { filter } from 'lodash';
import { captureException } from '@sentry/react';
import { runInAction } from 'mobx';
import Tag from '../../Tag';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import useBookmarksService from '@/stores/app/BookmarksProvider';

const useStyles = makeStyles((theme) => ({
    content: { flex: '1 0 auto' },
    header: { marginBottom: theme.spacing(1) },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflow: 'auto',
    },
    input: { marginTop: theme.spacing(2) },
    inputDescription: { marginTop: theme.spacing(2) },
    addDescriptionButton: { marginTop: theme.spacing(2) },
    saveIcon: { marginRight: theme.spacing(1) },
    identBlock: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
    folderPicker: { marginRight: 'auto' },
    identBlockIcon: { marginRight: theme.spacing(1) },
    identBlockIconTopAlign: {
        height: theme.spacing(4),
        alignSelf: 'flex-start',
    },
    tagsListContainer: { position: 'relative' },
    tagsList: {
        position: 'absolute',
        overflow: 'auto',
        width: 210,
        maxHeight: 220,
        zIndex: 1,
        bottom: 0,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`,
    },
    tagSearch: {
        // margin: theme.spacing(1, 0.5),
        width: 'fit-content',
    },
    item: { padding: theme.spacing(0.5, 1.5) },
    tag: { marginRight: theme.spacing(0.5) },
}));

function TagsFiled({ selectedTags, onChange, className: externalClassName }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        inputValue: '',
        focus: false,
        tags: selectedTags || [],
        allTags: {},
        isFirstRun: true,
    }));

    useEffect(() => {
        if (store.isFirstRun) return;

        if (selectedTags) store.tags = selectedTags || [];
    }, [selectedTags && selectedTags.length]);

    useEffect(() => {
        if (store.isFirstRun) {
            store.isFirstRun = false;
            return;
        }

        onChange(store.tags.slice());
    }, [store.tags.length]);

    useEffect(() => {
        console.log('[TagsFiled] Re calc tags');
        TagsUniversalService.getAll()
            .then((allTags) => {
                runInAction(() => {
                    store.allTags = {};
                    allTags.forEach((tag) => {
                        store.allTags[tag.id] = tag;
                    });
                });
            });
    }, [bookmarksService.lastTruthSearchTimestamp]);

    const filteredTags = filter(
        store.allTags,
        (tag) => tag.name.toLowerCase().indexOf(store.inputValue.toLowerCase()) !== -1 && !store.tags.includes(tag.id),
    );
    const createdTagName = store.inputValue.trim();

    return (
        <TextField
            label={t('editor.bookmarkTags')}
            variant="outlined"
            size="small"
            className={clsx(externalClassName)}
            InputLabelProps={{ shrink: Boolean(selectedTags.length || store.inputValue || store.focus) }}
            fullWidth
            value={store.inputValue}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        {store.tags.map((tagId) => store.allTags[tagId] && (
                            <Tag
                                key={tagId}
                                id={tagId}
                                name={store.allTags[tagId].name}
                                colorKey={store.allTags[tagId].colorKey}
                                className={classes.tag}
                                dense
                            />
                        ))}
                        {(createdTagName !== '' || store.focus) && (
                            <Box className={classes.tagsListContainer}>
                                <Paper className={classes.tagsList} elevation={22}>
                                    {store.inputValue && (
                                        <ListItem
                                            autoFocus
                                            dense
                                            button
                                            className={classes.item}
                                            onClick={() => {
                                                bookmarksService.tags.save({ name: createdTagName })
                                                    .then((tagId) => TagsUniversalService.get(tagId))
                                                    .then((tag) => {
                                                        console.log('[TagsFiled] Create tag:', tag);
                                                        store.allTags[tag.id] = tag;
                                                        store.tags = [...store.tags, tag.id];
                                                        store.inputValue = '';
                                                    })
                                                    .catch((e) => {
                                                        captureException(e);
                                                        // setError(e.message);
                                                    });
                                            }}
                                        >
                                            <ListItemText
                                                primary={(
                                                    <Fragment>
                                                        Создать тег
                                                        <Tag
                                                            id={null}
                                                            name={store.inputValue}
                                                            colorKey={null}
                                                            className={classes.tagSearch}
                                                            dense
                                                        />
                                                    </Fragment>
                                                )}
                                            />
                                        </ListItem>
                                    )}
                                    {createdTagName !== '' && filteredTags.length !== 0 && (<Divider />)}
                                    {filteredTags.map((tag) => (
                                        <ListItem
                                            key={tag.id}
                                            dense
                                            button
                                            className={classes.item}
                                            onClick={() => {
                                                if (store.tags.includes(tag.id)) {
                                                    store.tags = store.tags.filter((cId) => cId !== tag.id);
                                                } else {
                                                    store.tags = [...store.tags, tag.id];
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={(
                                                    <Tag
                                                        key={tag.id}
                                                        id={tag.id}
                                                        name={tag.name}
                                                        colorKey={tag.colorKey}
                                                        className={classes.tagSearch}
                                                        dense
                                                    />
                                                )}
                                            />
                                        </ListItem>
                                    ))}
                                </Paper>
                            </Box>
                        )}
                    </InputAdornment>
                ),
                // onBlur: () => { store.focus = false; },
                onChange: (event) => { store.inputValue = event.currentTarget.value; },
                onFocus: () => { store.focus = true; },
            }}
        />
    );
}

export default observer(TagsFiled);
