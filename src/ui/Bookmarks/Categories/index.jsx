import React, { useEffect, useState, useRef } from 'react';
import { Box, Chip } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, fade } from '@material-ui/core/styles';
import { ArrowBackRounded as ArrowIcon } from '@material-ui/icons';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import clsx from 'clsx';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import CollapseWrapper from '@/ui/Bookmarks/Categories/CollapseWrapper';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';
import AddButton from './AddButton';

const useStyles = makeStyles((theme) => ({
    root: {
        overflow: 'auto',
        maxHeight: 130,
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        maxWidth: 290,
        boxShadow: 'none !important',
    },
    chipIcon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        borderRadius: '50%',
        marginLeft: `${theme.spacing(1)}px !important`,
        flexShrink: 0,
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

function Category(props) {
    const {
        id,
        name,
        color,
        onClick,
        isSelect,
        className: externalClassName,
    } = props;
    const classes = useStyles();
    const appService = useAppService();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();

    const repairColor = color || '#000';

    const contextMenu = (event) => [
        pin({
            itemId: id,
            itemType: 'category',
            t,
            bookmarksService,
        }),
        edit({
            itemId: id,
            itemType: 'category',
            t,
            coreService,
            anchorEl: event.currentTarget,
        }),
        remove({
            itemId: id,
            itemType: 'category',
            t,
            coreService,
        }),
    ];

    return (
        <Chip
            key={id}
            icon={<div className={classes.chipIcon} style={{ backgroundColor: repairColor }} />}
            label={name}
            className={clsx(classes.chip, isSelect && classes.chipActive, externalClassName)}
            style={{
                backgroundColor: isSelect && fade(repairColor, 0.14),
                borderColor: isSelect && repairColor,
            }}
            variant="outlined"
            onClick={onClick}
            onContextMenu={appService?.contextMenu?.(contextMenu)}
        />
    );
}

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
            key={id}
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
