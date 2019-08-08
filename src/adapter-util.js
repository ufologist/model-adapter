import dotProp from 'dot-prop';

/**
 * 适配数据
 * 
 * @param {object} target 
 * @param {object} source 
 * @param {object} adapters
 * @return {object}
 */
export function adapt(target, source, adapters) {
    for (var key in adapters) {
        var adapter = normalizeAdapter(adapters[key], key);

        // 通过 path 获取对象上的属性值
        var value = dotProp.get(source, adapter.path);

        // 当获取的属性值为 undefined 或者 null 时使用 defaultValue
        // 因为大部分情况下, 数据模型中的属性多是 null 值, 而非 undefined
        //
        // path get 库的处理机制是: 只有当获取的属性值为 undefined 时才会使用 defaultValue
        // 因此这里我们需要自己来处理, 不使用 path get 库的逻辑
        if ((typeof value === 'undefined' || value === null) && typeof adapter.defaultValue !== 'undefined') {
            value = adapter.defaultValue;
        }

        // 先验证数据再转换数据
        // 当没有 source 时不验证数据
        if (typeof source !== 'undefined') {
            validate(value, adapter);
        }
        // 转换器转换数据
        if (adapter.transformer) {
            value = adapter.transformer(value, source);
        }

        target[key] = value;
    }

    return target;
}

/**
 * 还原数据
 * 
 * @param {object} model 
 * @param {object} adapters 
 * @return {object}
 */
export function restore(model, adapters) {
    var source = {};

    for (var key in adapters) {
        var adapter = normalizeAdapter(adapters[key], key);

        var value = model[key];
        // 先还原数据再验证数据
        if (adapter.restorer) {
            value = adapter.restorer(value, model);
        }
        validate(value, adapter);

        dotProp.set(source, adapter.path, value);
    }

    return source;
}

/**
 * 获取一对一映射属性的适配器
 * 
 * @param {*} source 
 * @return {object} adapters 
 */
export function getOneToOneAdapters(source) {
    var adapters = {};
    for (var key in source) {
        adapters[key] = key;
    }
    return adapters;
}

/**
 * 规范化适配器
 * 
 * @param {object | string | function} adapter 
 * @param {string} key 
 * 
 * @return {object}
 * @property {string} path
 * @property {*} defaultValue
 * @property {function} validator
 * @property {function} transformer
 * @property {function} restorer
 */
function normalizeAdapter(adapter, key) {
    var path;
    var defaultValue;

    var validator;

    var transformer;
    var restorer;

    if (typeof adapter === 'string' || typeof adapter === 'function') {
        path = adapter;
    } else if (adapter && typeof adapter === 'object') {
        path = adapter.path;
        defaultValue = adapter.defaultValue;
        validator = adapter.validator;
        transformer = adapter.transformer;
        restorer = adapter.restorer;
    }

    if (!path) { // 默认的 path 为属性名
        path = key;
    } else if (typeof path === 'function') {
        // TODO 传入 source, key?
        path = path();
    }

    if (typeof defaultValue === 'function') {
        defaultValue = defaultValue();
    }

    return {
        path: path,
        defaultValue: defaultValue,
        validator: validator,
        transformer: transformer,
        restorer: restorer
    };
}

/**
 * 验证数据(仅输出日志提示)
 * 
 * @param {*} value 
 * @param {object} adapter 
 */
function validate(value, adapter) {
    if (adapter.validator) {
        var valid = false;

        if (typeof adapter.validator === 'string') { // 数据类型
            valid = typeof value === adapter.validator;
        } else if (adapter.validator instanceof RegExp) { // 正则检测
            valid = adapter.validator.test(value);
        } else if (typeof adapter.validator === 'function') { // 验证器方法
            try {
                valid = adapter.validator(value);
            } catch (error) {
                console.error('validator error', error);
            }
        } else {
            console.warn('unknown type of validator', adapter.validator, adapter);
        }

        if (!valid) {
            console.warn('validator result is invalid', adapter.path, value, adapter.validator, adapter);
        }
    }
}