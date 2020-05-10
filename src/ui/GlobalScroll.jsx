import React, { useState } from 'preact/compat';
import { h } from 'preact';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalStore } from 'mobx-react-lite';
import { useService as useAppService } from '@/stores/app';
import Scrollbar from 'react-scrollbars-custom';
import clsx from 'clsx';

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
		pointerEvents: 'none',
		transition: theme.transitions.create('opacity', {
			duration: theme.transitions.duration.standard,
			easing: theme.transitions.easing.easeInOut,
		}),
	},
	scrollThumb: {
		backgroundColor: theme.palette.getContrastText(theme.palette.background.paper),
		width: 4,
		borderRadius: 2,
		pointerEvents: 'auto',
	},
	hideScroll: { opacity: 0 },
}));

function GlobalScroll({ children }) {
	const classes = useStyles();
	const appService = useAppService();
	const [isShowScroll, setIsShowScroll] = useState(false);
	const store = useLocalStore(() => ({ scrollbar: null, scrollDirection: null }));

	const handlerScroll = ({ scrollTop }, { scrollTop: prevScrollTop }) => {
		store.scrollDirection = prevScrollTop - scrollTop > 0 ? 'up' : 'down';
		setIsShowScroll(scrollTop >= document.documentElement.clientHeight);
	};

	const handlerScrollStop = ({ scrollTop }) => {
		if (
			(store.scrollDirection === 'down' && scrollTop < 150)
			|| (store.scrollDirection === 'up' && scrollTop < document.documentElement.clientHeight - 150)
		) {
			store.scrollbar.contentElement.parentElement.scrollTo({
				behavior: 'smooth',
				left: 0,
				top: 0,
			});
			appService.setActivity('desktop');
		} else if (scrollTop < document.documentElement.clientHeight) {
			store.scrollbar.contentElement.parentElement.scrollTo({
				behavior: 'smooth',
				left: 0,
				top: document.documentElement.clientHeight,
			});
			appService.setActivity('bookmarks');
		} else if (scrollTop < document.documentElement.clientHeight) {
			appService.setActivity('desktop');
		} else {
			appService.setActivity('bookmarks');
		}
	};


	return (
		<Scrollbar
			className={classes.root}
			noDefaultStyles
			wrapperProps={{
				renderer: (props) => {
					const { elementRef, ...restProps } = props;
					return <div {...restProps} ref={elementRef} className={classes.scrollWrapper} />;
				},
			}}
			trackYProps={{
				renderer: (props) => {
					const { elementRef, ...restProps } = props;
					return (
						<div
							{...restProps}
							ref={elementRef}
							className={clsx(!isShowScroll && classes.hideScroll, classes.scrollBar)}
						/>
					);
				},
			}}
			thumbYProps={{
				renderer: (props) => {
					const { elementRef, ...restProps } = props;
					return <div {...restProps} ref={elementRef} className={classes.scrollThumb} />;
				},
			}}
			momentum
			noScrollX={false}
			onScroll={handlerScroll}
			onScrollStop={handlerScrollStop}
			ref={(ref) => { store.scrollbar = ref; }}
		>
			{children}
		</Scrollbar>
	);
}

export default observer(GlobalScroll);
