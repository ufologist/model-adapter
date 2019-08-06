import {
    adapt,
    restore,
    getOneToOneAdapters
} from './adapter-util.js';

/**
 * 模型适配器
 */
export default class ModelAdapter {
    /**
     * 
     * @param {string | object} [adapters] 
     * @param {string | function} adapters.path
     * @param {* | function} adapters.defaultValue
     * @param {string | RegExp | function} adapters.validator
     * @param {function} adapters.transformer
     * @param {function} adapters.restorer
     * @param {*} [source] 
     * @param {boolean} [copy = true] 
     */
    constructor(adapters, source, copy = true) {
        var _adapters = adapters;
        var _source = source;

        /**
         * @type {function} 适配数据
         * @param {object} source
         */
        this.$adapt = function(source) {
            if (copy) {
                _adapters = Object.assign(getOneToOneAdapters(source), _adapters);
            }

            adapt(this, source, _adapters);
        };

        /**
         * @type {function} 还原数据
         * @return {object}
         */
        this.$restore = function() {
            return restore(this, _adapters);
        };

        this.$adapt(_source);
    }
}