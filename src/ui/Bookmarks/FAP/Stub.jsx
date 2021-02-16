import React from 'react';
import { BKMS_FAP_STYLE } from '@/enum';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { Box } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({ root: { backgroundColor: theme.palette.background.paper } }));

function FAPStub() {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const theme = useTheme();

    let height = 0;

    if (bookmarksService.fapIsDisplay) {
        height = 40 + theme.spacing(3 + (bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT ? 0 : 3));
    }

    return (
        <Box style={{ height }} className={classes.root} />
    );
}

export default observer(FAPStub);
