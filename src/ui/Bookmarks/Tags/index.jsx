import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowBackRounded as ArrowIcon } from '@material-ui/icons';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import CollapseWrapper from '@/ui/Bookmarks/Tags/CollapseWrapper';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import AddButton from './AddButton';
import Tag from './Chip';

const useStyles = makeStyles((theme) => ({
    root: {
        overflow: 'auto',
        maxHeight: 130,
        display: 'flex',
        flexWrap: 'wrap',
    },
    arrowBlock: {
        marginLeft: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.secondary,
        '& svg': {
            verticalAlign: 'middle',
            marginRight: theme.spacing(1),
        },
    },
}));

function Tags(props) {
    const {
        value,
        onlyFavorites = false,
        autoSelect = false,
        usePopper = false,
        className: externalClassName,
        onCreate,
        onChange,
    } = props;
    const { t } = useTranslation(['tag']);
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const [selectedTags, setSelectedTags] = useState(value || []);
    const [tags, setTags] = useState(() => []);
    const isFirstRun = useRef(true);

    const filterTags = (tagsList) => {
        if (onlyFavorites) {
            return tagsList.filter(({ id }) => bookmarksService.findFavorite({
                itemId: id,
                itemType: 'tag',
            }));
        } else {
            return tagsList;
        }
    };

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        onChange(selectedTags);
    }, [selectedTags.length]);

    useEffect(() => {
        if (isFirstRun.current) return;

        if (value) setSelectedTags(value || []);
    }, [value && value.length]);

    useEffect(() => {
        TagsUniversalService.getAll()
            .then((allTags) => {
                setTags(filterTags(allTags).sort((tagA, tagB) => {
                    const isFavoriteA = bookmarksService.findFavorite({
                        itemId: tagA.id,
                        itemType: 'tag',
                    });
                    const isFavoriteB = bookmarksService.findFavorite({
                        itemId: tagB.id,
                        itemType: 'tag',
                    });

                    if (isFavoriteA && !isFavoriteB) return -1;
                    else if (!isFavoriteA && isFavoriteB) return 1;

                    return 0;
                }));
                setSelectedTags(filterTags(selectedTags.map((id) => ({ id }))).map(({ id }) => id));
            });
    }, [bookmarksService.lastTruthSearchTimestamp, onlyFavorites]);

    const renderTag = ({ id, name, color, className }) => (
        <Tag
            id={id}
            name={name}
            color={color}
            className={className}
            isSelect={selectedTags.indexOf(id) !== -1}
            onClick={() => {
                if (~selectedTags.indexOf(id)) {
                    setSelectedTags(selectedTags.filter((cId) => cId !== id));
                } else {
                    setSelectedTags([...selectedTags, id]);
                }
            }}
        />
    );

    const AddTag = () => (
        <React.Fragment>
            <AddButton
                isShowTitle={tags.length === 0}
                onCreate={(newId) => {
                    if (autoSelect) setSelectedTags([...selectedTags, newId]);
                    if (onCreate) onCreate(newId);
                }}
            />
            {tags.length === 0 && (
                <Box className={classes.arrowBlock}>
                    <ArrowIcon />
                    {t('button.add', { context: 'first' })}
                </Box>
            )}
        </React.Fragment>
    );

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            <CollapseWrapper
                list={tags}
                renderComponent={renderTag}
                expandButtonLabel={t('button.showAll')}
                collapseButtonLabel={t('button.showLess')}
                actions={(<AddTag />)}
                usePopper={usePopper}
            />
        </Box>
    );
}

export default observer(Tags);
