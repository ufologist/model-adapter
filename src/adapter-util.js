import dotProp from 'dot-prop';
import defaultsDeep from './fav-prop.defaults-deep.js';

/**
 * 获取 path 分组
 * 
 * @param {string} path 
 * @return {Array<string>}
 * @see https://github.com/sindresorhus/dot-prop
 */
function getPathSegments(path) {
    const pathArray = path.split('.');
    const parts = [];

    for (let i = 0; i < pathArray.length; i++) {
        let p = pathArray[i];

        while (p[p.length - 1] === '\\' && pathArray[i + 1] !== undefined) {
            p = p.slice(0, -1) + '.';
            p += pathArray[++i];
        }

        parts.push(p);
    }

    return parts;
}

/**
 * 根据 path 获取父级对象
 * 
 * 例如 path 为: a.b.c
 * 我们需要先拿到 a.b 这个目标对象
 * 
 * @param {object} target 
 * @param {string} propertyPath
 * @return {object}
 */
function getParentObject(target, propertyPath) {
    var parentObject = null;

    var pathArray = getPathSegments(propertyPath);
    if (pathArray.length === 1) {
        parentObject = target;
    } else {
        var parentPropertyPath = pathArray.slice(0, pathArray.length - 1).join('.');
        parentObject = dotProp.get(target, parentPropertyPath);
        if (typeof parentObject === 'undefined' || parentObject === null) {
            parentObject = {};
            dotProp.set(target, parentPropertyPath, parentObject);
        }
    }

    return parentObject;
}

/**
 * 适配数据
 * 
 * @param {object} target 
 * @param {object} propertyAdapter
 * @param {object} register
 * @return {object}
 */
export function adapt(target, propertyAdapter, register) {
    for (var propertyPath in propertyAdapter) {
        var adapter = propertyAdapter[propertyPath] || {};

        // 通过 getter/setter 实现转换器转换数据
        if (adapter.transformer) {
            var pathArray = getPathSegments(propertyPath);
            var propertyName = pathArray[pathArray.length - 1];
            var definePropertyTarget = getParentObject(target, propertyPath);

            var propertyValue = dotProp.get(target, propertyPath);
            dotProp.set(register, propertyPath, propertyValue);

            // 将原属性改写为 getter/setter, 属性值保存到寄存器上
            Object.defineProperty(definePropertyTarget, propertyName, {
                get: function() {
                    // TODO 如果要适配的属性本身是一个 getter/setter 呢?
                    // 从寄存器上获取属性值
                    var original = dotProp.get(register, propertyPath);
                    return adapter.transformer(original, target);
                },
                set: function(value) {
                    // 将属性值保存到寄存器上
                    dotProp.set(register, propertyPath, value);
                },
                configurable: true,
                enumerable: true
            });
        }
    }

    return target;
}

/**
 * 还原数据
 * 
 * @param {object} target 
 * @param {object} propertyAdapter 
 * @param {object} register 
 * @return {object}
 */
export function restore(target, propertyAdapter, register) {
    var source = defaultsDeep({}, target);

    for (var propertyPath in propertyAdapter) {
        var adapter = propertyAdapter[propertyPath] || {};

        // 去除 getter/setter 转换器, 还原为原始值
        if (adapter.transformer) {
            var pathArray = getPathSegments(propertyPath);
            var propertyName = pathArray[pathArray.length - 1];
            // 原始值在寄存器上
            var propertyValue = dotProp.get(register, propertyPath);
            var definePropertyTarget = getParentObject(source, propertyPath);

            Object.defineProperty(definePropertyTarget, propertyName, {
                value: propertyValue,
                configurable: true,
                enumerable: true,
                writable: true
            });
        }
    }

    return source;
}