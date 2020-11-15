import React, { useEffect, useState, useRef } from 'react';
import { Box, Chip } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, fade } from '@material-ui/core/styles';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
    ArrowBackRounded as ArrowIcon,
} from '@material-ui/icons';
import useBookmarksService from '@/stores/BookmarksProvider';
import clsx from 'clsx';
import useCoreService from '@/stores/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import AddButton from './AddButton';
import CollapseWrapper from '@/ui/Bookmarks/Categories/CollapseWrapper';

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
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();

    const isPin = () => bookmarksService.favorites.find((fav) => fav.type === 'category' && fav.id === id);

    const handlerContextMenu = (event, anchorEl) => {
        event.preventDefault();
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksService.removeFromFavorites({
                                type: 'category',
                                id,
                            });
                        } else {
                            bookmarksService.addToFavorites({
                                type: 'category',
                                id,
                            });
                        }
                    },
                },
                {
                    type: 'button',
                    title: t('edit'),
                    icon: EditIcon,
                    onClick: () => {
                        coreService.localEventBus.call('category/edit', {
                            id,
                            anchorEl,
                        });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        coreService.localEventBus.call('category/remove', { id });
                    },
                },
            ],
            position: {
                top: event.nativeEvent.clientY,
                left: event.nativeEvent.clientX,
            },
        });
    };

    return (
        <Chip
            key={id}
            icon={<div className={classes.chipIcon} style={{ backgroundColor: color }} />}
            label={name}
            className={clsx(classes.chip, isSelect && classes.chipActive, externalClassName)}
            style={{
                backgroundColor: isSelect && fade(color, 0.14),
                borderColor: isSelect && color,
            }}
            variant="outlined"
            onClick={onClick}
            onContextMenu={(event) => handlerContextMenu(event, event.currentTarget)}
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
        oneRow,
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

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            <CollapseWrapper
                list={bookmarksService.categories.all}
                renderComponent={({ id, name, color, className }) => (
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
                )}
                expandButtonLabel="Показать все"
                collapseButtonLabel="Свернуть"
                actions={(
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
                )}
            />
        </Box>
    );
}

export default observer(Categories);
