import {
    adapt,
    restore
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
     */
    constructor(adapters, source) {
        adapt(this, source, adapters);

        /**
         * @type {function} 适配数据
         * @param {object} source
         */
        this.$adapt = function(source) {
            adapt(this, source, adapters);
        };

        /**
         * @type {function} 还原数据
         * @return {object}
         */
        this.$restore = function() {
            return restore(this, adapters);
        };
    }
}