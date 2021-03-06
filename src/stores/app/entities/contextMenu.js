import { assign, pick } from 'lodash';

class ContextMenuItem {
    type = 'button';
    title;
    icon;
    disabled;
    iconProps;
    onClick;

    constructor(item) {
        assign(this, pick(item, [
            'title',
            'disabled',
            'icon',
            'iconProps',
            'onClick',
        ]));
    }
}

class ContextMenuDivider {
    type = 'divider';
}

export {
    ContextMenuItem,
    ContextMenuDivider,
};
