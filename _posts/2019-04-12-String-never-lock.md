# 不要把String字符串作为锁对象

### 创建类ThreadService 

    public class ThreadService {
    
    	public static void print(String stringLock){
    		synchronized (stringLock) {
    			while(true){
    				System.out.println("当前线程："+Thread.currentThread().getName());
    				try{
    					Thread.sleep(3000);
    				}catch(Exception e){
    					e.printStackTrace();
    				}
    			}
    		}
    	}
    }


### 创建类ThreadA

    public class ThreadA extends Thread{
    	
    	private ThreadService ts;
    
    	public ThreadA(ThreadService ts) {
    		super();
    		this.ts = ts;
    	}
    	
    	public void run(){
    		ts.print("stringLock");
    	}
    	
    
    }

### 创建类ThreadB

    public class ThreadB extends Thread{
    	
    	private ThreadService ts;
    
    	public ThreadB(ThreadService ts) {
    		super();
    		this.ts = ts;
    	}
    	
    	public void run(){
    		ts.print("stringLock");
    	}
    
    }

### 创建测试类TestStringLockCauseBug
> 臆想式见名知意：String字符串锁造成Bug

    //String类型的字符串作为锁对象造成死锁
    //常量池的原因：String a = "1";String b = "1";a==b==true;
    public class TestStringLockCauseBug {
    	
    	
    	public static void main(String[] args) {
    		
    		//这个例子会由于锁都是字符串stringLock，导致线程B一直拿不到资源，因为AA是同一个锁，所以String类型一般不作为锁对象（把锁换成其他类型就可以了）
    		ThreadService ts =  new ThreadService();
    		ThreadA a = new ThreadA(ts);
    		a.setName("A");
    		a.start();
    		
    		ThreadB b = new ThreadB(ts);
    		b.setName("B");
    		b.start();
    	}
    
    }


**这篇博客的旨在看测试类注释**。