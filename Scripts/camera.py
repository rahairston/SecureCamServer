import picamera

import os
import time

from datetime import datetime
from sys import argv
#argv1 is date-time folder
#argv2 is session folder (we copy it into)

camera = picamera.PiCamera()

dt = datetime.today()
directory = str(argv[1])

#image name
today = dt.strftime("%m-%d-%y@%I:%M:%S%p")

fil = directory + today + '.jpg'

camera.capture(fil)

#moving new image into the "session" folder
os.system('cp ' + fil + ' ' + str(argv[2]))
