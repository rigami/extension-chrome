import React from 'react';
import {
    ListItem,
    ListItemText,
    Divider,
    ListItemAvatar,
    Avatar,
} from '@material-ui/core';
import {
    SettingsRounded as SettingsIcon,
    CollectionsRounded as BackgroundsIcon,
    CollectionsBookmarkRounded as BookmarksIcon,
    HelpRounded as AboutIcon,
    BackupRounded as BackupIcon,
} from '@material-ui/icons';
import locale from '@/i18n/RU';
import { makeStyles } from '@material-ui/core/styles';
import { content as BackgroundsPageContent, header as backgroundsPageHeader } from './Backgrounds';
import { content as AboutPageContent, header as aboutPageHeader } from './About';
import { content as AppSettingsPageContent, header as appSettingsPageHeader } from './AppSettings';
import { content as BookmarksPageContent, header as bookmarksPageHeader } from './Bookmarks';

const useStyles = makeStyles((theme) => ({
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

const general = [
    {
        title: locale.settings.backgrounds.title,
        description: locale.settings.backgrounds.description,
        icon: <BackgroundsIcon />,
        id: 'backgrounds',
        header: backgroundsPageHeader,
        content: BackgroundsPageContent,
        color: '#2675F0',
    },
    {
        title: locale.settings.bookmarks.title,
        description: locale.settings.bookmarks.description,
        icon: <BookmarksIcon />,
        id: 'bookmarks',
        header: bookmarksPageHeader,
        content: BookmarksPageContent,
        color: '#ff4f88',
    },
    {
        title: locale.settings.app.title,
        description: locale.settings.app.description,
        icon: <SettingsIcon />,
        id: 'app',
        header: appSettingsPageHeader,
        content: AppSettingsPageContent,
        color: '#F88317',
    },
    {
        title: locale.settings.backup.title,
        description: locale.settings.backup.description,
        icon: <BackupIcon />,
        id: 'backup',
        color: '#0f9d58',
    },
];
const additional = [
    {
        title: locale.settings.about.title,
        description: locale.settings.about.description,
        icon: <AboutIcon />,
        id: 'about',
        header: aboutPageHeader,
        content: AboutPageContent,
        color: '#9C27B0',
    },
];

const headerProps = { title: locale.settings.title };

function Row(props) {
    const {
        title,
        content,
        header,
        color,
        description,
        icon: Icon,
        onSelect,
    } = props;

    return (
        <ListItem
            button
            onClick={() => onSelect({
                header,
                content,
            })}
            style={{ width: 520 }}
            disabled={!content}
        >
            <ListItemAvatar>
                <Avatar style={{ backgroundColor: color }}>
                    {Icon}
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={title} secondary={description} />
        </ListItem>
    );
}

function GeneralMenu({ onSelect }) {
    const classes = useStyles();

    return (
        <React.Fragment>
            {general.map((row) => (
                <Row key={row.id} onSelect={onSelect} {...row} />
            ))}
            <Divider variant="middle" className={classes.divider} />
            {additional.map((row) => (
                <Row key={row.id} onSelect={onSelect} {...row} />
            ))}
        </React.Fragment>
    );
}

export default GeneralMenu;
export { headerProps as header };
