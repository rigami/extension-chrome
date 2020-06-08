import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/dict';
import { Collapse } from '@material-ui/core';
import locale from '@/i18n/RU';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { useService as useBookmarksService } from '@/stores/bookmarks';

const headerProps = { title: locale.settings.bookmarks.title };

function BookmarksSettings() {
    const bookmarksStore = useBookmarksService();

    return useObserver(() => (
        <React.Fragment>
            <MenuRow
                title={locale.settings.bookmarks.use_fap}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksStore.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => {
                        bookmarksStore.setFAPStyle(value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN);
                    },
                }}
            />
            <Collapse in={bookmarksStore.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={locale.settings.bookmarks.fap_style.title}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        locale: locale.settings.bookmarks.fap_style,
                        value: bookmarksStore.fapStyle,
                        onChange: (event) => bookmarksStore.setFAPStyle(event.target.value),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT],
                    }}
                />
                <MenuRow
                    title={locale.settings.bookmarks.fap_position.title}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        locale: locale.settings.bookmarks.fap_position,
                        value: bookmarksStore.fapPosition,
                        onChange: (event) => bookmarksStore.setFAPPosition(event.target.value),
                        values: [BKMS_FAP_POSITION.TOP, BKMS_FAP_POSITION.BOTTOM],
                    }}
                />
            </Collapse>
        </React.Fragment>
    ));
}

export { headerProps as header, BookmarksSettings as content };
