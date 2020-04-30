import React, { Fragment } from 'preact/compat';
import { h } from 'preact';
import {
	Box,
	Avatar,
	IconButton,
	Divider,
	Typography,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListItemSecondaryAction,
} from '@material-ui/core';
import {
	SettingsRounded as SettingsIcon,
	NavigateNextRounded as ArrowRightIcon,
	HomeRounded as HomeIcon,
	BugReportRounded as BugIcon,
	ChatBubbleRounded as ReviewIcon,
	EmailRounded as EmailIcon,
	PolicyRounded as PolicyIcon,
} from '@material-ui/icons';

import locale from '@/i18n/RU';
import PageHeader from '@/ui/Menu/PageHeader';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
	splash: {
		width: 520,
		height: 250,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	appIcon: {
		width: 64,
		height: 64,
		marginBottom: theme.spacing(1),
		backgroundColor: theme.palette.primary.main,
	},
	appVersion: { color: theme.palette.text.secondary },
	row: { width: 520 },
}));

function About({ onClose }) {
	const classes = useStyles();

	return (
		<Fragment>
			<PageHeader title={locale.settings.about.title} onBack={() => onClose()} />
			<Box className={classes.splash}>
				<Avatar className={classes.appIcon} variant="rounded">
					<SettingsIcon fontSize="large" />
				</Avatar>
				<Typography className={classes.appVersion} variant="body2">
					v
					{chrome.runtime.getManifest().version}
				</Typography>
			</Box>
			<Divider />
			<ListItem button className={classes.row}>
				<ListItemIcon>
					<HomeIcon />
				</ListItemIcon>
				<ListItemText primary={locale.settings.about.home_page} />
				<ListItemSecondaryAction>
					<IconButton edge="end">
						<ArrowRightIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
			<ListItem button className={classes.row}>
				<ListItemIcon>
					<ReviewIcon />
				</ListItemIcon>
				<ListItemText
					primary={locale.settings.about.review.title}
					secondary={locale.settings.about.review.description}
				/>
				<ListItemSecondaryAction>
					<IconButton edge="end">
						<ArrowRightIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
			<ListItem button className={classes.row}>
				<ListItemIcon>
					<BugIcon />
				</ListItemIcon>
				<ListItemText
					primary={locale.settings.about.bug_report.title}
					secondary={locale.settings.about.bug_report.description}
				/>
				<ListItemSecondaryAction>
					<IconButton edge="end">
						<ArrowRightIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
			<ListItem button className={classes.row}>
				<ListItemIcon>
					<EmailIcon />
				</ListItemIcon>
				<ListItemText
					primary={locale.settings.about.contact.title}
					secondary={locale.settings.about.contact.description}
				/>
				<ListItemSecondaryAction>
					<IconButton edge="end">
						<ArrowRightIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
			<ListItem button className={classes.row}>
				<ListItemIcon>
					<PolicyIcon />
				</ListItemIcon>
				<ListItemText
					primary={locale.settings.about.policy}
				/>
				<ListItemSecondaryAction>
					<IconButton edge="end">
						<ArrowRightIcon />
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
			<ListItem className={classes.row}>
				<ListItemIcon />
				<ListItemText secondary="Danilkinkin | 2020" />
			</ListItem>
		</Fragment>
	);
}

About.propTypes = { onClose: PropTypes.func.isRequired };

export default About;
