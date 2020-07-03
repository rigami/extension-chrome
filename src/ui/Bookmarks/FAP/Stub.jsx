import React from 'react';
import {BKMS_FAP_STYLE} from "@/enum";
import {useService as useBookmarksService} from "@/stores/bookmarks";
import { Box } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

function FAPStub() {
    const bookmarksStore = useBookmarksService();
    const theme = useTheme();

    let height = 0;

    if (bookmarksStore.fapStyle !== BKMS_FAP_STYLE.HIDDEN) {
        height = 40 + theme.spacing(3 + (bookmarksStore.fapStyle === BKMS_FAP_STYLE.TRANSPARENT ? 0 : 3))
    }

    return (
        <Box
            style={{ height }}
        />
    );
}

export default observer(FAPStub);
