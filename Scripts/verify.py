import os
import re
'''
for raspberry pi, this will be using python 2,
which is instaled by default, therefore, we will
not change 'python' to say python2
'''
from subprocess import check_output
def get_pid(name):
    return check_output(["pidof",name])

cwd = os.getcwd()
print cwd
if os.path.isfile(cwd + '/file.txt') :
    f = open(cwd + '/file.txt', 'r')

    isAlive = f.read()

    pids = [pid for pid in os.listdir('/proc') if pid.isdigit()]

    #check all pids for our file pid
    for pid in pids:
        if int(pid) == int(isAlive):
            #make sure we don't have a zombie process
            string = get_pid("python")
            arr = re.split(' ', string)
            if len(arr) < 3 :
                os.system('kill ' + isAlive)
            else : #if there is the main process AND subprocess, then we do nothing
                exit()
            
    #if there is no pid matching file pid, remove file
    f.close()
    os.remove(cwd + '/file.txt')
