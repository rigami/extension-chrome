import React from 'react';
import {
    Box, CardActionArea, CardHeader, Tooltip,
} from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { UnfoldLess as LessIcon, UnfoldMore as MoreIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';
import Subheader from '@/ui/Bookmarks/FoldersPanel/Subheader';
import { ItemAction } from '@/ui/Bookmarks/FoldersPanel/Item';
import LastClosed from './RecentlyClosed';
import Folders from './Folders';
import { NULL_UUID } from '@/utils/generate/uuid';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 260,
        minWidth: 230,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        // backgroundColor: alpha(theme.palette.background.backdrop, 0.3),
        paddingTop: theme.spacing(2),
    },
    avatar: {
        display: 'flex',
        marginRight: theme.spacing(1),
    },
    header: {
        height: 40,
        padding: 0,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    appLogoIcon: {
        width: 20,
        height: 20,
    },
    appLogoText: {
        height: 20,
        width: 'auto',
        fill: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
    appLogoTextWrapper: { display: 'flex' },
    activeGreetingView: { backgroundColor: theme.palette.action.selected },
    offsetTop: { marginTop: 'auto' },
    folders: { marginLeft: theme.spacing(1) },
}));

function FoldersPanel() {
    const { t } = useTranslation(['folder']);
    const searchService = useSearchService();
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <CardActionArea onClick={() => searchService.setSelectFolder(NULL_UUID)}>
                <CardHeader
                    avatar={(<LogoIcon className={classes.appLogoIcon} />)}
                    title={(<LogoText className={classes.appLogoText} />)}
                    disableTypography
                    classes={{
                        root: clsx(
                            classes.header,
                            // service.selectFolderId === null && classes.activeGreetingView,
                        ),
                        avatar: classes.avatar,
                        content: classes.appLogoTextWrapper,
                    }}
                />
            </CardActionArea>
            <Box overflow="auto" py={2}>
                <Subheader
                    title={t('listTitle')}
                    disableButton
                />
                <Folders
                    className={classes.folders}
                    selectFolder={searchService.selectFolderId}
                    onClickFolder={({ id }) => searchService.setSelectFolder(id)}
                />
            </Box>
            <LastClosed className={classes.offsetTop} />
        </Box>
    );
}

export default observer(FoldersPanel);
