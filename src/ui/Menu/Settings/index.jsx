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
import Header from '@/ui/Menu/PageHeader';
import { makeStyles } from '@material-ui/core/styles';
// import PropTypes from 'prop-types';
import BackgroundsPage from './Backgrounds';
import AboutPage from './About';
import AppSettingsPage from './AppSettings';
import BookmarksPage from './Bookmarks';

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
        page: BackgroundsPage,
        color: '#2675F0',
    },
    {
        title: locale.settings.bookmarks.title,
        description: locale.settings.bookmarks.description,
        icon: <BookmarksIcon />,
        id: 'bookmarks',
        page: BookmarksPage,
        color: '#ff4f88',
    },
    {
        title: locale.settings.app.title,
        description: locale.settings.app.description,
        icon: <SettingsIcon />,
        id: 'app',
        page: AppSettingsPage,
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
        page: AboutPage,
        color: '#9C27B0',
    },
];

function Row(props) {
    const {
        title,
        page,
        color,
        description,
        icon: Icon,
        onSelect,
    } = props;

    return (
        <ListItem
            button
            onClick={() => onSelect(page)}
            style={{ width: 520 }}
            disabled={!page}
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

/* Row.propTypes = {
    title: PropTypes.string.isRequired,
    page: PropTypes.object,
    color: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.element.isRequired,
    onSelect: PropTypes.func.isRequired,
};

Row.defaultProps = {
    page: null,
    description: null,
}; */

function GeneralMenu({ onClose, onSelect }) {
    const classes = useStyles();

    return (
        <React.Fragment>
            <Header title={locale.settings.title} onBack={() => onClose()} />
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

/* GeneralMenu.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
}; */

export default GeneralMenu;
