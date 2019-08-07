import ModelAdapter from '../src/model-adapter.js';

/**
 * JSON.stringify replacer 支持输出 undefined 属性
 */
function stringifyReplacer(key, value) {
    if (typeof value === 'undefined') {
        return 'undefined';
    } else {
        return value;
    }
}

describe('构造函数', function() {
    test('没有适配器', function() {
        var model = new ModelAdapter();
        expect(typeof model.$adapt).toBe('function');
        expect(typeof model.$restore).toBe('function');
    });

    test('一对一的属性适配', function() {
        var model = new ModelAdapter({
            ccc: 'c.cc1.ccc'
        }, {
            a: 'a',
            b: 'b',
            c: {
                cc1: {
                    ccc: 'ccc1'
                },
                cc2: {
                    ccc: 'ccc2'
                }
            }
        });

        // 复制的属性
        expect(model.a).toBe('a');
        expect(model.b).toBe('b');
        expect(model.c).toBeDefined();
        // 明确适配的属性
        expect(model.ccc).toBe('ccc1');
        expect(JSON.stringify(model)).toBe('{"a":"a","b":"b","c":{"cc1":{"ccc":"ccc1"},"cc2":{"ccc":"ccc2"}},"ccc":"ccc1"}');
    });

    test('不 copy 属性', function() {
        var model = new ModelAdapter({
            ccc: 'c.cc1.ccc'
        }, {
            a: 'a',
            b: 'b',
            c: {
                cc1: {
                    ccc: 'ccc1'
                },
                cc2: {
                    ccc: 'ccc2'
                }
            }
        }, false);

        expect(JSON.stringify(model)).toBe('{"ccc":"ccc1"}');
    });

    test('没有源数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        });

        var json = JSON.stringify(model, stringifyReplacer);
        expect(json).toBe('{"a":"undefined","b":"undefined"}');
    });

    test('有源数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        }, {
            a: 1,
            b: '2'
        });

        expect(model.a).toBe(1);
        expect(model.b).toBe('2');
    });
});

describe('$adapt', function() {
    test('没有源数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        });

        model.$adapt({
            a: 1,
            b: '2'
        });

        expect(model.a).toBe(1);
        expect(model.b).toBe('2');
    });

    test('有源数据', function() {
        var model = new ModelAdapter({
            a: 'a'
        }, {
            a: 1,
            b: '2'
        });

        model.$adapt({
            a: 11,
            b: '22'
        });

        expect(model.a).toBe(11);
        expect(model.b).toBe('22');
    });

    test('重复执行', function() {
        var model = new ModelAdapter({
            a: 'a'
        }, {
            a: 1,
            b: '2'
        });

        model.$adapt({
            a: 11,
            b: '22'
        });
        model.$adapt({
            a: 111,
            b: '222'
        });

        expect(model.a).toBe(111);
        expect(model.b).toBe('222');
    });
});

describe('$restore', function() {
    test('一对一的属性适配', function() {
        var model = new ModelAdapter({
            ccc: 'c.cc1.ccc'
        }, {
            a: 'a',
            b: 'b',
            c: {
                cc1: {
                    ccc: 'ccc1'
                },
                cc2: {
                    ccc: 'ccc2'
                }
            }
        });

        var source = model.$restore();

        // 复制的属性
        expect(source.a).toBe('a');
        expect(source.b).toBe('b');
        expect(source.c).toBeDefined();
        expect(JSON.stringify(source)).toBe('{"a":"a","b":"b","c":{"cc1":{"ccc":"ccc1"},"cc2":{"ccc":"ccc2"}}}');
    });

    test('不 copy 属性', function() {
        var model = new ModelAdapter({
            ccc: 'c.cc1.ccc'
        }, {
            a: 'a',
            b: 'b',
            c: {
                cc1: {
                    ccc: 'ccc1'
                },
                cc2: {
                    ccc: 'ccc2'
                }
            }
        }, false);

        var source = model.$restore();
        expect(JSON.stringify(source)).toBe('{"c":{"cc1":{"ccc":"ccc1"}}}');
    });

    test('没有源数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        });

        var source = model.$restore();
        var json = JSON.stringify(source, stringifyReplacer);
        expect(json).toBe('{"a":"undefined","b":"undefined"}');
    });

    test('有源数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        }, {
            a: 1,
            b: '2'
        });

        var source = model.$restore();

        expect(source.a).toBe(1);
        expect(source.b).toBe('2');
    });

    test('修改数据', function() {
        var model = new ModelAdapter({
            a: 'a'
        }, {
            a: 1,
            b: '2'
        });

        // 修改数据
        model.a = 11;
        model.b = '22';

        var source = model.$restore();
        expect(source.a).toBe(11);
        expect(source.b).toBe('22');
    });

    test('重复执行', function() {
        var model = new ModelAdapter({
            a: 'a'
        }, {
            a: 1,
            b: '2'
        });

        var source = model.$restore();
        source = model.$restore();

        expect(source.a).toBe(1);
        expect(source.b).toBe('2');
    });
});

describe('adapter', function() {
    test('path', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b.bb.bbb',     // 嵌套
            ccc: 'c.cc.1.ccc', // 数组
            ddd: function() {  // 方法返回 path
                return 'd.dd.ddd';
            },
            e: '',             // 默认 path 为属性名
            f: 'f.ff.fff',
            g: null
        }, {
            a: 'a',
            b: {
                bb: {
                    bbb: 'bbb'
                }
            },
            c: {
                cc: [{
                    ccc: 'ccc0'
                }, {
                    ccc: 'ccc1'
                }]
            },
            d: {
                dd: {
                    ddd: 'ddd'
                }
            },
            e: 'e',
            g: 'g'
        });

        expect(model.a).toBe('a');
        expect(model.b).toBe('bbb');
        expect(model.ccc).toBe('ccc1');
        expect(model.ddd).toBe('ddd');
        expect(model.e).toBe('e');
        expect(model.f).toBeUndefined();
        expect(model.g).toBe('g');
    });

    test('defaultValue', function() {
        var model = new ModelAdapter({
            a: {
                defaultValue: '-'
            },
            b: {
                defaultValue: function() {
                    return '/';
                }
            }
        });

        expect(model.a).toBe('-');
        expect(model.b).toBe('/');
    });

    test('validator', function() {
        var model = new ModelAdapter({
            a: {
                validator: 'string'
            },
            b: {
                validator: /\d/
            },
            c: {
                validator: function(value) {
                    if (value >= 60) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            d: {
                validator: function(value) { // 验证器执行出错时不阻断其他逻辑
                    console.log(a.b);
                }
            },
            e: {
                validator: 1 // 无效的验证器
            }
        }, {
            a: 1,
            b: 'b',
            c: 100,
            d: 'd',
            e: true
        });

        expect(model.a).toBe(1);
        expect(model.b).toBe('b');
        expect(model.c).toBe(100);
        expect(model.d).toBe('d');
        expect(model.e).toBe(true);
    });

    test('transformer & restorer', function() {
        var source = {
            a: 1565001521464
        };

        var model = new ModelAdapter({
            a: {
                transformer: function(value, source) {
                    return new Date(value).toISOString();
                },
                restorer: function(value, source) {
                    return new Date(value).getTime();
                }
            }
        }, source);

        expect(model.a).toBe('2019-08-05T10:38:41.464Z');
        expect(model.$restore().a).toBe(source.a);
    });
});