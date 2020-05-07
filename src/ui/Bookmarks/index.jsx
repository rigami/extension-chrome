import React, { useEffect } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Box,
	Drawer,
	Container,
	ListItem,
	ListItemText,
	ListItemIcon,
	Chip,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
	LabelRounded as LabelIcon,
} from '@material-ui/icons';
import CardLink from './CardLink';
import CardLinkExtend from './CardLink/Extend';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		overflow: 'auto',
	},
	categoryWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	chipContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
	container: {
		paddingTop: theme.spacing(2),
	},
}));

function Bookmarks() {
	const classes = useStyles();
	const theme = useTheme();

	useEffect(() => {

	}, []);

	return (
		<Drawer
			anchor="bottom"
			open={true}
			onClose={() => {}}
			disableEnforceFocus
		>
			<Box className={classes.root}>
				<Container className={classes.container}>
					<Box className={classes.chipContainer}>
						{[].concat(...Array.from({ length: 15 }, (elem, index) => ({
							label: `Category #${index + 1}`,
						}))).map(({ label }) => (
							<Chip label={label} onClick={() => {}} />
						))}
					</Box>
					{
						[].concat(...Array.from({ length: 563 }, (e, index) => ({
							title: index % 3 ? `Пример ссылки #${index + 1}` : `Пример очееень длиного названия ссылки #${index +
							1}`,
							description:  index % 4 ?
								index % 3 ?
									"Описание ссылки, оно не так сильно выделяется"
									: "Описание ссылки, оно не так сильно выделяется. Теперь в 2 раза длинее! Ого скажете вы а неет, все норм, это для теста"
								: null,
							src: "https://website.com",
							icon: null,
							categories: [
								{ id: 0, title: "Category #1", color: "#EB4799"},
								{ id: 1, title: "Category #2", color: "#FF8800"},
								{ id: 2, title: "Category #3", color: "#FFC933"},
							]
						})))
						.reduce((acc, curr, index) => {
							let category = Math.floor(index / 97);
							let column = index % 6;

							if (typeof acc[category] === 'undefined') acc[category] = [];
							if (typeof acc[category][column] === 'undefined') acc[category][column] = [];

							acc[category][column].push(curr);

							return acc;
						}, [])
						.map((category, index) => (
							<Fragment>
								<ListItem disableGutters>
									<ListItemIcon style={{ minWidth: 36 }} >
										<LabelIcon style={{ color: "#FF8800" }} />
									</ListItemIcon>
									<ListItemText
										primary={`Category #${index + 1}`}
										secondary={`Description category #${index + 1}`}
									/>
								</ListItem>
								<Box className={classes.categoryWrapper}>
									{category.map((column, index, arr) => (
										<Box style={{ marginRight: arr.length - 1 !== index && theme.spacing(2) }}>
										{column.map((card) => (
											Math.random() > 0.5 ? (
												<CardLinkExtend {...card} style={{ marginBottom: theme.spacing(2) }} />
											) : (
												<CardLink {...card} style={{ marginBottom: theme.spacing(2) }} />
											)
										))}
										</Box>
									))}
								</Box>
							</Fragment>
						))
					}
				</Container>
			</Box>
		</Drawer>
	);
}

export default observer(Bookmarks);
