import React from 'preact/compat';
import { h } from 'preact';
import {
	IconButton,
} from '@material-ui/core';
import {
	LinkRounded as LinkIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		marginRight: theme.spacing(1),
		padding: theme.spacing(1),
		backgroundColor: fade(theme.palette.common.white, 0.32),
		'&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
	},
	rootBlur: {
		backdropFilter: 'blur(10px) brightness(130%)',
	},
}));

function LinkButton ({ id, isBlurBackdrop }) {
	const classes = useStyles();

	return (
		<IconButton
			className={clsx(classes.root, isBlurBackdrop && classes.rootBlur)}
		>
			<LinkIcon />
		</IconButton>
	);
}

export default LinkButton;
