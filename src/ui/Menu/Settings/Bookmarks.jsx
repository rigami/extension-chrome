import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/enum';
import { Collapse } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import MenuInfo from "@/ui/Menu/MenuInfo";

const headerProps = { title: "settings.bookmarks.title" };

function BookmarksSettings() {
    const bookmarksStore = useBookmarksService();
    const { t } = useTranslation();

    return useObserver(() => (
        <React.Fragment>
            <MenuRow
                title={t("settings.bookmarks.useFAP.title")}
                description={t("settings.bookmarks.useFAP.description")}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksStore.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => {
                        bookmarksStore.setFAPStyle(value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN);
                    },
                }}
            />
            <MenuInfo
                width={750}
                show={bookmarksStore.fapStyle !== BKMS_FAP_STYLE.HIDDEN && bookmarksStore.favorites.length === 0}
                message={t("settings.bookmarks.fapEmptyWarningMessage")}
            />
            <Collapse in={bookmarksStore.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={t("settings.bookmarks.fapStyle.title")}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.fapStyle.style.${value}`),
                        value: bookmarksStore.fapStyle,
                        onChange: (event) => bookmarksStore.setFAPStyle(event.target.value),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT],
                    }}
                />
                <MenuRow
                    title={t("settings.bookmarks.fapPosition.title")}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.fapPosition.position.${value}`),
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
