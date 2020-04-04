import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE} from "dict";
import settings from "config/settings";
import {
    Box,
    Avatar,
    Button,
} from "@material-ui/core";
import {
    WallpaperRounded as WallpaperIcon,
    AddRounded as AddIcon,
} from "@material-ui/icons";

import locale from "i18n/RU";
import PageHeader from "ui/Menu/PageHeader";
import SectionHeader from "ui/Menu/SectionHeader";
import SettingsRow from "ui/Menu/SettingsRow";
import LibraryPage from "./Library";


function BGCard() {
    return (
        <Avatar variant="rounded" style={{width: 48, height: 48, marginRight: 8}}>
            <WallpaperIcon/>
        </Avatar>
    );
}

function BackgroundsMenu({onSelect, onClose}) {

    return (
        <Fragment>
            <PageHeader title={locale.settings.backgrounds.title} onBack={() => onClose()}/>
            <SectionHeader title={locale.settings.backgrounds.general.title}/>
            <SettingsRow
                title={locale.settings.backgrounds.general.library.title}
                description={locale.settings.backgrounds.general.library.description(15)}
                action={{
                    type: SettingsRow.TYPE.LINK,
                    onClick: () => onSelect(LibraryPage),
                }}
            >
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
                <BGCard/>
            </SettingsRow>
            <SettingsRow
                title={locale.settings.backgrounds.general.dimming_power.title}
                description={locale.settings.backgrounds.general.dimming_power.description}
                action={{
                    type: SettingsRow.TYPE.SLIDER,
                    defaultValue: 30,
                    onChange: (newValue, oldValue) => {
                    },
                    min: 0,
                    max: 100,
                }}
                type={SettingsRow.TYPE.SLIDER}
            />
            <SectionHeader title={locale.settings.backgrounds.scheduler.title}/>
            <SettingsRow
                title={locale.settings.backgrounds.scheduler.selection_method.title}
                description={locale.settings.backgrounds.scheduler.selection_method.description}
                action={{
                    type: SettingsRow.TYPE.DROPDOWN,
                    locale: locale.settings.backgrounds.scheduler.selection_method,
                    defaultValue: settings.backgrounds.selection_method,
                    onChange: (newValue, oldValue) => {
                    },
                    values: [
                        BG_SELECT_MODE.RANDOM,
                        BG_SELECT_MODE.SPECIFIC,
                    ]
                }}
            />
            <SettingsRow
                title={locale.settings.backgrounds.scheduler.change_interval.title}
                description={locale.settings.backgrounds.scheduler.change_interval.description}
                action={{
                    type: SettingsRow.TYPE.DROPDOWN,
                    locale: locale.settings.backgrounds.scheduler.change_interval,
                    defaultValue: settings.backgrounds.change_interval,
                    onChange: (newValue, oldValue) => {
                    },
                    values: [
                        BG_CHANGE_INTERVAL.OPEN_TAB,
                        BG_CHANGE_INTERVAL.MINUTES_30,
                        BG_CHANGE_INTERVAL.HOURS_1,
                        BG_CHANGE_INTERVAL.HOURS_6,
                        BG_CHANGE_INTERVAL.HOURS_12,
                        BG_CHANGE_INTERVAL.DAY_1
                    ]
                }}
            />
            <SettingsRow
                title={locale.settings.backgrounds.scheduler.bg_type.title}
                description={locale.settings.backgrounds.scheduler.bg_type.description}
                action={{
                    type: SettingsRow.TYPE.DROPDOWN,
                    locale: locale.settings.backgrounds.scheduler.bg_type,
                    defaultValue: settings.backgrounds.bg_type,
                    onChange: (newValue, oldValue) => {
                    },
                    values: [
                        BG_TYPE.IMAGE,
                        BG_TYPE.ANIMATION,
                        BG_TYPE.VIDEO,
                        BG_TYPE.FILL_COLOR,
                    ]
                }}
            />
        </Fragment>
    );
}

export default BackgroundsMenu;