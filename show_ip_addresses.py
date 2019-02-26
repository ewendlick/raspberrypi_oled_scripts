#!/usr/bin/env python
# -*- coding: utf-8 -*-
# PYTHON_ARGCOMPLETE_OK


import os
import time
from luma_files.demo_opts import get_device
from luma.core.virtual import terminal
from PIL import ImageFont
#https://stackoverflow.com/questions/270745/how-do-i-determine-all-of-my-ip-addresses-when-i-have-multiple-nics
from netifaces import interfaces, ifaddresses, AF_INET
time.sleep(20) # seconds

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


def main():
    while True:
        for fontname, size in [("ProggyTiny.ttf", 16)]:
            font = make_font(fontname, size) if fontname else None
            term = terminal(device, font)

            term.println('Running...')
            term.println('\n'.join(ip4_addresses()))
            term.println('ayoooooooooooooooooo')


if __name__ == "__main__":
    try:
        device = get_device()
        main()
    except KeyboardInterrupt:
        pass
