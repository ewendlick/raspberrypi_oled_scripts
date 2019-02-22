# https://unix.stackexchange.com/questions/57852/crontab-job-start-1-min-after-reboot

# HEY, look in /etc/systemd/system/show_ip_addresses_on_oled.service

#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2014-18 Richard Hull and contributors
# See LICENSE.rst for details.
# PYTHON_ARGCOMPLETE_OK

"""
Simple println capabilities.
"""

import os
import time
from luma_files.demo_opts import get_device
from luma.core.virtual import terminal
from PIL import ImageFont
#https://stackoverflow.com/questions/270745/how-do-i-determine-all-of-my-ip-addresses-when-i-have-multiple-nics
from netifaces import interfaces, ifaddresses, AF_INET
import Adafruit_DHT

def ip4_addresses():
    ip_list = []
    for interface in interfaces():
        for link in ifaddresses(interface)[AF_INET]:
            ip_list.append(link['addr'])
    return ip_list


def make_font(name, size):
    font_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 'fonts', name))
    return ImageFont.truetype(font_path, size)

def temperature_humidity():
    humidity, temperature = Adafruit_DHT.read_retry(11, 4)
    return 'TEMP:{0:0.1f}C {1:0.1f}%'.format(temperature, humidity)

def main():
    font = make_font("ProggyTiny.ttf", 16)
    term = terminal(device, font)
    term.animate = False
    while True:
        term.println(temperature_humidity())
        time.sleep(60)
        term.clear()
        # puts adds a newline, println does not


if __name__ == "__main__":
    try:
        device = get_device()
        main()
    except KeyboardInterrupt:
        pass
