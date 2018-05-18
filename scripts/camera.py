import picamera

import os
import time

from datetime import datetime
from sys import argv

camera = picamera.PiCamera()

dt = datetime.today()
directory = '/home/pi/Pictures/camera/' + dt.strftime("%y%m%d") + '/'

today = dt.strftime("%m-%d-%y@%I:%M:%S%p")

fil = directory + today + '.jpg'

camera.capture(fil)

os.system('cp ' + fil + ' ' + str(argv[1]))
