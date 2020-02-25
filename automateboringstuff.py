# -*- coding: utf-8 -*-
"""
Created on Sun May 19 17:02:17 2019

@author: Joshua Paul Jacob
"""

import os
import re
  
# Function to rename multiple files 
def main(): 
    l = []
    for filename in os.listdir("samples"):
        name = filename
        name = name.split('.')[0].replace(' ','')
        name = re.sub(r'[^a-zA-Z0-9 ]', "", name) + '.wav'
        src = 'samples/'+ filename 
        dst = 'samples/'+ name 
        l.append(name)
        
        os.rename(src, dst) 
    print(l)

# Driver Code 
if __name__ == '__main__': 
      
    # Calling main() function 
    main() 