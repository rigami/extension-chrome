import React from 'react';
import {
    ACTIVITY,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
    BKMS_FAP_ALIGN,
} from '@/enum';
import { Collapse } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import MenuInfo from '@/ui/Menu/MenuInfo';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppService from '@/stores/app/AppStateProvider';
import { observer } from 'mobx-react-lite';

const headerProps = { title: 'settings.bookmarks.title' };
const pageProps = { width: 750 };

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
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapAlign.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapAlign.align.${value}`),
                        value: bookmarksService.settings.fapAlign,
                        onChange: (event) => bookmarksService.settings.update({ fapAlign: event.target.value }),
                        values: [BKMS_FAP_ALIGN.LEFT, BKMS_FAP_ALIGN.CENTER],
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

const ObserverBookmarksSettings = observer(BookmarksSettings);

export {
    headerProps as header,
    ObserverBookmarksSettings as content,
    pageProps as props,
};

export default {
    header: headerProps,
    content: ObserverBookmarksSettings,
    props: pageProps,
};
