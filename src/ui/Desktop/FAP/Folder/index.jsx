import React from 'react';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import { useTheme, alpha, makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import FavoriteItem from '@/ui-components/FavoriteItem';
import Explorer from './Explorer';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        height: 620,
        maxHeight: 'inherit',
    },
    dense: {
        background: 'none',
        border: 'none',
    },
}));

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
            button={(children || dense) && (
                <React.Fragment>
                    {!dense && children}
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
