# ArrayList为什么不是线程安全的？

ArrayList在日常的开发中，不会出问题的原因是大多数应用场景都是单线程的，如果使用多线程来操作同一个`ArrayList`对象，就会引发线程安全问题。

至于原因来看看`ArrayList 的 java.util.ArrayList.add(E)`方法：

    public boolean add(E e) {
	    ensureCapacityInternal(size + 1);  // Increments modCount!!
	    elementData[size++] = e;
	    return true;
    }

很明显，它的`add`方法没有加上`synchronized`关键字，导致它并不是一个同步的代码块。



# 怎么解决ArrayList的线程安全问题呢？

假设在面试中，由`ArrayList是否是线程安全的`引出了如何解决的问题

最好不要言简意赅的回答：加锁，因为这是面试，对你的考查并不是想听你说这个，更想听到的答案是以下解决方案

    1、new Vector<>(); 
    
    2、Collections.synchronizedList(new ArrayList<>()); 
    
    3、new CopyOnWriteArrayList<>();

那么来看看具体的代码Demo，看看相关注释。


    import java.util.ArrayList;
    import java.util.Collections;
    import java.util.List;
    import java.util.UUID;
    import java.util.Vector;
    import java.util.concurrent.CopyOnWriteArrayList;
    
    /**
     * JDK 1.8
     * @author nobt
     *
     */
    public class ArrayListSafe {
    
    	public static void main(String[] args) {
    
    		/*
    		 * //在单机版/单线程环境中不会出错，但是在多线程环境中大概率报异常：java.util.ConcurrentModificationException 
    		 * //以下注释代码可以单独执行一次，会报以上异常
    		 * List<String> list = new ArrayList<>();
    		 * 
    		 * for (int i = 1; i < 30; i++) {
    		 * new Thread(() -> {
    		 * list.add(UUID.randomUUID().toString().substring(0, 8));
    		 * System.out.println(list); }).start(); 
    		 * }
    		 */
    
    		/*
    		 * 解决办法 
    		 * 这里值得注意的是，在面试当中，如果由以上代码引出的安全问题，面试官提问解决办法？
    		 * 最好不要言简意赅的回答：加锁，因为这是面试，对你的考查并不是想听你说这个，更想听到的答案是以下解决方案
    		 * 1、new Vector<>(); 
    		 * 2、Collections.synchronizedList(new ArrayList<>()); 
    		 * 3、new CopyOnWriteArrayList<>();
    		 */
    
    		// 1、new Vector<>();
    		List<String> vectorList = new Vector<>();
    		for (int i = 1; i < 30; i++) {
    			new Thread(() -> {
    				vectorList.add(UUID.randomUUID().toString().substring(0, 8));
    				System.out.println(vectorList);
    			}).start();
    		}
    
    		// 2、Collections.synchronizedList(new ArrayList<>());
    		//这种做法中可以看到Collections辅助类支持的其它集合肯定也是存在线程安全问题的，比如Collections.synchronizedMap(m)、Collections.synchronizedSet(s)...
    		List<String> synchronizedList = Collections.synchronizedList(new ArrayList<>());
    		for (int i = 1; i < 30; i++) {
    			new Thread(() -> {
    				synchronizedList.add(UUID.randomUUID().toString().substring(0, 8));
    				System.out.println(synchronizedList);
    			}).start();
    		}
    
    		// 3、new CopyOnWriteArrayList<>();
    		List<String> copyOnWriteArrayList = new CopyOnWriteArrayList<>();
    		for (int i = 1; i < 30; i++) {
    			new Thread(() -> {
    				copyOnWriteArrayList.add(UUID.randomUUID().toString().substring(0, 8));
    				System.out.println(copyOnWriteArrayList);
    			}).start();
    		}
    
    	}
    
    }
    