import ModelAdapter from '../src/model-adapter.js';

describe('constructor', function() {
    test('不传参数', function() {
        var model = new ModelAdapter();
        expect(Object.keys(model).length).toBe(0);
        expect(typeof model.$getSource).toBe('function');
        expect(typeof model.$setSource).toBe('function');
        expect(typeof model.$setAdapter).toBe('function');
        expect(typeof model.$restore).toBe('function');
    });

    test('没有 source', function() {
        var model = new ModelAdapter();
        expect(JSON.stringify(model)).toBe('{}');
    });

    test('有 source', function() {
        var model = new ModelAdapter({
            a: null,
            b: 'source'
        });
        expect(JSON.stringify(model)).toBe('{"a":null,"b":"source"}')
    });

    test('有 source 和 defaults', function() {
        var model = new ModelAdapter({
            a: null,
            b: 'source-b',
            c: {
                cc: {
                    ccc: 'source-ccc'
                }
            },
            d: '',
            e: null
        }, {
            a: 'default-a',
            b: 'default-b',
            c: {
                cc: {
                    ccc: 'default-ccc',
                    ccc1: 'default-ccc1'
                }
            },
            d: 'default-d'
        });

        expect(JSON.stringify(model)).toBe('{"a":"default-a","b":"source-b","c":{"cc":{"ccc":"source-ccc","ccc1":"default-ccc1"}},"d":"","e":null}')
    });

    test('有 source 和 propertyAdapter', function() {
        var model = new ModelAdapter({
            a: null,
            b: 'source-b',
            c: {
                cc: {
                    ccc: 1565001521464
                }
            }
        }, null, {
            'c.cc.ccc': {
                transformer: function(value, model) {
                    return new Date(value).toISOString();
                }
            }
        });

        expect(JSON.stringify(model)).toBe('{"a":null,"b":"source-b","c":{"cc":{"ccc":"2019-08-05T10:38:41.464Z"}}}')
    });

    test('有 source, defaults, propertyAdapter', function() {
        var model = new ModelAdapter({
            a: null,
            b: 'source-b',
            c: {
                cc: {
                    ccc: 1565001521464
                }
            },
            d: 'source-d',
            e: null
        }, {
            a: 'default-a',
            b: 'default-b',
            c: {
                cc: {
                    ccc: 1565001521400,
                    ccc1: 'default-ccc1'
                }
            }
        }, {
            'c.cc.ccc': {
                transformer: function(value, model) {
                    return new Date(value).toISOString();
                }
            }
        });

        expect(JSON.stringify(model)).toBe('{"a":"default-a","b":"source-b","c":{"cc":{"ccc":"2019-08-05T10:38:41.464Z","ccc1":"default-ccc1"}},"d":"source-d","e":null}')
    });

    test('整个数组', function() {
        var source = {
            users: [{
                name: 'Sun',
                age: 18,
                extData: {
                    country: {
                        name: 'China'
                    }
                }
            }, {
                age: 19,
                extData: null
            }, {
                name: '',
                age: 19,
                extData: {
                    country: null
                }
            }]
        };

        var model = new ModelAdapter(source, null, {
            'users': {
                transformer: function(value, model) {
                    return value.map(function(item) {
                        return new ModelAdapter(item, {
                            name: 'Guest',
                            extData: {
                                country: {
                                    name: 'China'
                                }
                            }
                        });
                    });
                }
            }
        });

        expect(JSON.stringify(model)).toBe('{"users":[{"name":"Sun","age":18,"extData":{"country":{"name":"China"}}},{"age":19,"extData":{"country":{"name":"China"}},"name":"Guest"},{"name":"","age":19,"extData":{"country":{"name":"China"}}}]}');
        expect(JSON.stringify(model.$restore())).toBe('{"users":[{"name":"Sun","age":18,"extData":{"country":{"name":"China"}}},{"age":19,"extData":null},{"name":"","age":19,"extData":{"country":null}}]}');
    });

    test('数组中的属性', function() {
        var source = {
            a: {
                aa: {
                    aaa: [{
                        a1: 1565001521464,
                        a2: 1565001521400,
                    }]
                }
            }
        };

        var model = new ModelAdapter(source, null, {
            'a.aa.aaa': {
                transformer: function(value, model) {
                    return value.map(function(item) {
                        // TODO 对于引用类型(复杂类型)的值(例如 object/array)保存到寄存器的是引用,
                        // 如果直接在 transformer 中修改了原来的值,
                        // 那么 $restore 就还原不回去了,
                        // 因此要么在保存到寄存器时 deep clone, 要么在 transformer 中 deep clone

                        // item.a1 = new Date(item.a1).toISOString();
                        // item.a2 = new Date(item.a2).toISOString();
                        // return item;
                        return {
                            ...item,
                            a1: new Date(item.a1).toISOString(),
                            a2: new Date(item.a2).toISOString()
                        };
                    });
                }
            }
        });

        expect(JSON.stringify(model)).toBe('{"a":{"aa":{"aaa":[{"a1":"2019-08-05T10:38:41.464Z","a2":"2019-08-05T10:38:41.400Z"}]}}}');
        expect(JSON.stringify(model.$restore())).toBe('{"a":{"aa":{"aaa":[{"a1":1565001521464,"a2":1565001521400}]}}}');
    });
});

