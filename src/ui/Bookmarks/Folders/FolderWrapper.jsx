import React, { useEffect, useRef, useState } from 'react';
import {
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Tooltip,
    Box, Breadcrumbs, Typography, Container, Link
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    FolderRounded as FolderIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import useBookmarksService from '@/stores/BookmarksProvider';
import useCoreService from '@/stores/BaseStateProvider';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import FolderCard from '@/ui/Bookmarks/Folders/Card';
import clsx from 'clsx';
import Category from '../Categories/CtegoryWrapper';
import CardLink from '../CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';

const useStyles = makeStyles((theme) => ({
    root: {
        '&:hover $actions': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    container: {
        marginTop: theme.spacing(3),
        listStyle: 'none',
    },
    text: { maxWidth: 700 },
    title: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    description: {
        display: '-webkit-box',
        overflow: 'hidden',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 3,
    },
    actions: {
        opacity: 0,
        pointerEvents: 'none',
    },
    bookmarksWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    folderMarginRight: {
        marginRight: theme.spacing(2),
    },
    folderMarginBottom: {
        marginBottom: theme.spacing(2),
    },
    bookmarksBlock: {
        width: '100%',
        display: 'flex',
    },
}));

function FolderWrapper({ folder, onSelect, children }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const foldersService = bookmarksService.folders;
    const [path, setPath] = useState(t('loading'));
    const [folders, setFolders] = useState([]);
    const [findBookmarks, setFindBookmarks] = useState(null);

    useEffect(() => {
        if (folder?.id) {
            foldersService.getPath(folder?.id)
                .then((folderPath) => setPath(folderPath));

            foldersService.getFoldersByParent(folder?.id)
                .then((foundFolders) => {
                    setFolders(foundFolders)
                });

            bookmarksService.bookmarks.getAllInFolder(folder?.id)
                .then((searchResult) => {
                    console.log('searchResult', searchResult)
                    setFindBookmarks(searchResult);
                });
        }
    }, [folder?.id]);


    let columnStabilizer = [...Array.from({ length: coreService.storage.temp.columnsCount }, () => 0)];

    return (
        <Box className={classes.root}>
            <ListItem
                disableGutters
                component="div"
                classes={{
                    root: classes.root,
                    container: classes.container,
                }}
            >
                <ListItemIcon style={{ minWidth: 36 }}>
                    <FolderIcon style={{  }} />
                </ListItemIcon>
                <ListItemText
                    classes={{
                        root: classes.text,
                        primary: classes.title,
                        secondary: classes.description,
                    }}
                    primary={(folder && Array.isArray(path) && (
                        <Breadcrumbs>
                            {path.map(({ name, id }, index) => index === path.length - 1 ? (
                                <Typography
                                    key={id}
                                    color="textPrimary"
                                >
                                    {name}
                                </Typography>
                            ) : (
                                <Link
                                    key={id}
                                    color="textSecondary"
                                    href="/"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        onSelect(id);
                                    }}
                                >
                                    {name}
                                </Link>
                            ))}
                        </Breadcrumbs>
                    )) || (folder && path) || (
                        <Typography className={classes.notSelect}>
                            {t('folder.unknownFolder')}
                        </Typography>
                    )}
                />
            </ListItem>
            <Box className={classes.bookmarksWrapper}>
                {folders.map((folder, index) => (
                    <FolderCard
                        key={folder.id}
                        name={folder.name}
                        className={clsx(
                            classes.folderMarginBottom,
                            (index + 1) % coreService.storage.temp.columnsCount && classes.folderMarginRight,
                        )}
                        onClick={() => onSelect(folder.id)}
                    />
                ))}
                <Box className={classes.bookmarksBlock}>
                    {findBookmarks && findBookmarks.length === 0 && (
                        <FullScreenStub
                            message={t('bookmark.noBookmarks.title')}
                            description={t('bookmark.noBookmarks.description')}
                        />
                    )}
                    {findBookmarks && findBookmarks.reduce((acc, curr) => {
                        let column = 0;
                        columnStabilizer.forEach((element, index) => {
                            if (columnStabilizer[column] > element) column = index;
                        });

                        columnStabilizer[column] += curr.type === 'extend' ? 0.8 : 0.6;
                        columnStabilizer[column] += Math.min(
                            Math.ceil(curr.name.length / 15),
                            2,
                        ) * 0.2 || 0.4;
                        columnStabilizer[column] += (
                            curr.description
                            && Math.min(Math.ceil(curr.description.length / 20), 4) * 0.17
                        ) || 0;
                        columnStabilizer[column] += 0.12;

                        if (typeof acc[column] === 'undefined') acc[column] = [];

                        acc[column].push(curr);

                        return acc;
                    }, [])
                        .map((column, index, arr) => (
                            <Box
                                style={{
                                    marginRight: theme.spacing(
                                        arr.length - 1 !== index ? 2 : 0,
                                    ),
                                }}
                                key={index}
                            >
                                {column.map((card) => (
                                    <CardLink
                                        id={card.id}
                                        name={card.name}
                                        url={card.url}
                                        categories={card.categories}
                                        icoVariant={card.icoVariant}
                                        description={card.description}
                                        imageUrl={card.imageUrl}
                                        key={card.id}
                                        style={{ marginBottom: theme.spacing(2) }}
                                    />
                                ))}
                            </Box>
                        ))}
                </Box>
            </Box>
        </Box>
    );
}

export default observer(FolderWrapper);
