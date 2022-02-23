import React, { Fragment, useEffect, useRef } from 'react';
import {
    Box,
    Divider,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    InputBase,
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
import { useWorkingSpaceService } from '@/stores/app/workingSpace';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
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
    tagsListWrapper: {
        position: 'absolute',
        width: 210,
        zIndex: 1,
        bottom: 0,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
    },
    tagsList: {
        overflow: 'auto',
        maxHeight: 220,
    },
    tagSearch: {
        // margin: theme.spacing(1, 0.5),
        width: 'fit-content',
    },
    item: { padding: theme.spacing(0.5, 1.5) },
    tag: {
        margin: theme.spacing(0.375, 0),
        marginRight: theme.spacing(0.5),
    },
    caption: {
        padding: theme.spacing(1, 2),
        color: theme.palette.text.secondary,
        wordBreak: 'break-word',
        whiteSpace: 'normal',
    },
    input: {
        flexGrow: 1,
        // paddingLeft: theme.spacing(0.5),
    },
}));

function TagsFiled({ selectedTags, onChange, className: externalClassName }) {
    const classes = useStyles();
    const { t } = useTranslation(['tag']);
    const workingSpaceService = useWorkingSpaceService();
    const store = useLocalObservable(() => ({
        inputValue: '',
        focus: false,
        tags: selectedTags || [],
        allTags: {},
        isFirstRun: true,
        selectTag: 0,
        isBlock: false,
    }));
    const createTagRef = useRef();
    const selectedTagRef = useRef();
    const inputRef = useRef();

    const filteredTags = filter(
        store.allTags,
        (tag) => tag.name.toLowerCase().indexOf(store.inputValue.toLowerCase()) !== -1 && !store.tags.includes(tag.id),
    );
    const createdTagName = store.inputValue.trim();

    const createTag = (tagName) => {
        store.inputValue = '';

        workingSpaceService.tags.save({ name: tagName })
            .then((tagId) => TagsUniversalService.get(tagId))
            .then((tag) => {
                if (!store.tags.includes(tag.id)) {
                    console.log('[TagsFiled] Create tag:', tag);
                    store.allTags[tag.id] = tag;
                    store.tags = [...store.tags, tag.id];
                }
            })
            .catch((e) => {
                captureException(e);
                // setError(e.message);
            });
    };

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
    }, [workingSpaceService.lastTruthSearchTimestamp]);

    useEffect(() => {
        if (store.selectTag === -1) {
            createTagRef.current?.scrollIntoView({
                block: 'center',
                behavior: 'smooth',
            });
        } else {
            selectedTagRef.current?.scrollIntoView({
                block: 'center',
                behavior: 'smooth',
            });
        }
    }, [selectedTagRef.current, store.selectTag]);

    useEffect(() => {
        store.selectTag = filteredTags.length === 0 && store.inputValue ? -1 : 0;
    }, [filteredTags.length]);

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            {store.tags.map((tagId) => store.allTags[tagId] && (
                <Tag
                    key={tagId}
                    id={tagId}
                    name={store.allTags[tagId].name}
                    colorKey={store.allTags[tagId].colorKey}
                    className={classes.tag}
                    dense
                    onDelete={() => {
                        store.tags = store.tags.filter((cId) => cId !== tagId);
                    }}
                />
            ))}
            {(store.focus) && (
                <Box className={classes.tagsListContainer}>
                    <Paper
                        className={classes.tagsListWrapper}
                        elevation={22}
                        onMouseDown={() => {
                            store.isBlock = true;
                        }}
                        onMouseUp={() => {
                            store.isBlock = false;
                        }}
                    >
                        <Box className={classes.tagsList}>
                            {store.inputValue && (
                                <ListItem
                                    // autoFocus
                                    selected={store.selectTag === -1}
                                    ref={createTagRef}
                                    dense
                                    button
                                    className={classes.item}
                                    onClick={() => { createTag(createdTagName); }}
                                >
                                    <ListItemText
                                        primary={(
                                            <Fragment>
                                                {t('editor.create')}
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
                            {filteredTags.map((tag, index) => (
                                <ListItem
                                    key={tag.id}
                                    selected={store.selectTag === index}
                                    ref={store.selectTag === index ? selectedTagRef : undefined}
                                    dense
                                    button
                                    className={classes.item}
                                    onClick={() => {
                                        if (!store.tags.includes(tag.id)) {
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
                        </Box>
                        <Divider />
                        <Typography variant="caption" className={classes.caption}>
                            Backspace -
                            {' '}
                            {t('editor.caption.backspace')}
                            <br />
                            Up/Down -
                            {' '}
                            {t('editor.caption.arrows')}
                            <br />
                            Enter -
                            {' '}
                            {t('editor.caption.enter')}
                        </Typography>
                    </Paper>
                </Box>
            )}
            <InputBase
                className={classes.input}
                placeholder={t('bookmark:editor.bookmarkTags', { context: 'placeholder' })}
                value={store.inputValue}
                inputRef={inputRef}
                onBlur={() => {
                    if (!store.isBlock) {
                        store.focus = false;
                    } else {
                        setTimeout(() => {
                            inputRef.current.focus();
                        });
                    }
                }}
                onChange={(event) => { store.inputValue = event.currentTarget.value; }}
                onFocus={() => { store.focus = true; }}
                onKeyDown={(event) => {
                    const top = store.inputValue ? -1 : 0;

                    switch (event.code) {
                        case 'Enter':
                            event.preventDefault();
                            event.stopPropagation();
                            if (store.selectTag === -1) {
                                createTag(createdTagName);
                            } else if (
                                filteredTags[store.selectTag]
                                && !store.tags.includes(filteredTags[store.selectTag].id)
                            ) {
                                store.tags = [...store.tags, filteredTags[store.selectTag].id];
                            }
                            break;
                        case 'ArrowDown':
                            event.preventDefault();
                            event.stopPropagation();
                            store.selectTag = store.selectTag >= filteredTags.length - 1 ? top : store.selectTag + 1;
                            break;
                        case 'ArrowUp':
                            event.preventDefault();
                            event.stopPropagation();
                            store.selectTag = store.selectTag <= top ? filteredTags.length - 1 : store.selectTag - 1;
                            break;
                        case 'Backspace':
                            if (store.inputValue.length === 0) {
                                event.preventDefault();
                                event.stopPropagation();
                                store.tags = store.tags.slice(0, -1);
                            }
                            break;
                        default:
                            break;
                    }
                }}
            />
        </Box>
    );
}

export default observer(TagsFiled);
