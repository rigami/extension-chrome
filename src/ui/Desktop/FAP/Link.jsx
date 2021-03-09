import React from 'react';
import {
    ButtonBase,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import { useTranslation } from 'react-i18next';
import FAPButton from './Button';

const useStyles = makeStyles((theme) => ({
    row: {
        margin: 0,
        padding: theme.spacing(1, 2),
        borderRadius: 0,
    },
    primaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
    },
    secondaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
    },
}));

function LinkButton(props) {
    const {
        id,
        name,
        description,
        url,
        imageUrl,
        icoVariant,
        variant = 'icon',
        className: externalClassName,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    const handleClick = (event) => {
        if (!url) return;

        if (event.button === 1) {
            window.open(url);
        } else if (event.button === 0) {
            window.open(url, '_self');
        }
    };

    return (
        <FAPButton
            className={externalClassName}
            id={id}
            tooltip={(
                <React.Fragment>
                    {name}
                    <br />
                    <Typography variant="caption">{url || t('bookmark.urlNotValid')}</Typography>
                </React.Fragment>
            )}
        >
            {variant === 'row' ? (
                <ListItem
                    button
                    onMouseUp={handleClick}
                    className={classes.row}
                >
                    <ListItemAvatar>
                        <Image variant={icoVariant === 'poster' ? 'small' : icoVariant} src={imageUrl} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={name}
                        secondary={description}
                        classes={{
                            primary: classes.primaryText,
                            secondary: classes.secondaryText,
                        }}
                    />
                </ListItem>
            ) : (
                <ButtonBase onMouseUp={handleClick}>
                    <Image
                        src={imageUrl}
                        alternativeIcon={icoVariant === BKMS_VARIANT.SYMBOL ? name[0].toUpperCase() : undefined}
                    />
                </ButtonBase>
            )}
        </FAPButton>
    );
}

export default observer(LinkButton);
