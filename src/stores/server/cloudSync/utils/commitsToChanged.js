import {
    each,
    first,
    last,
    mapValues,
    pickBy,
} from 'lodash';

export default function commitsToChanged(itemIdFieldName = 'itemId', commits) {
    let changesItems = {};

    commits.forEach((commit) => {
        changesItems[commit[itemIdFieldName]] = [...(changesItems[commit[itemIdFieldName]] || []), commit];
    });

    changesItems = pickBy(changesItems, (actions) => (
        actions.length === 1
        || first(actions).action !== 'create'
        || last(actions).action !== 'delete'
    ));

    changesItems = mapValues(changesItems, (actions) => last(actions));

    const changesItemsByActions = {};

    each(changesItems, ({ action, ...commit }, itemId) => {
        changesItemsByActions[action] = [
            ...(changesItemsByActions[action] || []),
            {
                [itemIdFieldName]: itemId,
                ...commit,
            },
        ];
    });

    return changesItemsByActions;
}
