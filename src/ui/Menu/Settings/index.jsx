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
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { content as BackgroundsPageContent, header as backgroundsPageHeader } from './Backgrounds';
import { content as AboutPageContent, header as aboutPageHeader } from './About';
import { content as AppSettingsPageContent, header as appSettingsPageHeader } from './AppSettings';
import { content as BookmarksPageContent, header as bookmarksPageHeader } from './Bookmarks';
import { content as BackupPageContent, header as backupPageHeader } from './Backup';

const useStyles = makeStyles((theme) => ({
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

const general = [
    {
        title: 'settings.bg.title',
        description: 'settings.bg.description',
        icon: <BackgroundsIcon />,
        id: 'backgrounds',
        header: backgroundsPageHeader,
        content: BackgroundsPageContent,
        color: '#2675F0',
    },
    {
        title: 'settings.bookmarks.title',
        description: 'settings.bookmarks.description',
        icon: <BookmarksIcon />,
        id: 'bookmarks',
        header: bookmarksPageHeader,
        content: BookmarksPageContent,
        color: '#ff4f88',
    },
    {
        title: 'settings.app.title',
        description: 'settings.app.description',
        icon: <SettingsIcon />,
        id: 'app',
        header: appSettingsPageHeader,
        content: AppSettingsPageContent,
        color: '#F88317',
    },
    {
        title: 'settings.backup.title',
        description: 'settings.backup.description',
        icon: <BackupIcon />,
        id: 'backup',
        header: backupPageHeader,
        content: BackupPageContent,
        color: '#0f9d58',
    },
];
const additional = [
    {
        title: 'settings.about.title',
        description: 'settings.about.description',
        icon: <AboutIcon />,
        id: 'about',
        header: aboutPageHeader,
        content: AboutPageContent,
        color: '#9C27B0',
    },
];

const headerProps = { title: 'settings.title' };

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
    const { t } = useTranslation();

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
            <ListItemText primary={t(title)} secondary={t(description)} />
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
