import React, { useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	ListItem,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
	MenuItem,
	Select,
	Slider,
	Switch,
	Box,
	Checkbox,
} from '@material-ui/core';
import {
	NavigateNextRounded as ArrowRightIcon,
	ExpandMoreRounded as ArrowBottomIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import locale from '@/i18n/RU';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingRight: theme.spacing(4),
		flexDirection: 'column',
		alignItems: 'stretch',
	},
	secondaryAction: {
		width: '100%',
		justifyContent: 'flex-end',
		display: 'flex',
		alignItems: 'center',
		justifySelf: 'center',
		position: 'relative',
		right: 'unset',
		top: 'unset',
		transform: 'unset',
		flexShrink: 0,
		flexGrow: 1,
	},
	noPointerEvents: { pointerEvents: 'none' },
	rowWrapper: {
		display: 'flex',
		position: 'relative',
		textAlign: 'left',
		width: '100%',

	},
	bodyWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		paddingLeft: 56,
		paddingBottom: theme.spacing(1.5),
	},
	textWrapper: {},
	linkArrow: { marginLeft: theme.spacing(1) },
}));

const TYPE = {
	LINK: 'LINK',
	SLIDER: 'SLIDER',
	SELECT: 'SELECT',
	MULTISELECT: 'MULTISELECT',
	CHECKBOX: 'CHECKBOX',
	NONE: 'NONE',
	CUSTOM: 'CUSTOM',
};

function MenuRow(props) {
	const classes = useStyles();
	const {
		title,
		description,
		withoutIcon,
		action: {
			type: actionType = TYPE.NONE,
			width: actionWidth = 252,
			...actionProps
		} = {},
		width = 750,
		children,
	} = props;

	const [value, setValue] = useState((actionType === TYPE.CHECKBOX && actionProps.checked) || actionProps.value);

	return (
		<ListItem
			classes={{ root: classes.root }}
			style={{ width }}
			button={actionType === TYPE.LINK || actionType === TYPE.CHECKBOX}
			onClick={(event) => {
				if (actionType === TYPE.LINK && actionProps.onClick) actionProps.onClick(event);
				if (actionType === TYPE.CHECKBOX) {
					setValue(!value);
					if (actionProps.onChange) actionProps.onChange(event, !value);
				}
			}}
		>
			<div className={classes.rowWrapper}>
				{!withoutIcon && <ListItemAvatar />}
				<ListItemText
					primary={title}
					secondary={description}
					className={classes.textWrapper}
				/>
				{actionType !== TYPE.NONE && (
					<ListItemSecondaryAction
						className={clsx(
							actionType === TYPE.LINK && classes.noPointerEvents,
							classes.secondaryAction,
						)}
						style={{ maxWidth: actionWidth }}
					>
						{actionType === TYPE.LINK && (
							<Fragment>
								{actionProps && actionProps.component}
								<ArrowRightIcon className={classes.linkArrow} />
							</Fragment>
						)}
						{actionType === TYPE.SLIDER && (
							<Slider {...actionProps} valueLabelDisplay="auto" />
						)}
						{actionType === TYPE.SELECT && (
							<Select
								{...actionProps}
								variant="outlined"
								style={{ width: '100%' }}
								IconComponent={ArrowBottomIcon}
							>
								{actionProps.values.map((value) => (
									<MenuItem key={value} value={value}>
										{(actionProps.locale && actionProps.locale[value]) || value}
									</MenuItem>
								))}
							</Select>
						)}
						{actionType === TYPE.MULTISELECT && (
							<Select
								{...actionProps}
								variant="outlined"
								style={{ width: '100%' }}
								multiple
								IconComponent={ArrowBottomIcon}
								displayEmpty
								renderValue={(selected) => {
									if (actionProps.value && (actionProps.value.length === 0)) {
										return locale.global.nothing_selected;
									} else if (
										actionProps.values && actionProps.value
										&& (actionProps.values.length === actionProps.value.length)
									) {
										return locale.global.all;
									} else {
										return selected && selected
											.map((value) => (actionProps.locale && actionProps.locale[value]) || value)
											.join(', ');
									}
								}}
							>
								{actionProps.values.map((value) => (
									<MenuItem key={value} value={value}>
										<Checkbox
											color="primary"
											checked={actionProps.value && actionProps.value.indexOf(value) > -1}
										/>
										<ListItemText
											primary={(actionProps.locale && actionProps.locale[value]) || value} />
									</MenuItem>
								))}
							</Select>
						)}
						{actionType === TYPE.CHECKBOX && (
							<Switch
								edge="end"
								checked={value}
								{...actionProps}
							/>
						)}
						{actionType === TYPE.CUSTOM && (
							actionProps.component
						)}
					</ListItemSecondaryAction>
				)}
			</div>
			{children && (
				<Box className={classes.bodyWrapper}>{children}</Box>
			)}
		</ListItem>
	);
}

MenuRow.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string,
	withoutIcon: PropTypes.bool,
	action: PropTypes.exact({
		type: PropTypes.oneOf(Object.keys(TYPE).map((type) => TYPE[type])),
		width: PropTypes.number,
	}),
	width: PropTypes.number,
	children: PropTypes.element,
};
MenuRow.defaultProps = {
	description: null,
	withoutIcon: false,
	width: 750,
	children: null,
	action: {
		type: TYPE.NONE,
		width: 252,
	},
};

export const ROWS_TYPE = TYPE;

export default MenuRow;
