import ModelAdapter from '../src/model-adapter.js';

describe('构造函数', function() {
    test('初始化不提供数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        });

        expect(model.a).toBeUndefined();
        expect(model.b).toBeUndefined();
    });

    test('初始化提供数据', function() {
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
    test('初始化不提供数据', function() {
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

    test('初始化提供数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
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
});

describe('$restore', function() {
    test('初始化不提供数据', function() {
        var model = new ModelAdapter({
            a: 'a',
            b: 'b'
        });

        var source = model.$restore();

        expect(source.a).toBeUndefined();
        expect(source.b).toBeUndefined();
    });

    test('初始化提供数据', function() {
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
            f: 'f.ff.fff'
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
            e: 'e'
        });

        expect(model.a).toBe('a');
        expect(model.b).toBe('bbb');
        expect(model.ccc).toBe('ccc1');
        expect(model.ddd).toBe('ddd');
        expect(model.e).toBe('e');
        expect(model.f).toBeUndefined();
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
            }
        }, {
            a: 1,
            b: 'b',
            c: 100
        });

        expect(model.a).toBe(1);
        expect(model.b).toBe('b');
        expect(model.c).toBe(100);
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