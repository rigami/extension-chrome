import React, { useEffect, useState } from 'react';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import { useTheme, alpha, makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { first } from 'lodash';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import FavoriteItem from '@/ui-components/FavoriteItem';
import Explorer from './Explorer';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { BKMS_VARIANT } from '@/enum';
import Image from '@/ui-components/Image';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        height: 620,
        maxHeight: 'inherit',
    },
    dense: {
        background: 'none',
        border: 'none',
    },
    smallIcon: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        borderRadius: theme.shape.borderRadiusButton,
        margin: theme.spacing(0.125),
        fontSize: '0.8rem',
        backgroundColor: '#d1d1d1',
        '& $folderPreviewStub': {
            width: theme.spacing(1.5),
            height: theme.spacing(1.5),
            margin: theme.spacing(0.25),
        },
    },
    folderPreview: {
        width: 40,
        height: 40,
    },
    folderPreviewItems: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(0.25),
    },
    folderPreviewStub: {
        margin: theme.spacing(1),
        color: alpha(theme.palette.text.secondary, 0.23),
    },
}));

function FolderPreview({ id }) {
    const classes = useStyles();
    const workingSpaceService = useWorkingSpaceService();
    const [isSearching, setIsSearching] = useState(true);
    const [folders, setFolders] = useState([]);
    const [findBookmarks, setFindBookmarks] = useState(null);

    useEffect(() => {
        setIsSearching(true);
        let load = true;

        FoldersUniversalService.getFoldersByParent(id)
            .then((foundFolders) => {
                setFolders(foundFolders);
                setIsSearching(load);
                load = false;
            });

        BookmarksUniversalService.getAllInFolder(id)
            .then((searchResult) => {
                setFindBookmarks(searchResult);
                setIsSearching(load);
                load = false;
            });
    }, [workingSpaceService.lastTruthSearchTimestamp]);

    return (
        <Box className={classes.folderPreview}>
            {(isSearching || (folders.length === 0 && findBookmarks.length === 0)) && (
                <FolderIcon className={classes.folderPreviewStub} />
            )}
            {!isSearching && (folders.length !== 0 || findBookmarks.length !== 0) && (
                <Box className={classes.folderPreviewItems}>
                    {findBookmarks.slice(0, 4).map((item) => (
                        <Image
                            key={item.id}
                            src={item.icoUrl}
                            alternativeIcon={first(item.name)?.toUpperCase()}
                            variant={item.icoVariant === BKMS_VARIANT.POSTER ? BKMS_VARIANT.SYMBOL : item.icoVariant}
                            className={classes.smallIcon}
                        />
                    ))}
                    {folders.slice(0, 4 - Math.min(findBookmarks.length, 4)).map((item) => (
                        <Box key={item.id} className={classes.smallIcon}>
                            <FolderIcon className={classes.folderPreviewStub} />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

function Folder(props) {
    const {
        id,
        name,
        classes: externalClasses = {},
        className: externalClassName,
        children,
        dense,
    } = props;
    const classes = useStyles();
    const theme = useTheme();

    return (
        <ButtonWithPopper
            id={id}
            name={name}
            disableMove={id === 1}
            disableRemove={id === 1}
            type="folder"
            iconOpen={FolderIcon}
            classes={externalClasses}
            className={externalClassName}
            iconOpenProps={{ style: { color: alpha(theme.palette.text.secondary, 0.23) } }}
            button={(
                <React.Fragment>
                    {!dense && children}
                    {!dense && !children && (
                        <FolderPreview id={id} />
                    )}
                    {!children && dense && (
                        <FavoriteItem
                            type="folder"
                            name={name}
                            className={classes.dense}
                        />
                    )}
                </React.Fragment>
            )}
        >
            <Box className={classes.root}>
                <Explorer id={id} />
            </Box>
        </ButtonWithPopper>
    );
}

export default Folder;
