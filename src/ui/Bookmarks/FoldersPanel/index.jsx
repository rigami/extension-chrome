import React from 'react';
import { Box, CardHeader } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import LogoIcon from '@/images/logo-icon.svg';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import LogoText from '@/images/logo-text.svg';
import Folders from './Folders';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 260,
        minWidth: 230,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: fade(theme.palette.background.backdrop, 0.4),
    },
    avatar: { display: 'flex' },
    header: { minHeight: theme.spacing(9.75) },
    padding: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    },
    appLogoIcon: {
        width: 28,
        height: 28,
    },
    appLogoText: {
        height: 24,
        width: 'auto',
    },
    appLogoTextWrapper: { display: 'flex' },
}));

function FoldersPanel({ searchService: service }) {
    const classes = useStyles();

    return (
        <Box className={classes.root} pb={2}>
            <CardHeader
                avatar={(<LogoIcon className={classes.appLogoIcon} />)}
                title={(<LogoText className={classes.appLogoText} />)}
                disableTypography
                classes={{
                    root: clsx(classes.padding, classes.header),
                    avatar: classes.avatar,
                    content: classes.appLogoTextWrapper,
                }}
            />
            <Folders
                selectFolder={service.activeFolderId}
                onClickFolder={({ id }) => service.setActiveFolder(id)}
            />
        </Box>
    );
}

export default observer(FoldersPanel);
