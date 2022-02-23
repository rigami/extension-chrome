import React from 'react';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { first } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import FavoriteItem from '@/ui-components/FavoriteItem';
import FAPButton from './Button';

const useStyles = makeStyles(() => ({
    dense: {
        background: 'none',
        border: 'none',
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 'inherit',
    },
}));

function LinkButton(props) {
    const {
        id,
        name,
        url,
        icoUrl,
        icoVariant,
        className: externalClassName,
        children,
        dense,
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
            onMouseUp={handleClick}
        >
            {!children && dense && (
                <FavoriteItem
                    type="bookmark"
                    name={name}
                    icoUrl={icoUrl}
                    icoVariant={icoVariant}
                    className={classes.dense}
                />
            )}
            {children}
            {!children && !dense && (
                <Image
                    src={icoUrl}
                    alternativeIcon={first(name)?.toUpperCase()}
                    variant={icoVariant === BKMS_VARIANT.POSTER ? BKMS_VARIANT.SYMBOL : icoVariant}
                    className={classes.image}
                />
            )}
        </FAPButton>
    );
}

export default observer(LinkButton);
