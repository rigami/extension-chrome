import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import { observer } from "mobx-react"
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

import backgroundsStore from "stores/backgrounds";


function BGCard() {
    return (
        <Avatar variant="rounded" style={{width: 48, height: 48, marginRight: 8}}>
            <WallpaperIcon/>
        </Avatar>
    );
}

function BackgroundsMenu({onSelect, onClose}) {

    console.log(backgroundsStore.bg_type)

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
                    value: 30,
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
                    type: SettingsRow.TYPE.SELECT,
                    locale: locale.settings.backgrounds.scheduler.selection_method,
                    value: backgroundsStore.selection_method,
                    onChange: (event) => backgroundsStore.setSelectionMethod(event.target.value),
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
                    type: SettingsRow.TYPE.SELECT,
                    locale: locale.settings.backgrounds.scheduler.change_interval,
                    value: backgroundsStore.change_interval,
                    onChange: (event) => backgroundsStore.setChangeInterval(event.target.value),
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
                    type: SettingsRow.TYPE.MULTISELECT,
                    locale: locale.settings.backgrounds.scheduler.bg_type,
                    value: backgroundsStore.bg_type,
                    onChange: (event) => {
                        console.log(event.target.value);
                        backgroundsStore.setBgType(event.target.value);
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

export default observer(BackgroundsMenu);