import React from 'react';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import { useTheme, fade, makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import FavoriteItem from '@/ui-components/FavoriteItem';
import Explorer from './Explorer';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        height: 620,
        maxHeight: 'inherit',
    },
}));

function Folder(props) {
    const classes = useStyles();
    const {
        id,
        name,
        classes: externalClasses,
        children,
        dense,
    } = props;
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
            iconOpenProps={{ style: { color: fade(theme.palette.text.secondary, 0.23) } }}
            button={(children || dense) && (
                <React.Fragment>
                    {!dense && children}
                    {!children && dense && (
                        <FavoriteItem
                            type="folder"
                            name={name}
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
