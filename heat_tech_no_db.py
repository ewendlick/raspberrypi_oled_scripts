#!/usr/bin/env python
# -*- coding: utf-8 -*-
# PYTHON_ARGCOMPLETE_OK

import os
import time
from datetime import datetime, timedelta
from luma_files.demo_opts import get_device
from luma.core.virtual import terminal
from luma.core.render import canvas
from PIL import ImageFont
import Adafruit_DHT

DHT_MODEL = Adafruit_DHT.DHT22
DHT_DATA_PIN = 4
# TODO: print out number values on left to show range
ESTIMATED_TEMP_MIN = 17 # C
ESTIMATED_TEMP_MAX = 30 # C
FONT_SIZE_PX = 16

def make_font(name, size):
    font_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 'fonts', name))
    return ImageFont.truetype(font_path, size)

def temperature_humidity_string(temperature, humidity):
    return 'TEMP:{0:0.1f}C {1:0.1f}%'.format(temperature, humidity)

def main():
    font = make_font("ProggyTiny.ttf", FONT_SIZE_PX)
    while True:
        humidity, temperature = Adafruit_DHT.read_retry(DHT_MODEL, DHT_DATA_PIN)

        with canvas(device) as draw:
            draw.text((0,0), temperature_humidity_string(temperature, humidity), font=font, fill="white")
            draw.text((0,16), 'test', font=font, fill="white")
        time.sleep(5)
        device.clear()

if __name__ == "__main__":
    try:
        device = get_device()
        main()
    except KeyboardInterrupt:
        pass