describe('$getSource', function() {
    test('获取完整的 source', function() {
        var source = {
            a: null,
            b: 'source-b',
            c: {
                cc: {
                    ccc: 'source-ccc'
                }
            }
        };

        var model = new ModelAdapter(source);
        expect(JSON.stringify(model.$getSource())).toBe('{"a":null,"b":"source-b","c":{"cc":{"ccc":"source-ccc"}}}');
    });

    test('通过 path 安全地获取 source 上的属性值', function() {
        var source = {
            a: null,
            b: 'source-b',
            c: {
                cc: {
                    ccc: 'source-ccc'
                }
            },
            d: null
        };

        var model = new ModelAdapter(source);
        expect(model.$getSource().a).toBe(null);
        expect(model.$getSource().b).toBe('source-b');
        expect(model.$getSource().c.cc.ccc).toBe('source-ccc');
        expect(model.$getSource().d).toBe(null);
        expect(function() {
            model.$getSource().d.dd.ddd;
        }).toThrow();
        expect(model.$getSource('d.dd.ddd')).toBe(undefined);
    });
});

describe('$setSource', function() {
    test('创建时没有 source', function() {
        var model = new ModelAdapter();
        model.$setSource({
            a: null,
            b: 'source-b'
        });
        expect(JSON.stringify(model)).toBe('{"a":null,"b":"source-b"}');
    });

    test('创建时有 source', function() {
        var model = new ModelAdapter({
            a: null,
            b: 'source-b',
            c: 'source-c'
        });
        model.$setSource({
            a: 'source-new-a',
            b: 'source-new-b'
        });
        expect(JSON.stringify(model)).toBe('{"a":"source-new-a","b":"source-new-b"}');
    });
});

describe('$setAdapter', function() {
    test('设置 Adapter', function() {
        var model = new ModelAdapter({
            a: null,
            b: 1565001521464
        });
        model.$setAdapter('b', {
            transformer: function(value, model) {
                return new Date(value).toISOString();
            }
        });

        expect(JSON.stringify(model)).toBe('{"a":null,"b":"2019-08-05T10:38:41.464Z"}');
    });

    test('设置 Adapter 后重新设置 source', function() {
        var model = new ModelAdapter({
            a: null,
            b: 1565001521464
        });
        model.$setAdapter('b', {
            transformer: function(value, model) {
                return new Date(value).toISOString();
            }
        });
        model.$setSource({
            a: 'source-new-a',
            b: 1566627642640
        });

        expect(JSON.stringify(model)).toBe('{"a":"source-new-a","b":"2019-08-24T06:20:42.640Z"}');
    });

    test('移除 Adapter', function() {
        var model = new ModelAdapter({
            a: null,
            b: 1565001521464
        });
        model.$setAdapter('b', null);

        expect(JSON.stringify(model)).toBe('{"a":null,"b":1565001521464}');
    });

    test('更新值', function() {
        var model = new ModelAdapter({
            a: null,
            b: 1565001521464
        });
        model.$setAdapter('b', {
            transformer: function(value, model) {
                return new Date(value).toISOString();
            }
        });
        
        model.b = 1566627642640;
        expect(model.b).toBe('2019-08-24T06:20:42.640Z');
        expect(JSON.stringify(model)).toBe('{"a":null,"b":"2019-08-24T06:20:42.640Z"}');
    });
});

describe('$restore', function() {
    test('获取完整的 restore 值', function() {
        var model = new ModelAdapter({
            a: null,
            b: 1565001521464
        }, null, {
            'b': {
                transformer: function(value, model) {
                    return new Date(value).toISOString();
                }
            }
        });

        expect(JSON.stringify(model.$restore())).toBe('{"a":null,"b":1565001521464}');
        expect(JSON.stringify(model)).toBe('{"a":null,"b":"2019-08-05T10:38:41.464Z"}');
    });

    test('通过 path 安全地获取 restore 上的属性值', function() {
        var model = new ModelAdapter({
            a: null,
            b: 1565001521464,
            c: null
        }, null, {
            'b': {
                transformer: function(value, model) {
                    return new Date(value).toISOString();
                }
            }
        });

        expect(model.$restore().a).toBe(null);
        expect(model.$restore().b).toBe(1565001521464);
        expect(model.$restore().c).toBe(null);
        expect(function() {
            model.$restore().c.cc.ccc
        }).toThrow();
        expect(model.$restore('c.cc.ccc')).toBe(undefined);
        expect(JSON.stringify(model)).toBe('{"a":null,"b":"2019-08-05T10:38:41.464Z","c":null}');
    });
});