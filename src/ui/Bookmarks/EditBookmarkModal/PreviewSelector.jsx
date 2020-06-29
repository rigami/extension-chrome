import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Fade,
    Collapse,
} from '@material-ui/core';
import {
    ToggleButtonGroup,
    ToggleButton,
} from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(2),
    },
    headerActions: {
        marginRight: 0,
        marginTop: 0,
    },
    content: {
        padding: theme.spacing(2),
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: '0 !important',
        display: 'flex',
        flexWrap: 'wrap',
    },
    card: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));


function PreviewSelector(props) {
    const {
        isOpen,
        name,
        description,
        categories,
        onChange,
        images,
    } = props;
    const classes = useStyles();
    const [type, setType] = useState('default');

    return (
        <Collapse in={isOpen} unmountOnExit>
            <Card className={classes.root} elevation={8}>
                <CardHeader
                    title="Другие варианты карточек"
                    classes={{
                        action: classes.headerActions,
                    }}
                    action={(
                        <ToggleButtonGroup
                            exclusive
                            value={type}
                            onChange={(event, newType) => newType && setType(newType)}
                        >
                            <ToggleButton value="default">
                                Обычные
                            </ToggleButton>
                            <ToggleButton value="extend">
                                Расширенные
                            </ToggleButton>
                        </ToggleButtonGroup>
                    )}
                />
                <CardContent className={classes.content}>
                    {images.map(({ url }) => (
                        <CardLink
                            key={url}
                            name={name}
                            description={description}
                            categories={categories}
                            type={type}
                            imageUrl={url}
                            preview
                            className={classes.card}
                            onClick={() => {
                                console.log("onClick")
                                onChange(url, type);
                            }}
                        />
                    ))}
                </CardContent>
            </Card>
        </Collapse>
    );
}

export default PreviewSelector;
