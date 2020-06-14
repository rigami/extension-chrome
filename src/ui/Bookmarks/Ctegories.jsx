import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Chip,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import clsx from 'clsx';
import CreateCategoryButton from './CreateCategoryButton';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
    },
    chipIcon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        borderRadius: '50%',
        marginLeft: `${theme.spacing(1)}px !important`,
    },
    chipActive: {
        backgroundColor: '#616161',
        borderColor: '#616161',
        '&:focus': {
            backgroundColor: '#616161 !important',
            borderColor: '#616161',
        },
        '&:hover': {
            backgroundColor: '#888888 !important',
            borderColor: '#888888',
        },
    },
}));

function Categories(props) {
    const {
        value,
        onChange,
        className: externalClassName,
        onCreate,
        autoSelect = false,
    } = props;
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        console.log("ON CHANGE", selectedCategories);

        onChange(selectedCategories);
    }, [selectedCategories.length]);

    useEffect(() => {
        if (isFirstRun.current) return;

        if (value) setSelectedCategories(value || []);
    }, [value && value.length]);

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            {bookmarksStore.categories.map(({ id, name, color }) => (
                <Chip
                    key={id}
                    icon={<div className={classes.chipIcon} style={{ backgroundColor: color }} />}
                    label={name}
                    className={(selectedCategories.indexOf(id) !== -1 && classes.chipActive) || ''}
                    variant="outlined"
                    onClick={() => {
                        if (~selectedCategories.indexOf(id)) {
                            setSelectedCategories(selectedCategories.filter((cId) => cId !== id));
                        } else {
                            setSelectedCategories([...selectedCategories, id]);
                        }
                    }}
                />
            ))}
            <CreateCategoryButton
                isShowTitle={bookmarksStore.categories.length === 0}
                onCreate={(newId) => {
                    console.log("CREATE", newId);
                    if (autoSelect) setSelectedCategories([...selectedCategories, newId]);
                    if (onCreate) onCreate(newId);
                }}
            />
        </Box>
    );
}

export default observer(Categories);
