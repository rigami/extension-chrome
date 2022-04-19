import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';
import Tag from '../WorkingSpace/Tag';

const useStyles = makeStyles((theme) => ({
    root: {
        overflow: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
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
        className: externalClassName,
        onChange,
    } = props;
    const classes = useStyles();
    const workingSpaceService = useWorkingSpaceService();
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
    }, [workingSpaceService.lastTruthSearchTimestamp, onlyFavorites]);

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            {tags.map(({ id, name, colorKey }) => (
                <Tag
                    key={id}
                    id={id}
                    name={name}
                    colorKey={colorKey}
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
        </Box>
    );
}

export default observer(Tags);
