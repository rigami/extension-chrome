import React from 'react';
import {
    ACTIVITY,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
} from '@/enum';
import { Collapse } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useBookmarksService from '@/stores/BookmarksProvider';
import MenuInfo from '@/ui/Menu/MenuInfo';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppService from '@/stores/AppStateProvider';
import { observer } from 'mobx-react-lite';

const headerProps = { title: 'settings.bookmarks.title' };

function BookmarksSettings() {
    const bookmarksService = useBookmarksService();
    const appService = useAppService();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <SectionHeader title={t('settings.bookmarks.general.title')} />
            <MenuRow
                title={t('settings.bookmarks.general.openOnStartup.title')}
                description={t('settings.bookmarks.general.openOnStartup.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS,
                    onChange: (event, value) => appService.settings
                        .update({ defaultActivity: value ? ACTIVITY.BOOKMARKS : ACTIVITY.DESKTOP }),
                }}
            />
            <SectionHeader title={t('settings.bookmarks.FAP.title')} />
            <MenuRow
                title={t('settings.bookmarks.FAP.useFAP.title')}
                description={t('settings.bookmarks.FAP.useFAP.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => bookmarksService.settings
                        .update({ fapStyle: value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN }),
                }}
            />
            <MenuInfo
                width={750}
                show={(
                    bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
                    && bookmarksService.favorites.length === 0
                )}
                message={t('settings.bookmarks.FAP.fapEmptyWarningMessage')}
            />
            <Collapse in={bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapStyle.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapStyle.style.${value}`),
                        value: bookmarksService.settings.fapStyle,
                        onChange: (event) => bookmarksService.settings.update({ fapStyle: event.target.value }),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT],
                    }}
                />
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapPosition.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapPosition.position.${value}`),
                        value: bookmarksService.settings.fapPosition,
                        onChange: (event) => bookmarksService.settings.update({ fapPosition: event.target.value }),
                        values: [BKMS_FAP_POSITION.TOP, BKMS_FAP_POSITION.BOTTOM],
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

const ObserverBookmarksSettings = observer(BookmarksSettings);

export { headerProps as header, ObserverBookmarksSettings as content };
