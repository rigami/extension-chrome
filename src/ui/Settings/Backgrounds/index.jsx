import React, {useState, useRef, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import { observer, inject } from "mobx-react"
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
    MoreHorizRounded as MoreIcon,
} from "@material-ui/icons";

import locale from "i18n/RU";
import PageHeader from "ui/Menu/PageHeader";
import SectionHeader from "ui/Menu/SectionHeader";
import SettingsRow, { ROWS_TYPE } from "ui/Menu/SettingsRow";
import LibraryPage from "./Library";
import FSConnector from "utils/fsConnector";


function BGCard({ src }) {
    return (
        <Avatar src={src} variant="rounded" style={{width: 48, height: 48, marginRight: 8}}>
            <WallpaperIcon/>
        </Avatar>
    );
}

function BackgroundsMenu({ backgroundsStore, onSelect, onClose}) {

    const [bgs, setBgs] = useState(null);

    useEffect(() => {
        backgroundsStore.getStore()
            .then((store) => store.getAllItems())
            .then((values) => {
                setBgs(values.map(({ fileName }) => FSConnector.getURL(fileName, "preview")));
            })
            .catch((e) => {
                console.error("Failed load bg`s from db:", e)
            });
    }, [backgroundsStore.count]);

    return (
        <Fragment>
            <PageHeader title={locale.settings.backgrounds.title} onBack={() => onClose()}/>
            <SectionHeader title={locale.settings.backgrounds.general.title}/>
            <SettingsRow
                title={locale.settings.backgrounds.general.library.title}
                description={locale.settings.backgrounds.general.library.description(backgroundsStore.count)}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(LibraryPage),
                }}
            >
                {bgs && bgs.slice(0, 8).map((src) => (
                    <BGCard src={src}/>
                ))}
                {bgs && bgs.length > 8 && (
                    <Avatar variant="rounded" style={{width: 48, height: 48, marginRight: 8}}>
                        <MoreIcon/>
                    </Avatar>
                )}
            </SettingsRow>
            <SettingsRow
                title={locale.settings.backgrounds.general.dimming_power.title}
                description={locale.settings.backgrounds.general.dimming_power.description}
                action={{
                    type: ROWS_TYPE.SLIDER,
                    value: typeof backgroundsStore.dimmingPower === 'number' ? backgroundsStore.dimmingPower : 0,
                    onChange: (event, value) => {
                        backgroundsStore.setDimmingPower(value, false);
                    },
                    onChangeCommitted:  (event, value) => {
                        backgroundsStore.setDimmingPower(value, true);
                    },
                    min: 0,
                    max: 90,
                }}
                type={ROWS_TYPE.SLIDER}
            />
            <SectionHeader title={locale.settings.backgrounds.scheduler.title}/>
            <SettingsRow
                title={locale.settings.backgrounds.scheduler.selection_method.title}
                description={locale.settings.backgrounds.scheduler.selection_method.description}
                action={{
                    type: ROWS_TYPE.SELECT,
                    locale: locale.settings.backgrounds.scheduler.selection_method,
                    value: backgroundsStore.selectionMethod,
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
                    type: ROWS_TYPE.SELECT,
                    locale: locale.settings.backgrounds.scheduler.change_interval,
                    value: backgroundsStore.changeInterval,
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
                    type: ROWS_TYPE.MULTISELECT,
                    locale: locale.settings.backgrounds.scheduler.bg_type,
                    value: backgroundsStore.bgType,
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

export default inject('backgroundsStore')(observer(BackgroundsMenu));