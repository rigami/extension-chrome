import React from 'react';
import { AppBar, Toolbar, Box } from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { SelfImprovementRounded as DesktopIcon } from '@/icons';
import { ACTIVITY } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import FolderBreadcrumbs from './FolderBreadcrumbs';
import SearchBlock from './Search';
import ShowFavorites from './ShowFavorites';

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: alpha(theme.palette.background.paper, 0.91) },
    toolbar: {
        minHeight: 40,
        display: 'flex',
        padding: theme.spacing(2),
        alignItems: 'flex-start',
        boxSizing: 'content-box',
    },
    wrapperBreadcrumbs: {
        overflow: 'auto',
        marginRight: 'auto',
    },
    wrapperSearch: {
        padding: theme.spacing(0, 2),
        display: 'flex',
        flexGrow: 1,
        flexShrink: 0,
        justifyContent: 'center',
        maxWidth: (theme.shape.dataCard.width + theme.spacing(2)) * 3 + theme.spacing(2),
        width: '100%',
        marginTop: 0,
        boxSizing: 'content-box',
    },
    wrapperTools: {
        flexShrink: 0,
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: theme.spacing(2),
    },
    widthHelper: {
        flexShrink: 1,
        display: 'flex',
        flexGrow: 1,
    },
    toolStub: {
        visibility: 'hidden',
        width: 40,
    },
}));

function ToolsPanel({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['desktop']);
    const appService = useAppService();
    const { cloudSync } = appService;
    const bookmarksService = useBookmarksService();

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            className={classes.root}
        >
            <Toolbar disableGutters className={classes.toolbar}>
                <Box className={classes.wrapperBreadcrumbs}>
                    <FolderBreadcrumbs
                        key={service.activeFolderId}
                        folderId={service.activeFolderId}
                        onSelectFolder={(folderId) => service.setActiveFolder(folderId)}
                    />
                </Box>
                <Box className={classes.cloudSyncState}>
                    {cloudSync.data.stage}
                </Box>
                <Box className={classes.wrapperSearch}>
                    <SearchBlock searchService={service} />
                </Box>
                <Box className={classes.wrapperTools}>
                    {bookmarksService.favorites.length > 0 && (
                        <ShowFavorites />
                    )}
                    <ExtendButtonGroup>
                        <ExtendButton
                            tooltip={t('desktop:button.open')}
                            data-ui-path="desktop.open"
                            onClick={() => appService.setActivity(ACTIVITY.DESKTOP)}
                            icon={DesktopIcon}
                        />
                    </ExtendButtonGroup>
                    <ExtendButtonGroup className={classes.toolStub} />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default observer(ToolsPanel);
