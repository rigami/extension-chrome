import React, { useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Card,
	Popper,
	ClickAwayListener,
	Tooltip,
	Chip,
	InputBase,
	Button,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	popperWrapper: { zIndex: theme.zIndex.modal },
	popper: {
		display: 'flex',
		alignItems: 'center',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	addCategory: {
		marginLeft: '3px !important',
		marginRight: 3,
	},
	addCategoryTitle: { display: 'none' },
	input: { padding: theme.spacing(2) },
	saveButton: {
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(2),
	},
	chipActive: {
		backgroundColor: '#616161',
		borderColor: '#616161',
		'&:focus': {
			backgroundColor: '#616161 !important',
			borderColor: '#616161',
		},
		'&:hover': {
			backgroundColor: '#888888 !important',
			borderColor: '#888888',
		},
	},
}));

function CreateCategoryButton () {
	const classes = useStyles();
	const [anchorEl, setAnchorEl] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isBlockEvent, setIsBlockEvent] = useState(false);

	return (
		<Fragment>
			<ClickAwayListener
				onClickAway={() => {
					if (isBlockEvent) return;

					setIsOpen(false);
				}}
				mouseEvent="onMouseDown"
			>
				<Popper
					open={isOpen} anchorEl={anchorEl} placement="bottom"
					className={classes.popperWrapper}>
					<Card className={classes.popper} elevation={16}>
						<InputBase className={classes.input} placeholder="Категория" variant="outlined" />
						<Button className={classes.saveButton} variant="contained" color="primary">Сохранить</Button>
					</Card>
				</Popper>
			</ClickAwayListener>
			<Tooltip title="Добавить новую категорию">
				<Chip
					ref={anchorEl}
					onMouseDown={() => {
						if (!isOpen) setIsBlockEvent(true);
					}}
					onClick={(event) => {
						setAnchorEl(event.currentTarget);
						if (isBlockEvent) setIsOpen(true);
						setIsBlockEvent(false);
					}}
					classes={{
						root: isOpen && classes.chipActive,
						icon: classes.addCategory,
						label: classes.addCategoryTitle,
					}}
					icon={<AddIcon />}
					variant='outlined'
				/>
			</Tooltip>
		</Fragment>
	);
}

export default CreateCategoryButton;
