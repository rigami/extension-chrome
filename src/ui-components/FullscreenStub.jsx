import React from 'preact/compat';
import { h } from 'preact';
import { makeStyles } from '@material-ui/core/styles';
import {
	Typography,
	Box,
	Button,
} from '@material-ui/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
	},
	icon: {
		fontSize: '56px',
		marginBottom: theme.spacing(1),
	},
	title: { color: theme.palette.text.primary },
	description: { color: theme.palette.text.secondary },
}));


function FullScreenStub(props) {
	const {
		iconRender,
		message,
		description,
		actions,
		children,
		...other
	} = props;
	const classes = useStyles();

	return (
		<Box className={classes.root} {...other}>
			{iconRender && iconRender({ className: classes.icon })}
			{message && (
				<Typography variant="h6" className={classes.title}>{message}</Typography>
			)}
			{description && (
				<Typography variant="body1" className={classes.description} gutterBottom>{description}</Typography>
			)}
			{children}
			{actions && actions.map(({ title, ...props }) => (
				<Button {...props} key={title}>{title}</Button>
			))}
		</Box>
	);
}

FullScreenStub.propTypes = {
	iconRender: PropTypes.func,
	message: PropTypes.string,
	description: PropTypes.string,
	actions: PropTypes.arrayOf(PropTypes.object),
	children: PropTypes.element,
};
FullScreenStub.defaultProps = {
	iconRender: null,
	message: null,
	description: null,
	actions: null,
	children: null,
};

export default FullScreenStub;
