import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import GreetingView from '@/ui/Bookmarks/GreetingView';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';
import { NULL_UUID } from '@/utils/generate/uuid';

const useStyles = makeStyles((theme) => ({
    bookmarks: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2),
    },
}));

function PrimaryContent({ columns }) {
    const classes = useStyles();
    const searchService = useSearchService();

    return (
        <Fragment>
            {/* ---PRIMARY--- */}
            {searchService.selectFolderId === NULL_UUID && (
                <GreetingView />
            )}
            {searchService.selectFolderId !== NULL_UUID && (
                <BookmarksViewer
                    className={classes.bookmarks}
                    folderId={searchService.selectFolderId}
                    columns={columns}
                />
            )}
        </Fragment>
    );
}

export default observer(PrimaryContent);
