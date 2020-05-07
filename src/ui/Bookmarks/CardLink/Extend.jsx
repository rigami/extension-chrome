import React from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Card,
	Avatar,
	Typography,
	CardActionArea,
	Tooltip,
	Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
	LinkRounded as LinkIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	root: {
		width: 180,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	rootActionWrapper: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		justifyContent: 'flex-end',
	},
	icon: {
		margin: 'auto',
	},
	body: {
		width: '100%',
		padding: theme.spacing(1, 2),
		paddingTop: 0,
	},
	categoriesWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		marginBottom: theme.spacing(0.5),
	},
	category: {
		width: theme.spacing(1),
		height: theme.spacing(1),
		borderRadius: theme.spacing(0.5),
		marginRight: theme.spacing(0.6),
	},
	title: {
		display: '-webkit-box',
		'-webkit-box-orient': 'vertical',
		'-webkit-line-clamp': 2,
		overflow: 'hidden',
		lineHeight: 1.2,
	},
	banner: {
		width: '100%',
		height: 90,
		backgroundColor: theme.palette.grey[300],
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: theme.spacing(1),
	},
	description: {
		color: theme.palette.text.secondary,
		display: '-webkit-box',
		'-webkit-box-orient': 'vertical',
		'-webkit-line-clamp': 4,
		overflow: 'hidden',
		marginTop: theme.spacing(0.6),
	},
}));

function CardLink({ title, src, icon, categories, description, ...other }) {
	const classes = useStyles();

	return (
		<Tooltip
			title={(
				<Fragment>
					{title}
					<br/>
					<Typography variant='caption'>{src}</Typography>
				</Fragment>
			)}
			enterDelay={400}
		>
			<Card className={classes.root} variant="outlined" {...other}>
				<CardActionArea className={classes.rootActionWrapper}>
					<Box className={classes.banner}>
						<Avatar className={classes.icon}>
							<LinkIcon />
						</Avatar>
					</Box>
					<div className={classes.body}>
						<div className={classes.categoriesWrapper}>
							{categories.map(({ title, color, id }) => (
								<div key={id} className={classes.category} style={{ backgroundColor: color }} />
							))}
						</div>
						<Typography className={classes.title}>{title}</Typography>
						{description && (<Typography variant="body2" className={classes.description}>{description}</Typography>)}
					</div>
				</CardActionArea>
			</Card>
		</Tooltip>
	);
}

export default CardLink;
