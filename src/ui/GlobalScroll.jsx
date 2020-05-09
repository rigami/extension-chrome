import React, { useState } from 'preact/compat';
import { h } from 'preact';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useService as useAppService } from '@/stores/app';

const useStyles = makeStyles((theme) => ({
	root: {
		overflow: 'hidden',
		overflowY: 'scroll',
		height: '100vh',
		width: '100vw',
		backgroundColor: theme.palette.background.paper,
	},
}));

function GlobalScroll({ children }) {
	const classes = useStyles();
	const appService = useAppService();

	const handlerScroll = (event) => {
		if (event.target.scrollTop > document.documentElement.clientHeight * 0.5) {
			appService.setActivity("bookmarks");
		} else {
			appService.setActivity("desktop");
		}
	};

	return (
		<Box className={classes.root} onScroll={handlerScroll}>
			{children}
		</Box>
	);
}

export default observer(GlobalScroll);
