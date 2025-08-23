//made by gurshaan
public class exp1 {
    public class Node{
        int data;
        Node next;

        Node(int data){
            this.data=data;
            this.next=null;
        }
    }
    class Stack{
        public Node Top;

        Stack(){
            this.Top=null;
        }

        public boolean isEmpty(){
            if(Top==null){
                return true;
            }
            return false;
        }

        public void push(int data){
            Node newNode = new Node(data);
            if (isEmpty()) {
                Top = newNode;
            } else {
                newNode.next = Top;
                Top = newNode;
            }
        }

        public void pop(){
            if (isEmpty()) {
                System.out.println("Stack is empty");
            } else {
                Top = Top.next;
            }
        }

        public void printstack(){
            if(isEmpty()){
                System.out.println("Stack is empty");
            }else{
                Node current=Top;
                while(current!=null){
                    System.out.print(current.data + " ");
                    current=current.next;
                }
            }
        }
    }
    public static void main(String[] args) {
        exp1 stack = new exp1();
        exp1.Stack s = stack.new Stack();
        s.push(50);
        s.push(30);
        s.push(10);
        s.pop();
        System.out.println(s.isEmpty());
        s.printstack();


    }
}
