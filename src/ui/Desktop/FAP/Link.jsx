import React from 'react';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import { useTranslation } from 'react-i18next';
import { first } from 'lodash';
import FAPButton from './Button';

function LinkButton(props) {
    const {
        id,
        name,
        url,
        icoUrl,
        icoVariant,
        className: externalClassName,
        children,
    } = props;
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
            {children}
            {!children && (
                <Image
                    src={icoUrl}
                    alternativeIcon={first(name)?.toUpperCase()}
                    variant={icoVariant === BKMS_VARIANT.POSTER ? BKMS_VARIANT.SYMBOL : icoVariant}
                />
            )}
        </FAPButton>
    );
}

export default observer(LinkButton);
