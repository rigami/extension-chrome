import React from 'preact/compat';
import { h } from 'preact';
import { ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
	root: { paddingTop: theme.spacing(2) },
	title: {
		fontSize: '22px',
		fontWeight: 800,
	},
}));

function SectionHeader({ title }) {
	const classes = useStyles();

	return (
		<ListItem className={classes.root}>
			<ListItemAvatar />
			<ListItemText classes={{ primary: classes.title }} primary={title} />
		</ListItem>
	);
}

SectionHeader.propTypes = { title: PropTypes.string.isRequired };

export default SectionHeader;
