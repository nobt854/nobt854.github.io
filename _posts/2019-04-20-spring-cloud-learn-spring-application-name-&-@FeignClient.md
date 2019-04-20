# @FeignClient(name= "spring-cloud-producer")中的name是什么？

博客：[https://www.cnblogs.com/ityouknow/p/6859802.html](https://www.cnblogs.com/ityouknow/p/6859802.html)

中提到，这个name:远程服务名，及spring.application.name配置的名称

疑问1：如果不指定name，直接写成`@FeignClient("spring-cloud-producer")`也可以吗，不指定默认是name吗

疑问2：如果不使用name，使用value也可以吗，value是否是`eureka.instance.appname=microservice-student-servicename`

**自我解答**：value和name都是`spring.application.name`


并且值得注意的是`@FeignClient`中如下定义：

    @AliasFor("name")
    String value() default "";
    
    @AliasFor("value")
    String name() default "";

注解`org.springframework.core.annotation.AliasFor`

Sprint的这个注解，具有对等性，也就是两个注解值互相使用
在使用此注解时不能同时指定两个`name`和`value`不同的值，否则报错

换句话说，name和value任意指定其中之一的值就行了，作用一样


# ZUUL的默认路径中serviceId是什么？
`ZUUL`支持的路径：`http://ZUUL_HOST:ZUUL_PORT/微服务在Eureka上的serviceId/**`

这个微服务在Eureka上的serviceId是什么，也是`spring.application.name`？

**自我解答**：是的


# 注意：

注册到Eureka中的application名称默认也是`spring.application.name`
如果通过`eureka.instance.appname`修改，在`Eureka`界面看到的名称就是修改后的名称（同时指定的话覆盖`spring.application.name`）



