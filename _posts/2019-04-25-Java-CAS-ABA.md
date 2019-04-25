# Java中CAS是什么

CAS的全称是Compare And Swap 即比较交换，其算法核心思想如下：

`执行函数：CAS(V,E,N)`

> 其包含3个参数
>
> - V表示要更新的变量
> - E表示预期值
> - N表示新值

如果V值等于E值，则将V的值设为N。若V值和E值不同，则说明已经有其他线程做了更新，则当前线程什么都不做。通俗的理解就是CAS操作需要我们提供一个期望值，当期望值与当前线程的变量值相同时，说明还没线程修改该值，当前线程可以进行修改，也就是执行CAS操作，但如果期望值与当前线程不符，则说明该值已被其他线程修改，此时不执行更新操作，但可以选择重新读取该变量再尝试再次修改该变量，也可以放弃操作。

由上面的一个介绍了有了大致的一个了解，那么举例看看JUC包下面的`java.util.concurrent.atomic.AtomicInteger`是如何完成`CAS`操作的

该类中一个方法

    public final int getAndIncrement() {
    	return unsafe.getAndAddInt(this, valueOffset, 1);
    }

调用的是`sun.misc.Unsafe`类中的`getAndAddInt`方法，其中`this`是当前对象、`valueOffset`是内存地址、`1`代表加1操作中加的值

> `sun.misc.Unsafe`是`jdk/jre/lib`目录下的`rt.jar`中的类，也就可以理解成Java自带的吧
> 
> 至于`Unsafe`类的详情，可以自行了解，本文章此次不对它解读

那将这个jar包反编译可以看到具体的`getAndAddInt`方法实现如下：

    public final int getAndAddInt(Object paramObject, long paramLong, int paramInt) {
	    int i;
	    do {
	      i = getIntVolatile(paramObject, paramLong);
	    } while (!compareAndSwapInt(paramObject, paramLong, i, i + paramInt));
	    return i;
    }

> 以上代码流程分析：
> paramObject是上面的this当前对象，paramLong是上面的valueOffset内存地址
> 
> 1、getIntVolatile从主内存拿到值
> 
> 2、执行compareAndSwapInt方法，如果这个对象的值等于getIntVolatile取到的值，那么就把i的值加1后返回
> 
> 从第二步中就能看到有一个compare比较的动作

以上就是对Java中CAS的一个简单认识，它的出现是为了解决Java多线程操作中原子性的问题。

# Java中ABA的问题是什么

简单点说就是，上面的`getAndAddInt`执行流程分析中提到的，比较动作引出来的问题。

现在进行简单模拟：

1. 已知现有：线程1、线程2、变量X=100
2. 线程1将变量X的值读进自己工作内存、线程2也将变量X的值读进自己工作内存（此时线程1/2的工作内存中X的值都是100）
3. 假设线程1比线程2更快，线程1先将X=101，执行完毕并写回主内存
4. 线程1又执行X=100，执行完毕并写回主内存（执行到这里，对线程2来说，X的值并没有变过）
5. 线程2执行X=2019，那么它会先比较主内存此时是否是它期望的100，如果是就代表没有被修改过，它可以执行X=2019

至此ABA的问题就引出来了，对于线程2来说，它并不知道别的线程对变量X的操作，这就可能引发线程安全问题。

废话少说，它可以使用`版本号`的形式解决。

Java中也给出了实现方案：`java.util.concurrent.atomic.AtomicStampedReference<V>`

如下示例：
    
    import java.util.concurrent.TimeUnit;
    import java.util.concurrent.atomic.AtomicReference;
    import java.util.concurrent.atomic.AtomicStampedReference;
    
    /**
     * JDK 1.8
     * 测试由CAS引出的ABA问题，以及解决方案
     * @author nobt
     *
     */
    public class TestCasABA {
    
    	static AtomicReference<Integer> atomicReference = new AtomicReference<>(100);
    	//构造方法，第一个值100是value,第二个参数1是版本号/标记值
    	static AtomicStampedReference<Integer> atomicStampedReference = new AtomicStampedReference<Integer>(100, 1);
    	
    
    	public static void main(String[] args) {
    		
    		System.out.println("==========ABA问题============");
    
    		new Thread(() -> {
    
    			System.out.println("t1第一次修改状态：" + atomicReference.compareAndSet(100, 101) + "，t1修改后的值：" + atomicReference.get());
    			System.out.println("t1第二次修改状态：" + atomicReference.compareAndSet(101, 100) + "，t1修改后的值：" + atomicReference.get());
    
    		}, "t1").start();
    
    		new Thread(() -> {
    
    			System.out.println("t2修改状态：" + atomicReference.compareAndSet(100, 2019) + "，t2修改后的值：" + atomicReference.get());
    
    		}, "t2").start();
    		
    		try {
    			TimeUnit.SECONDS.sleep(1);
    		} catch (Exception e) {
    			e.printStackTrace();
    		}
    		
    		System.out.println("===========ABA的解决==========");
    		
    		/**
    		 * 这里模拟的两个线程去操作同一个变量，引出规避ABA的场景
    		 * 
    		 * 首先介绍一下这个方法：boolean java.util.concurrent.atomic.AtomicStampedReference.compareAndSet(Integer expectedReference, Integer newReference, int expectedStamp, int newStamp)
    		 * 
    		 * @param expectedReference the expected value of the reference 	期望值
	    	 * @param newReference the new value for the reference				修改的新值
	    	 * @param expectedStamp the expected value of the stamp				期望版本
	    	 * @param newStamp the new value for the stamp						修改的新版本
	    	 * @return {@code true} if successful
    		 * 
    		 * t3线程第一次atomicStampedReference.getStamp()的版本肯定是上面的初始化时指定的 1
    		 * t3compareAndSet第一次，将100修改成101并且期望的版本号是1，并将newStamp的值加1，第一次正确，执行过后atomicStampedReference.getStamp()=2
    		 * t3compareAndSet第二次，将101修改成100并且期望的版本号是2，并将newStamp的值加1，第一次正确，执行过后atomicStampedReference.getStamp()=3
    		 * 
    		 * t4的场景是，它与t3同时从主内存拿到数据值是100，数据版本是1，而此时t3在它执行之前完成了一次以上ABA场景后它想去将数据100，修改成2019，携带的版本是1时，发现主内存此时是100、版本是3，compareAndSet时不通过
    		 * 故修改失败
    		 */
    		new Thread(() -> {
    			System.out.println("t3修改前的标记值："+atomicStampedReference.getStamp());
    			System.out.println("t3第一次修改状态：" + atomicStampedReference.compareAndSet(100, 101, 1, atomicStampedReference.getStamp()+1) + "，t3修改后的值：" + atomicStampedReference.getReference());
    			System.out.println("t3第一次修改后的标记值："+atomicStampedReference.getStamp());
    			System.out.println("t3第二次修改状态：" + atomicStampedReference.compareAndSet(101, 100, 2, atomicStampedReference.getStamp()+1) + "，t3修改后的值：" + atomicStampedReference.getReference());
    			System.out.println("t3第二次修改后的标记值："+atomicStampedReference.getStamp());
    
    		}, "t3").start();
    		
    		new Thread(() -> {
    			System.out.println("t4修改前的标记值："+atomicStampedReference.getStamp());
    			System.out.println("t4修改状态：" + atomicStampedReference.compareAndSet(100, 2019, 1, atomicStampedReference.getStamp()+1) + "，t3修改后的值：" + atomicStampedReference.getReference());
    			System.out.println("t4的标记值："+atomicStampedReference.getStamp());
    
    		}, "t4").start();
    		
    	}
    
    }
    




