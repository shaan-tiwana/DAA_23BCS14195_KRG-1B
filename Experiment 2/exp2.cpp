class Solution {
public:
    double myPow(double x, int n) {
        double result=1;
        if(x==1||n==0) return 1;
        long long it = n;
        
        if(n>0){
            while(it>0){
                if(it % 2 == 0){
                    x*=x;
                    it/=2;
                }
                result *= x;
                it --;
                
            } 
        }else{
            x=1/x;
            it = -it;
            while(it>0){
                if(it % 2 == 0){
                    x*=x;
                    it/=2;
                }
                result *= x;
                it --;
                
            } 
        }

        return result;  
    }
};
