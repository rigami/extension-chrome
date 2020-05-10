import React, { useState } from 'preact/compat';
import { h } from 'preact';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useService as useAppService } from '@/stores/app';
import Scrollbar from 'react-scrollbars-custom';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		width: '100vw',
		backgroundColor: theme.palette.background.paper,
	},
	scrollWrapper: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	scrollBar: {
		position: 'absolute',
		right: 4,
		top: 4,
		bottom: 4,
	},
	scrollThumb: {
		backgroundColor: theme.palette.getContrastText(theme.palette.background.paper),
		width: 4,
		borderRadius: 2
	},
}));

function GlobalScroll({ children }) {
	const classes = useStyles();
	const appService = useAppService();

	const handlerScroll = ({ scrollTop }) => {
		if (scrollTop > document.documentElement.clientHeight * 0.5) {
			appService.setActivity("bookmarks");
		} else {
			appService.setActivity("desktop");
		}
	};

	return (
		<Scrollbar
			className={classes.root}
			noDefaultStyles
			wrapperProps={{
				renderer: props => {
					const { elementRef, ...restProps } = props;
					return <div {...restProps} ref={elementRef} className={classes.scrollWrapper} />;
				}
			}}
			trackYProps={{
				renderer: props => {
					const { elementRef, ...restProps } = props;
					return <div {...restProps} ref={elementRef} className={classes.scrollBar} />;
				}
			}}
			thumbYProps={{
				renderer: props => {
					const { elementRef, ...restProps } = props;
					return <div {...restProps} ref={elementRef} className={classes.scrollThumb} />;
				}
			}}
			momentum
			noScrollX={false}
			onScroll={handlerScroll}
		>
			{children}
		</Scrollbar>
	);
}

export default observer(GlobalScroll);
