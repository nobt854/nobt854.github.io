# Java中的读写锁
字面意思`ReentrantReadWriteLock`是在`ReentrantLock`的升级版

看代码示例：

    
    import java.util.HashMap;
    import java.util.Map;
    import java.util.concurrent.TimeUnit;
    import java.util.concurrent.locks.ReadWriteLock;
    import java.util.concurrent.locks.ReentrantReadWriteLock;
    
    /**
     * JDK 1.8
     * 保证写的时候只有一个线程在写（写线程的原子性），读的时候多个线程可以读
     * @author nobt
     * 
     * 运行结果：
        1，正在写入：1
    	1，写入完成：1
    	2，正在写入：2
    	2，写入完成：2
    	4，正在写入：4
    	4，写入完成：4
    	3，正在写入：3
    	3，写入完成：3
    	5，正在写入：5
    	5，写入完成：5
    	1，正在读取：1
    	2，正在读取：2
    	3，正在读取：3
    	4，正在读取：4
    	5，正在读取：5
    	3，读取完成：3
    	1，读取完成：1
    	5，读取完成：5
    	2，读取完成：2
    	4，读取完成：4
    
     * 在写入动作的时候原子性得到保证，读取的时候就不需要保证
     *
     */
    class Cache{
    	
    	private volatile Map<String,String> map = new HashMap<>();
    	
    	private ReadWriteLock rwLock = new ReentrantReadWriteLock();
    	
    	/**
    	 * 写操作
    	 * @param key
    	 * @param value
    	 */
    	public void put(String key,String value){
    		rwLock.writeLock().lock();
    		try{
    			Thread thread = Thread.currentThread();
    			System.out.println(thread.getName()+"，正在写入："+key);
    			try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    			map.put(key, value);
    			System.out.println(thread.getName()+"，写入完成："+value);
    		}finally{
    			rwLock.writeLock().unlock();
    		}
    	}
    	
    	/**
    	 * 读操作
    	 * @param key
    	 */
    	public void get(String key){
    		rwLock.readLock().lock();
    		try{
    			Thread thread = Thread.currentThread();
    			System.out.println(thread.getName()+"，正在读取："+key);
    			try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
    			String resultValue = map.get(key);
    			System.out.println(thread.getName()+"，读取完成："+resultValue);
    		}finally{
    			rwLock.readLock().unlock();
    		}
    	}
    	
    }
    
    public class TestReadWriteLock {
    	
    	public static void main(String[] args) {
    		Cache cache = new Cache();
    
    		for(int i = 1 ; i<=5 ; i++){
    			final int tempVal = i;
    			new Thread(() -> {
    				cache.put(tempVal+"", tempVal+"");
    			},i+"").start();
    		}
    		
    		
    		for(int i = 1 ; i<=5 ; i++){
    			final int tempVal = i;
    			new Thread(() -> {
    				cache.get(tempVal+"");
    			},i+"").start();
    		}
    	}
    
    }
