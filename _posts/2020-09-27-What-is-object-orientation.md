# 什么是面向对象

## 官方解释

先看看怎么描述面向对象的

> 运用数据抽象的思想编写代码（定义和使用数据类型，将数据类型的值封装在对象中）的方式称为面向对象编程。

## nobt举例

### 例子1

你现在把自己当做一个箱子，箱子里面装了三个盒子：

第一个盒子贴着标签：性别

第二个盒子贴着标签：年龄

第三个盒子贴着标签：出生地



你现在是不是对号入座，比如：`性别：男、年龄：25、出生地：杭州`

每一个人都可以这样`对号入座`，也就是你找到了`人`这个类型事物的共同点

### 例子2

把电脑当做一个箱子，箱子里面装了几个盒子：

第一个盒子贴着标签：厂商品牌

第二个盒子贴着标签：屏幕尺寸

第三个盒子贴着标签：CPU品牌

第四个盒子贴着标签：显卡品牌

... 可以一直贴下去



再次开始对号入座，比如：`厂商品牌：联想、屏幕尺寸：15.6、CPU品牌：英特尔、显卡品牌：英伟达...`

每一台电脑都可以这样`对号入座`，也就是你找到了`电脑`这个类型事物的共同点

## 例子总结

经过上面两个例子，再结合`官方解释`来理解什么叫面向对象？

> 运用数据抽象的思想编写代码（定义和使用数据类型，将数据类型的值封装在对象中）的方式称为面向对象编程。

- 定义和使用数据类型：例子1中定义了`人`、例子2中定义了`电脑`两个箱子（类型），并尝试往箱子里面对号入座（填充数据）
- 数据类型的值封装在对象：重点查看以上示例中的`对号入座`，旨在定义的某种箱子（类型）可以经过往箱子里面的盒子放入不同的东西达到区分它是不同的箱子
- 所谓的面向对象，其实就是抽离，万物均可抽离，万物均可面向对象