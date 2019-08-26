# CHANGELOG

* v0.0.2 2019-8-26

  ## 如何选择一个合适的 `deep copy default` 库
  * 需求
    
    当源数据中的属性值(需要递归嵌套对象)为 `null` 或者 `undefined` 时, 使用默认值来对齐
  
    ```
    结果                         源数据                   默认值
    {                            {                       {
        a: 'default-a',       <─     a: null,         <─     a: 'default-a',
        b: {                         b: {                    b: {
            bb: 'source',     <─         bb: 'source'            bb: 'default-bb',
           bb1: 'default-bb1' <─                      <─        bb1: 'default-bb1'
        }                            }                       }
    }                            }                       }
    ```

    ```javascript
    var a = deepCopyDefault({
        a: null,
        b: {
            bb: 'source'
        }
    }, {
        a: 'default-a',
        b: {
            bb: 'default-bb',
            bb1: 'default-bb1'
        }
    });
    // {a: 'default-a', b: {bb: 'source', bb1: 'default-bb1'}}
    ```
  * 首选
    * https://github.com/sttk/fav-prop.defaults-deep
  * 备选
    * [defaults-deep](https://github.com/jonschlinkert/defaults-deep) 依赖较多
  * 不合适
    * [lodash.defaultsdeep](https://github.com/lodash/lodash/) `object` 中的属性值为 `null` 时没有从 `source` 中补齐
    * [defaulty](https://github.com/fabioricali/defaulty) `target` 中的属性值为 `null` 时报错
    * [default-assign](https://github.com/nanowizard/default-assign) `target` 中的属性值为 `null` 时没有从 `source` 中补齐, 只有当 `target` 中的属性值为 `undefined` 时才有效
    * [object.defaults](https://github.com/jonschlinkert/object.defaults) 不支持 `deep`
    * [defaults](https://github.com/jonschlinkert/object.defaults) 不支持 `deep`

* v0.0.1 2019-8-8

  * 初始版本
  
  ## 如何选择一个合适的 `object path get` 库
  * 需要有哪些必备功能
    * object/array path get
    * object path set
    * 尽可能少的依赖和新特性
  * 首选
    * https://github.com/sindresorhus/dot-prop 轻量无依赖
  * 备选
    * https://github.com/mariocasciaro/object-path 功能和 `dot-prop` 类似, 但多年未更新
    * [get-value](https://github.com/jonschlinkert/get-value) [set-value](https://github.com/jonschlinkert/set-value) 代码量稍多
    * [lodash.get](https://github.com/lodash/lodash/) [lodash.set](https://github.com/lodash/lodash/) 代码量较多
  * 不合适
    * https://github.com/azer/get-object-path 没有 set 机制
    * https://github.com/queicherius/fast-get 没有 set 机制
    * [object-at](https://github.com/gearcase/object-at) [object-set](https://github.com/gearcase/object-set) 依赖较多, 多年未更新