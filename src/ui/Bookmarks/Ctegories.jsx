import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Chip,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import clsx from 'clsx';
import CreateCategoryButton from './CreateCategoryButton';
import EditMenu from "@/ui/Bookmarks/ContextEditMenu";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
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
}));

function Category({ id, name, color, onClick, isSelect }) {
    const classes = useStyles();
    const theme = useTheme();
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [position, setPosition] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        setPosition({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
        setIsOpenMenu(true);
    };

    const handleCloseMenu = () => {
        setIsOpenMenu(false);
    };

    return (
        <React.Fragment>
            <EditMenu
                id={id}
                type="category"
                isOpen={isOpenMenu}
                onClose={handleCloseMenu}
                position={position}
                onEdit={(edit) => {
                    edit({ anchorEl });
                }}
            />
            <Chip
                key={id}
                ref={anchorEl}
                icon={<div className={classes.chipIcon} style={{ backgroundColor: color }} />}
                label={name}
                className={clsx(classes.chip, isSelect && classes.chipActive)}
                style={{
                    backgroundColor: isSelect && fade(color, 0.14),
                    borderColor: isSelect && color,
                }}
                variant="outlined"
                onClick={onClick}
                onContextMenu={(event) => {
                    setAnchorEl(event.currentTarget);
                    handlerContextMenu(event);
                }}
            />
        </React.Fragment>
    );
}

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

        onChange(selectedCategories);
    }, [selectedCategories.length]);

    useEffect(() => {
        if (isFirstRun.current) return;

        if (value) setSelectedCategories(value || []);
    }, [value && value.length]);

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            {bookmarksStore.categories.map(({ id, name, color }) => (
                <Category
                    key={id}
                    id={id}
                    name={name}
                    color={color}
                    isSelect={selectedCategories.indexOf(id) !== -1}
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
                    if (autoSelect) setSelectedCategories([...selectedCategories, newId]);
                    if (onCreate) onCreate(newId);
                }}
            />
        </Box>
    );
}

export default observer(Categories);
