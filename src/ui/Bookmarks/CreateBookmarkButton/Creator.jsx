import React, { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    Typography,
    TextField,
    ButtonGroup,
} from '@material-ui/core';
import { AddRounded as AddIcon, LinkRounded as URLIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import CardLink from '@/ui/Bookmarks/CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';
import Categories from '../Ctegories';

const { global: localeGlobal } = locale;

const useStyles = makeStyles((theme) => ({
    bgCardRoot: { display: 'flex' },
    content: { flex: '1 0 auto' },
    cover: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: theme.palette.grey[900],
        boxSizing: 'content-box',
        minWidth: 180,
    },
    typeSwitcher: { marginBottom: theme.spacing(2) },
    notSelectButton: { color: theme.palette.text.secondary },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    input: { marginTop: theme.spacing(2) },
    chipContainer: { marginTop: theme.spacing(2) },
    addDescriptionButton: { marginTop: theme.spacing(2) },
}));

function BGPreview(props) {
    const {
        url,
        name,
        type,
        description,
        onChangeType,
    } = props;
    const classes = useStyles();

    return (
        <CardMedia
            className={classes.cover}
        >
            {/* <CircularProgress style={{ color: theme.palette.common.white }} /> */}
            {name && url && (
                <React.Fragment>
                    <ButtonGroup className={classes.typeSwitcher}>
                        <Button
                            className={type !== 'default' && classes.notSelectButton}
                            color={type === 'default' && 'primary'}
                            variant={type === 'default' && 'contained'}
                            onClick={() => onChangeType('default')}
                        >
                            Обычная
                        </Button>
                        <Button
                            className={type !== 'extend' && classes.notSelectButton}
                            color={type === 'extend' && 'primary'}
                            variant={type === 'extend' && 'contained'}
                            onClick={() => onChangeType('extend')}
                        >
                            Расширенная
                        </Button>
                    </ButtonGroup>
                    <CardLink
                        name={name}
                        description={description}
                        categories={[]}
                        type={type}
                    />
                </React.Fragment>
            )}
            {!url && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description="Укажите адрес"
                />
            )}
            {!name && url && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description="Дайте закладке имя"
                />
            )}
        </CardMedia>
    );
}

function Creator({ onSave, onCancel }) {
    const classes = useStyles();
    const theme = useTheme();

    const bookmarksStore = useBookmarksService();
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('default');
    const [categories, setCategories] = useState([]);

    const handlerSave = () => {
        bookmarksStore.addBookmark({
            url,
            name,
            description,
            categories,
            type,
        })
            .then(() => onSave());
    };

    return (
        <Container
            maxWidth="md"
            style={{
                marginBottom: theme.spacing(3),
                marginTop: theme.spacing(3),
            }}
        >
            <Card className={classes.bgCardRoot} elevation={8}>
                <BGPreview
                    url={url !== ''}
                    name={name}
                    type={type}
                    description={description}
                    onChangeType={(newType) => setType(newType)}
                />
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography component="h5" variant="h5">
                            Добавление закладки
                        </Typography>
                        <TextField
                            label="URL адрес"
                            variant="outlined"
                            fullWidth
                            className={classes.input}
                            onChange={(event) => setUrl(event.target.value.trim())}
                        />
                        <TextField
                            label="Название"
                            variant="outlined"
                            fullWidth
                            className={classes.input}
                            onChange={(event) => setName(event.target.value.trim())}
                        />
                        <Categories
                            className={classes.chipContainer}
                            sortByPopular
                            onChange={(newCategories) => setCategories(newCategories)}
                            autoSelect
                        />
                        {description !== null && (
                            <TextField
                                label="Описание"
                                variant="outlined"
                                fullWidth
                                className={classes.input}
                                multiline
                                rows={3}
                                rowsMax={3}
                                onChange={(event) => setDescription(event.target.value.trim())}
                            />
                        )}
                        {description === null && (
                            <Button
                                startIcon={<AddIcon />}
                                className={classes.addDescriptionButton}
                                onClick={() => setDescription('')}
                            >
                                Добавить описание
                            </Button>
                        )}
                    </CardContent>
                    <div className={classes.controls}>
                        <Button
                            variant="text"
                            color="default"
                            className={classes.button}
                            onClick={onCancel}
                        >
                            {localeGlobal.cancel}
                        </Button>
                        <div className={classes.button}>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!url || !name}
                                onClick={handlerSave}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </Container>
    );
}

export default observer(Creator);
