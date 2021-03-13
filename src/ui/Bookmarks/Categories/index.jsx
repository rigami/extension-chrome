import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowBackRounded as ArrowIcon } from '@material-ui/icons';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import CollapseWrapper from '@/ui/Bookmarks/Categories/CollapseWrapper';
import AddButton from './AddButton';
import Category from './Chip';

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

function Categories(props) {
    const {
        value,
        onChange,
        className: externalClassName,
        onCreate,
        autoSelect = false,
        usePopper = false,
    } = props;
    const { t } = useTranslation();
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        onChange(selectedCategories);
    }, [selectedCategories.length]);

    useEffect(() => {
        if (isFirstRun.current) return;

        if (value) setSelectedCategories(value || []);
    }, [value && value.length]);

    const renderCategory = ({ id, name, color, className }) => (
        <Category
            id={id}
            name={name}
            color={color}
            className={className}
            isSelect={selectedCategories.indexOf(id) !== -1}
            onClick={() => {
                if (~selectedCategories.indexOf(id)) {
                    setSelectedCategories(selectedCategories.filter((cId) => cId !== id));
                } else {
                    setSelectedCategories([...selectedCategories, id]);
                }
            }}
        />
    );

    const AddCategory = () => (
        <React.Fragment>
            <AddButton
                isShowTitle={bookmarksService.categories.length === 0}
                onCreate={(newId) => {
                    if (autoSelect) setSelectedCategories([...selectedCategories, newId]);
                    if (onCreate) onCreate(newId);
                }}
            />
            {bookmarksService.categories.all.length === 0 && (
                <Box className={classes.arrowBlock}>
                    <ArrowIcon />
                    {t('category.createFirstHelper')}
                </Box>
            )}
        </React.Fragment>
    );

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            <CollapseWrapper
                list={bookmarksService.categories.all}
                renderComponent={renderCategory}
                expandButtonLabel="Показать все"
                collapseButtonLabel="Свернуть"
                actions={(<AddCategory />)}
                usePopper={usePopper}
            />
        </Box>
    );
}

export default observer(Categories);
