import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
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
    tag: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        maxWidth: `calc(100% - ${theme.spacing(1)}px)`,
    },
}));

function Tags(props) {
    const {
        value,
        onlyFavorites = false,
        autoSelect = false,
        usePopper = false,
        expandAlways = false,
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

    useEffect(() => {
        if (isFirstRun.current) return;

        if (value) setSelectedTags(value || []);
    }, [value && value.length]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        onChange(selectedTags);
    }, [selectedTags.length]);

    useEffect(() => {
        TagsUniversalService.getAll()
            .then((allTags) => {
                setTags(allTags);
            });
    }, [bookmarksService.lastTruthSearchTimestamp, onlyFavorites]);

    const AddTag = () => (
        <React.Fragment>
            <AddButton
                isShowTitle={tags.length === 0}
                onCreate={(newId) => {
                    if (autoSelect) setSelectedTags([...selectedTags, newId]);
                    if (onCreate) onCreate(newId);
                }}
            />
        </React.Fragment>
    );

    if (expandAlways) {
        return (
            <Box className={clsx(classes.root, externalClassName)}>
                {tags.map(({ id, name, color }) => (
                    <Tag
                        key={id}
                        id={id}
                        name={name}
                        color={color}
                        className={classes.tag}
                        isSelect={selectedTags.includes(id)}
                        onClick={() => {
                            if (selectedTags.includes(id)) {
                                setSelectedTags(selectedTags.filter((cId) => cId !== id));
                            } else {
                                setSelectedTags([...selectedTags, id]);
                            }
                        }}
                    />
                ))}
                <AddTag />
            </Box>
        );
    }

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            <CollapseWrapper
                list={tags}
                renderComponent={({ id, name, color, className }) => (
                    <Tag
                        id={id}
                        name={name}
                        color={color}
                        className={className}
                        isSelect={selectedTags.includes(id)}
                        onClick={() => {
                            if (selectedTags.includes(id)) {
                                setSelectedTags(selectedTags.filter((cId) => cId !== id));
                            } else {
                                setSelectedTags([...selectedTags, id]);
                            }
                        }}
                    />
                )}
                expandButtonLabel={t('button.showAll')}
                collapseButtonLabel={t('button.showLess')}
                actions={(<AddTag />)}
                usePopper={usePopper}
            />
        </Box>
    );
}

export default observer(Tags);
