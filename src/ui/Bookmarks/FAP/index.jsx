import React, { useState, createRef } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Card,
	IconButton,
	Fade,
	Typography,
} from '@material-ui/core';
import {
	NavigateBeforeRounded as LeftIcon,
	NavigateNextRounded as RightIcon,
} from '@material-ui/icons';
import ReactResizeDetector from 'react-resize-detector';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/dict';
import Link from './Link';
import Folder from './Folder';
import ScrollContainer from 'react-indiana-drag-scroll'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(11),
		paddingTop: theme.spacing(3),
		paddingBottom: 0,
		width: '100%',
		zIndex: theme.zIndex.speedDial,
		display: 'flex',
		pointerEvents: 'none',
		justifyContent: 'center',
		position: 'relative',
		boxSizing: 'border-box',
	},
	stickyRoot: {
		position: 'sticky',
		top: 0,
		bottom: theme.spacing(3),
	},
	card: {
		margin: 'auto',
		pointerEvents: 'auto',
		borderRadius: theme.spacing(3.5),
		backdropFilter: 'blur(10px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.52),
	},
	panel: {
		padding: theme.spacing(1, 0),
		paddingLeft: theme.spacing(1),
		maxWidth: 1400,
		display: 'block',
		whiteSpace: 'nowrap',
		'&::-webkit-scrollbar': {
			width: 0,
			height: 0,
		},
	},
	absolutePanel: {
		position: 'fixed',
		top: theme.spacing(3),
	},
	panelTransparent: {
		background: 'none',
		backdropFilter: 'none',
		boxShadow: 'none',
		padding: 0,
		paddingLeft: theme.spacing(1),
	},
	iconButton: {
		marginRight: theme.spacing(1),
		padding: theme.spacing(1),
		backgroundColor: fade(theme.palette.common.white, 0.32),
		'&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
	},
	popper: {
		width: 310,
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		backdropFilter: 'blur(15px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.70),
	},
	emptyTitle: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(2),
	},
	arrowButton: {
		padding: theme.spacing(1),
		position: 'absolute',
		zIndex: 1,
		backgroundColor: fade(theme.palette.common.black, 0.52),
		transition: theme.transitions.create("transform", {
			easing: theme.transitions.easing.easeInOut,
			duration: theme.transitions.duration.short,
		}),
	},
	leftArrow: {
		left: theme.spacing(1),
	},
	leftArrowHide: {
		transform: `translateX(calc(-100% - ${theme.spacing(1)}px))`,
	},
	rightArrow: {
		right: theme.spacing(1),
	},
	rightArrowHide: {
		transform: `translateX(calc(100% + ${theme.spacing(1)}px))`,
	},
}));

function FAP() {
	const classes = useStyles();
	const theme = useTheme();
	const appService = useBookmarksService();
	const bookmarksStore = useBookmarksService();
	const scrollRef = createRef();
	const [isLeft, setIsLeft] = useState(false);
	const [isRight, setIsRight] = useState(false);

	const resizeHandle = () => {
		if (scrollRef.current.base.clientWidth < scrollRef.current.base.scrollWidth) {
			setIsLeft(scrollRef.current.base.scrollLeft !== 0);
			setIsRight(scrollRef.current.base.scrollLeft + scrollRef.current.base.clientWidth !== scrollRef.current.base.scrollWidth);
		} else {
			setIsLeft(false);
			setIsRight(false);
		}
	};

	const scrollHandle = (left) => {
		setIsLeft(left !== 0);
		setIsRight(left + scrollRef.current.base.clientWidth !== scrollRef.current.base.scrollWidth);
	}

	const scrollToStartHandle = () => {
		scrollRef.current.base.scrollTo({
			behavior: 'smooth',
			left: 0,
			top: 0,
		});
	};

	const scrollToEndHandle = () => {
		scrollRef.current.base.scrollTo({
			behavior: 'smooth',
			left: scrollRef.current.base.scrollWidth,
			top: 0,
		});
	};

	return (
		<Fade in={appService.fapStyle !== BKMS_FAP_STYLE.HIDDEN} unmountOnExit>
			<div
				className={clsx(
					classes.root,
					appService.fapPosition === BKMS_FAP_POSITION.BOTTOM && classes.stickyRoot
				)}
				style={{ height: 40 + theme.spacing(3 + (appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT ? 0 : 2)) }}
			>
				<Card elevation={12} className={classes.card} >
					<ScrollContainer
						vertical={false}
						horizontal
						hideScrollbars
						onScroll={scrollHandle}
						onWheel={console.log()}
						className={clsx(
							classes.panel,
							appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.panelTransparent,
							appService.fapPosition === BKMS_FAP_POSITION.TOP && classes.absolutePanel,
						)}
						ref={scrollRef}
					>
						{bookmarksStore.favorites.length === 0 && (
							<Typography className={classes.emptyTitle}>
								Быстрых закладок еще нет
							</Typography>
						)}
						<IconButton
							className={clsx(classes.arrowButton, classes.leftArrow, !isLeft && classes.leftArrowHide)}
							onClick={scrollToStartHandle}
						>
							<LeftIcon />
						</IconButton>
						{bookmarksStore.favorites.map((fav) => (
							fav.type === 'bookmark' ? (
								<Link
									{...fav}
									key={`${fav.type}-${fav.id}`}
									isBlurBackdrop={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
								/>
							) : (
								<Folder
									{...fav}
									key={`${fav.type}-${fav.id}`}
									color={bookmarksStore.getCategory(fav.id)?.color}
									isBlurBackdrop={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
								/>
							)
						))}
						<IconButton
							className={clsx(classes.arrowButton, classes.rightArrow, !isRight && classes.rightArrowHide)}
							onClick={scrollToEndHandle}
						>
							<RightIcon />
						</IconButton>
					</ScrollContainer>
					<ReactResizeDetector handleWidth onResize={resizeHandle} />
				</Card>
			</div>
		</Fade>
	);
}

export default observer(FAP);
