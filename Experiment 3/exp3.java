class Solution {
    public ArrayList<ArrayList<Integer>> countFreq(int[] arr) {
        // code here
        TreeMap<Integer,Integer> hm=new TreeMap<>();
        
        for(int i:arr){
          
            hm.put(i,hm.getOrDefault(i,0)+1);
        }
        ArrayList<ArrayList<Integer>> ans=new ArrayList<>();
      
        for(int i:hm.keySet()){
          
            ArrayList<Integer> temp=new ArrayList<>();
          
            temp.add(i);
            temp.add(hm.get(i));
            ans.add(temp);
        }
      
        return ans;
    }
}
