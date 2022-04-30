import React, {
    Fragment,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import {
    Box,
    Divider,
    ListItem,
    ListItemText,
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
import Scrollbar from '@/ui-components/CustomScroll';
import Tag from '../../Tag';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import { useHotKeysService } from '@/stores/app/hotKeys';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    content: { flex: '1 0 auto' },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    tagsListWrapper: {
        display: 'flex',
        flexDirection: 'column',
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
    scrollContainer: { maxHeight: 220 },
    scrollScrollContent: {
        width: '100%',
        display: 'block !important',
    },
    tagsSelectorPaper: { overflow: 'hidden' },
    emptyTags: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

function TagSelector({ store: upStore, onCreateTag, onSelectTag, ...props }) {
    const classes = useStyles();
    const { t } = useTranslation(['tag']);
    const hotKeysService = useHotKeysService();
    const store = useLocalObservable(() => ({
        tags: upStore.selectedTags || [],
        selectTag: 0,
    }));
    const createTagRef = useRef();
    const selectedTagRef = useRef();

    const createdTagName = upStore.inputValue.trim();

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
        if (upStore.filteredTags.length === 0 && upStore.inputValue) {
            store.selectTag = -1;
        } else {
            store.selectTag = Math.max(Math.min(store.selectTag, upStore.filteredTags.length - 1), 0);
        }
    }, [upStore.filteredTags.length]);

    useEffect(() => {
        const hotKeysListeners = [];

        hotKeysListeners.push(hotKeysService.on(['Enter'], () => {
            console.log('Enter');

            if (store.selectTag === -1) {
                onCreateTag(upStore.inputValue.trim());
            } else if (
                upStore.filteredTags[store.selectTag]
                && !store.tags.includes(upStore.filteredTags[store.selectTag].id)
            ) {
                onSelectTag(upStore.filteredTags[store.selectTag]);
            }
        }));

        hotKeysListeners.push(hotKeysService.on(['ArrowUp'], () => {
            const top = upStore.inputValue ? -1 : 0;
            console.log('ArrowUp');
            store.selectTag = store.selectTag <= top ? upStore.filteredTags.length - 1 : store.selectTag - 1;
        }));

        hotKeysListeners.push(hotKeysService.on(['ArrowDown'], () => {
            const top = upStore.inputValue ? -1 : 0;
            console.log('ArrowDown');
            store.selectTag = store.selectTag >= upStore.filteredTags.length - 1 ? top : store.selectTag + 1;
        }));

        return () => {
            hotKeysListeners.forEach((listener) => hotKeysService.removeListener(listener));
        };
    }, []);

    console.log('selecctor props:', props);

    return (
        <Box className={classes.tagsListWrapper} {...props}>
            <Scrollbar
                classes={{
                    root: classes.scrollContainer,
                    content: classes.scrollScrollContent,
                }}
                translateContentSizeYToHolder
            >
                {createdTagName && (
                    <ListItem
                        // autoFocus
                        selected={store.selectTag === -1}
                        ref={createTagRef}
                        dense
                        button
                        className={classes.item}
                        onClick={() => { onCreateTag(createdTagName); }}
                    >
                        <ListItemText
                            primary={(
                                <Fragment>
                                    {t('editor.create')}
                                    <Tag
                                        id={null}
                                        name={upStore.inputValue}
                                        colorKey={null}
                                        className={classes.tagSearch}
                                        dense
                                    />
                                </Fragment>
                            )}
                        />
                    </ListItem>
                )}
                {createdTagName === '' && upStore.filteredTags.length === 0 && (
                    <ListItem
                        dense
                        className={classes.item}
                    >
                        <ListItemText
                            primary={(
                                <Fragment>
                                    {t('editor.noTags')}
                                </Fragment>
                            )}
                            classes={{ primary: classes.emptyTags }}
                        />
                    </ListItem>
                )}
                {createdTagName !== '' && upStore.filteredTags.length !== 0 && (<Divider />)}
                {upStore.filteredTags.map((tag, index) => (
                    <ListItem
                        key={tag.id}
                        selected={store.selectTag === index}
                        ref={store.selectTag === index ? selectedTagRef : undefined}
                        dense
                        button
                        className={classes.item}
                        onClick={() => {
                            onSelectTag(tag);
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
            </Scrollbar>
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
        </Box>
    );
}

const ObserverTagSelector = observer(TagSelector);

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
    const inputRef = useRef();

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

    const renderTagsSelector = useCallback((data = {}, position, close) => (
        <ObserverTagSelector
            store={store}
            onCreateTag={(name) => {
                createTag(name);
            }}
            onSelectTag={(tag) => {
                if (!store.tags.includes(tag.id)) {
                    store.tags = [...store.tags, tag.id];
                }
            }}
            onMouseDown={() => {
                store.isBlock = true;
            }}
            onMouseUp={() => {
                store.isBlock = false;
            }}
        />
    ), []);

    const {
        dispatchPopover: tagSelectorDispatcher,
        close: closePopover,
    } = useContextPopoverDispatcher(renderTagsSelector, {
        nonBlockEventsBackdrop: true,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
        classes: { paper: classes.tagsSelectorPaper },
    });

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
        store.filteredTags = filter(
            store.allTags,
            (tag) => (
                tag.name.toLowerCase().indexOf(store.inputValue.toLowerCase()) !== -1
                && !store.tags.includes(tag.id)
            ),
        );
    }, [store.inputValue, store.tags, store.allTags]);

    useEffect(() => {
        if (store.focus) {
            tagSelectorDispatcher(null, inputRef);
        } else {
            closePopover();
        }
    }, [store.focus]);

    useEffect(() => () => closePopover(), []);

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
                onFocus={() => {
                    store.focus = true;
                }}
                onKeyDown={(event) => {
                    if (event.code === 'Backspace' && store.inputValue.length === 0) {
                        event.preventDefault();
                        event.stopPropagation();
                        store.tags = store.tags.slice(0, -1);
                    } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
                        event.preventDefault();
                    }
                }}
            />
        </Box>
    );
}

export default observer(TagsFiled);
