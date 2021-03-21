import React from 'react';
import { ExpandLessRounded as MoreIcon } from '@material-ui/icons';
import ButtonWithPopper from '@/ui/Desktop/FAP/ButtonWithPopper';
import { useTranslation } from 'react-i18next';
import Explorer from './Explorer';

function CollapseTray(props) {
    const { offsetLoad, classes: externalClasses } = props;
    const { t } = useTranslation();

    return (
        <ButtonWithPopper
            classes={externalClasses}
            iconOpen={MoreIcon}
            name={t('button.more')}
            popperProps={{ placement: 'top-end' }}
        >
            <Explorer offsetLoad={offsetLoad} />
        </ButtonWithPopper>
    );
}

export default CollapseTray;
