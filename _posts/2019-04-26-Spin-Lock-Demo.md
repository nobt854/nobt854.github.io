# 什么是自旋锁？
**解释**：自旋锁是采用让当前线程不停地的在循环体内执行实现的，当循环的条件被其他线程改变时才能进入临界区。
> 简单描述：用循环的方式去获取一个锁的资格

之前的博客也提到如下：

> sun.misc.Unsafe是jdk/jre/lib目录下的rt.jar中的类，也就可以理解成Java自带的吧
> 
> 那将这个jar包反编译可以看到具体的getAndAddInt方法实现如下：


    public final int getAndAddInt(Object paramObject, long paramLong, int paramInt) {
	    int i;
	    do {
	      i = getIntVolatile(paramObject, paramLong);
	    } while (!compareAndSwapInt(paramObject, paramLong, i, i + paramInt));
	    return i;
    }

这个do-while的形式就有自旋的实现，如果compareAndSwapInt失败就再次循环getIntVolatile后再次compareAndSwapInt...

# Demo实现
上代码：

    import java.util.concurrent.TimeUnit;
    import java.util.concurrent.atomic.AtomicReference;
    
    /**
     * JDK 1.8 手写自旋锁Demo
     * 
     * 简单描述：用循环的方式去获取一个锁的资格
     * 
     * 注：该例子为非公平锁，获得锁的先后顺序，不会按照进入myLock的先后顺序进行。
     * 
     * 这句话的意思是说，下面的t1/t2/t3/t4会第一时间有序调用myLock，但是并不保证按顺序获取到锁
     * 
     * 下面执行的情况为例：
     * 
     *  t1,调用myLock()
    	t2,调用myLock()
    	t3,调用myLock()
    	t4,调用myLock()
    	t2，正在等待其他线程释放锁
    	t3，正在等待其他线程释放锁
    	t4，正在等待其他线程释放锁
    	t4，正在等待其他线程释放锁
    	t3，正在等待其他线程释放锁
    	t2，正在等待其他线程释放锁
    	t2，正在等待其他线程释放锁
    	t4，正在等待其他线程释放锁
    	t3，正在等待其他线程释放锁
    	t2，正在等待其他线程释放锁
    	t4，正在等待其他线程释放锁
    	t3，正在等待其他线程释放锁
    	t2，正在等待其他线程释放锁
    	t1,调用myUnLock()，释放锁
    	t4，正在等待其他线程释放锁
    	t3，正在等待其他线程释放锁
    	t3，正在等待其他线程释放锁
    	t4，正在等待其他线程释放锁
    	t2,调用myUnLock()，释放锁
    	t3，正在等待其他线程释放锁
    	t4,调用myUnLock()，释放锁
    	t3,调用myUnLock()，释放锁
    
     * 
     * @author nobt
     *
     */
    public class SpinLockDemo {
    
    	// 借助原子引用类
    	AtomicReference<Thread> atomicReference = new AtomicReference<>();
    
    	//加锁
    	public void myLock() {
    		Thread thread = Thread.currentThread();
    		System.out.println(thread.getName()+",调用myLock()");
    		/**
    		 * atomicReference.compareAndSet(null, thread) 
    		 * 它的意思是如果atomicReference对象中的值是null，那么就把atomicReference的值改为当前调用的线程引用（对象）
    		 * 如果更新/修改成功，那么返回true，否则返回false
    		 * 
    		 * 所以如果修改失败、返回false，将会一直while循环（此时就是等待其他线程释放锁的场景）
    		 */
    		while(!atomicReference.compareAndSet(null, thread)){
    			try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    			System.out.println(thread.getName()+"，正在等待其他线程释放锁");
    		}
    	}
    
    	//解锁
    	public void myUnLock() {
    		Thread thread = Thread.currentThread();
    		atomicReference.compareAndSet(thread, null);
    		System.out.println(thread.getName()+",调用myUnLock()，释放锁");
    		
    	}
    
    	public static void main(String[] args) {
    		SpinLockDemo spinLockDemo = new SpinLockDemo();
    		
    		//线程1
    		new Thread(() -> {
    			spinLockDemo.myLock();
    			//线程t1调用myLock后就持有锁了，sleep(5)相当于持有锁5秒，在持有状态下，其它线程会一直在myLock方法的while循环中
    			try { TimeUnit.SECONDS.sleep(5); } catch (InterruptedException e) { e.printStackTrace(); }
    			
    			spinLockDemo.myUnLock();
    		},"t1").start();
    		
    		//线程2
    		new Thread(() -> {
    			spinLockDemo.myLock();
    			
    			try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    			
    			spinLockDemo.myUnLock();
    		},"t2").start();
    		
    		//线程3
    		new Thread(() -> {
    			spinLockDemo.myLock();
    			
    			try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    			
    			spinLockDemo.myUnLock();
    		},"t3").start();
    		
    		//线程4
    		new Thread(() -> {
    			spinLockDemo.myLock();
    			
    			try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    			
    			spinLockDemo.myUnLock();
    		},"t4").start();
    	}
    }
