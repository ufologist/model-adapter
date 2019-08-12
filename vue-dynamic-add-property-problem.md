# 如何让 `Vue` 为 `data` 上新增的属性创建 `getter/setter`

例如一开始 `data` 为

```javascript
{
    foo: {
        a: 'a'
    }
}
```

如果我后续操作 `foo.b = 'b'` 新增了 `b` 属性, 那么 `b` 属性肯定是非响应式的. 如果在视图上绑定 `b` 属性, 会发现修改 `b` 属性无法更新视图.

那么如何才能让 `foo.b` 获得 `getter/setter` 以享受到 Vue 的 [reactive 机制](https://cn.vuejs.org/v2/guide/reactivity.html)呢?

> 有时你可能需要为已有对象赋值多个新属性，比如使用 `Object.assign()` 或 `_.extend()`。但是，这样添加到对象上的新属性不会触发更新。在这种情况下，你应该用原对象与要混合进去的对象的属性一起创建一个新的对象。
> 
> ```javascript
> // 代替 `Object.assign(this.someObject, { a: 1, b: 2 })`
> this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })
> ```

PS: 这个 `b` 属性只是示例, 可能有 N 多未知的属性需要添加, 所以使用 `$set` 方法的场景不适用. 还要注意一点: 使用 `$set` 操作已经存在的属性时, 只会修改属性的值, 不会创建 `getter/setter`, [文档中有说明](https://vuejs.org/v2/api/#Vue-set), 但平时没仔细研究可能就掉坑里了.

> Adds a property to a reactive object, ensuring the new property is also reactive, so triggers view updates. 
>
> **This must be used to add new properties to reactive objects**, as Vue cannot detect normal property additions (e.g. this.myObject.newProperty = 'hi').

## 解决办法: 复制出一个新的对象再赋值回去

注意如果只是 `var foo = this.foo` 来复制引用是不行的

需要先新建对象复制原有的属性, 再添加属性, 最后再赋值回 `data` 上
1. 复制

   ```javascript
   var foo = Object.assign({}, this.foo);
   ```
2. 添加属性

   ```javascript
   foo.b = 'b';
   ```
3. 赋值回去

   ```javascript
   this.foo = foo;
   ```

可以将复制和添加属性合并为一步, 即
```javascript
var foo = Object.assign({}, this.foo, {
    b: 'b'
});
this.foo = foo;
```

最终可以精简为一步
```javascript
this.foo = Object.assign({}, this.foo, {
    b: 'b'
});
```

更适合日常使用的方式为先操作 `data`, 最后再复制并赋值回去

```javascript
this.foo.b = 'b';
this.foo = Object.assign({}, this.foo);
// 可以使用 Object Spread 语法更加简洁
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax#%E6%9E%84%E9%80%A0%E5%AD%97%E9%9D%A2%E9%87%8F%E5%AF%B9%E8%B1%A1%E6%97%B6%E4%BD%BF%E7%94%A8%E5%B1%95%E5%BC%80%E8%AF%AD%E6%B3%95
// this.foo = {...this.foo};
```

## 答案

* [重新问题的 demo](https://raw.githack.com/ufologist/model-adapter/master/test/vue-dynamic-add-property-problem.html)
* [解决问题的 demo](https://raw.githack.com/ufologist/model-adapter/master/test/vue-dynamic-add-property-solution.html)