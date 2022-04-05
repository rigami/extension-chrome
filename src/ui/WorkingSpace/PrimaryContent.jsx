import React, { Fragment, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { alpha, makeStyles, useTheme } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { sample } from 'lodash';
import { useTranslation } from 'react-i18next';
import BookmarksViewer from '@/ui/WorkingSpace/BookmarksViewer';
import { useSearchService } from '@/ui/WorkingSpace/searchProvider';
import { NULL_UUID } from '@/utils/generate/uuid';
import Stub from '@/ui-components/Stub';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import Favorites from '@/ui/WorkingSpace/Favorites';
import { useContextEdit } from '@/stores/app/contextActions';
import FolderBreadcrumbs from '@/ui/WorkingSpace/FolderBreadcrumbs';

const useStyles = makeStyles((theme) => ({
    bookmarks: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
    },
    stub: {
        height: '50vh',
        marginTop: '10vh',
    },
    emoticon: {
        fontSize: '10rem',
        color: alpha(theme.palette.text.secondary, 0.06),
        fontWeight: 700,
    },
    message: {
        fontSize: '1.4rem',
        fontWeight: 600,
        marginTop: theme.spacing(4),
        color: theme.palette.text.primary,
    },
    breadcrumbs: { paddingLeft: theme.spacing(1) },
}));

const emoticons = [
    '(^_^)b',
    '(；⌣̀_⌣́)',
    '(⇀‸↼‶)',
    '(눈_눈)',
    '(ᗒᗣᗕ)՞',
    '(￢_￢;)',
    'ヾ( ￣O￣)ツ',
    '(╥_╥)',
    '( ╥ω╥ )',
    '¯\\_(ツ)_/¯',
    '┐( ˘ ､ ˘ )┌',
    '╮( ˘_˘ )╭',
    '(⊙_⊙)',
];

function PrimaryContent({ columns }) {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const searchService = useSearchService();
    const [emoticon] = useState(() => sample(emoticons));
    const { dispatchEdit } = useContextEdit();

    return (
        <Fragment>
            {searchService.selectFolderId === NULL_UUID && (
                <Favorites />
            )}
            {searchService.selectFolderId !== NULL_UUID && (
                <Fragment>
                    <FolderBreadcrumbs
                        key={searchService.selectFolderId}
                        className={classes.breadcrumbs}
                        showRoot
                        maxItems={4}
                        folderId={searchService.selectFolderId}
                        onSelectFolder={(folderId) => searchService.setSelectFolder(folderId)}
                    />
                    <BookmarksViewer
                        style={{ width: columns * (theme.shape.dataCard.width + 16) + 16 }}
                        className={classes.bookmarks}
                        folderId={searchService.selectFolderId}
                        columns={columns}
                        emptyRender={() => (
                            <Stub
                                key="empty"
                                maxWidth={false}
                                message={emoticon}
                                description={t('empty')}
                                classes={{
                                    root: classes.stub,
                                    title: classes.emoticon,
                                    description: classes.message,
                                }}
                            >
                                <Button
                                    onClick={(event) => dispatchEdit({
                                        itemType: 'bookmark',
                                        defaultFolderId: searchService.selectFolderId,
                                    }, event)}
                                    startIcon={<AddBookmarkIcon />}
                                    variant="outlined"
                                    color="primary"
                                >
                                    {t('button.add', { context: 'first' })}
                                </Button>
                            </Stub>
                        )}
                        nothingFoundRender={() => (
                            <Stub
                                key="nothing-found"
                                maxWidth={false}
                                message={emoticon}
                                description={t('search.nothingFound')}
                                classes={{
                                    root: classes.stub,
                                    title: classes.emoticon,
                                    description: classes.message,
                                }}
                            />
                        )}
                    />
                </Fragment>
            )}
        </Fragment>
    );
}

export default observer(PrimaryContent);
