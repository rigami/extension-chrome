import { action, computed, makeAutoObservable } from 'mobx';
import { assign } from 'lodash';

class TempStorage {
    _data = {};

    constructor() {
        makeAutoObservable(this);
    }

    @computed
    get data() {
        return this._data;
    }

    @action.bound
    update(changeData = {}) {
        assign(this._data, changeData);
    }
}

export default TempStorage;
