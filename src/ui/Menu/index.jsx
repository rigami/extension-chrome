import React, { useState, useEffect } from 'preact/compat';
import { h, Fragment } from 'preact';

import {
	Drawer,
	List,
	Divider,
} from '@material-ui/core';
import {
	PauseRounded as PauseIcon,
	PlayArrowRounded as PlayIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { inject, observer } from 'mobx-react';
import { fade } from '@material-ui/core/styles/colorManipulator';
import PropTypes from 'prop-types';
import BackgroundsStore from '@/stores/backgrounds';
import { BG_TYPE } from '../../dict';
import HomePage from '../Settings';
import FabMenu from './FabMenu';

const useStyles = makeStyles((theme) => ({
	list: {
		minHeight: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	divider: {
		backgroundColor: fade(theme.palette.common.white, 0.12),
		marginTop: theme.spacing(0.5),
		marginBottom: theme.spacing(0.5),
	},
	description: { color: theme.palette.text.secondary },
}));

function Menu({ backgroundsStore }) {
	const classes = useStyles();
	const [isOpen, setIsOpen] = useState(false);
	const [stack, setStack] = useState([HomePage]);
	const [fastSettings, setFastSettings] = useState([]);

	const handleClose = () => {
		setStack([HomePage]);
		setIsOpen(false);
	};

	useEffect(() => {
		if (backgroundsStore.currentBGId && backgroundsStore.getCurrentBG().type === BG_TYPE.VIDEO) {
			if (backgroundsStore.bgState === 'play') {
				setFastSettings([{
					tooltip: (
						<Fragment>
							<b>Остановить видео</b>
							<Divider className={classes.divider} />
							Живые обой это красиво, но они потребляют больше энергии чем статическое изображения.
							Для сбережения энергии можно остановить видео
						</Fragment>
					),
					onClick: () => backgroundsStore.pause(),
					icon: <PauseIcon />,
				}]);
			} else {
				setFastSettings([{
					tooltip: 'Воспроизвести видео',
					onClick: () => backgroundsStore.play(),
					icon: <PlayIcon />,
				}]);
			}
		} else {
			setFastSettings([]);
		}
	}, [backgroundsStore.currentBGId, backgroundsStore.bgState]);

	return (
		<Fragment>
			<FabMenu
				onOpenMenu={() => setIsOpen(true)}
				onRefreshBackground={() => {
					backgroundsStore.nextBG();
				}}
				fastSettings={fastSettings}
			/>
			<Drawer
				anchor="right"
				open={isOpen}
				onClose={() => handleClose()}
				disableEnforceFocus
			>
				<List disablePadding className={classes.list}>
					{stack[stack.length - 1]({
						onClose: () => {
							if (stack.length === 1) {
								handleClose();
							} else {
								setStack(stack.slice(0, stack.length - 1));
							}
						},
						onSelect: (page) => setStack([...stack, page]),
					})}
				</List>
			</Drawer>
		</Fragment>
	);
}

Menu.propTypes = { backgroundsStore: PropTypes.instanceOf(BackgroundsStore).isRequired };

export default inject('backgroundsStore')(observer(Menu));
