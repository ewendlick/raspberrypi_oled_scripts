#!/usr/bin/env python
# -*- coding: utf-8 -*-
# PYTHON_ARGCOMPLETE_OK

import os
import time
import sqlite3
from datetime import datetime, timedelta
from luma_files.demo_opts import get_device
from luma.core.virtual import terminal
from luma.core.render import canvas
from PIL import ImageFont
#https://stackoverflow.com/questions/270745/how-do-i-determine-all-of-my-ip-addresses-when-i-have-multiple-nics
from netifaces import interfaces, ifaddresses, AF_INET
import Adafruit_DHT

DHT_MODEL = 11
DHT_DATA_PIN = 4
DB_TABLE = 'temperature_and_humidity'
DB_FILENAME = 'heat_tech.db'
QUERY_MINUTES = 1 # minutes per query and per pixel on OLED
# TODO: print out number values to show range
ESTIMATED_TEMP_MIN = 17 # C
ESTIMATED_TEMP_MAX = 30 # C
FONT_SIZE_PX = 16

try:
    sqldb = sqlite3.connect(DB_FILENAME)
    query = 'create table if not exists ' + DB_TABLE + '(id INTEGER PRIMARY KEY AUTOINCREMENT, temperature REAL, humidity REAL, created_at DATETIME, deleted_at DATETIME)'
    sqldb.execute(query)
    sqldb.commit()
except Error as e:
    print(e)

def make_font(name, size):
    font_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 'fonts', name))
    return ImageFont.truetype(font_path, size)

def temperature_humidity_string(temperature, humidity):
    return 'TEMP:{0:0.1f}C {1:0.1f}%'.format(temperature, humidity)

def save_temperature_and_humidity(temperature, humidity):
    # TODO: needs refactor and advice from a Python developer regarding string interpolation
    try:
        current_datetime = datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        query = 'insert into ' + DB_TABLE + ' (temperature, humidity, created_at) values ({0:0.1f}, {1:0.1f}, '.format(temperature, humidity) + '\'' + current_datetime + '\')'
        print(query)
        sqldb.execute(query)
        sqldb.commit()
    except Error as e:
        print(e)

def get_temperatures_and_humidities():
    from_date_string = datetime.today() - timedelta(minutes=device.width)
    try:
        # TODO: figure out Python string interpolation best practices
        # Going to go with pre-Python3 methods of doing this, although the f'' format in 3.6 looks nice...
        date = from_date_string.strftime('%Y-%m-%d %H:%M:%S')
        query = 'select * from ' + DB_TABLE + ' where created_at > \'' + date + '\' limit ' + str(device.width)
        # result = sqldb.execute('select * from ' + DB_TABLE + 'where created_at > %s limit = %s', (date, device.width))
        result = sqldb.execute(query)
        return result.fetchall() # oldest at 0, newest at n
    except Error as e:
        print(e)

def calculate_y(temperature):
    working_area = device.height - FONT_SIZE_PX - 2
    estimated_range = ESTIMATED_TEMP_MAX - ESTIMATED_TEMP_MIN
    degree_step = working_area / estimated_range
    result = device.height - ((temperature - ESTIMATED_TEMP_MIN) * degree_step)
    return result

def draw_bar(draw, x, temperature):
    # draw bar at location
    # x1, y1, x2, y2
    draw.line((x, calculate_y(temperature), x, device.height), fill="white")

def draw_bars(draw):
    temperatures_and_humidities = get_temperatures_and_humidities()
    length = len(temperatures_and_humidities)
    # increase_index = 1 # TODO: draw from right side, 1 pixel space for lacking data
    for i in range(length - 1, -1, -1):
        print(temperatures_and_humidities[i][3], temperatures_and_humidities[i][1])
        offset = datetime.today() - datetime.strptime(temperatures_and_humidities[i][3], '%Y-%m-%d %H:%M:%S')
        # print(offset.total_seconds() / 60 / (i + 1))
        # TODO: need to track location of index here and draw a blank line for the appropriate ones
        if (0 < (offset.total_seconds() / 60 / (i + 1)) < device.width):
            draw_bar(draw, i, temperatures_and_humidities[i][1])
        else:
            draw_bar(draw, i, ESTIMATED_TEMP_MIN) # HACK: draw, but no height

def main():
    font = make_font("ProggyTiny.ttf", FONT_SIZE_PX)
    while True:
        humidity, temperature = Adafruit_DHT.read_retry(DHT_MODEL, DHT_DATA_PIN)
        save_temperature_and_humidity(temperature, humidity)

        # TODO: see about the implications of having canvas(device) here in the loop
        with canvas(device) as draw:
            draw.line((0, FONT_SIZE_PX - 1, device.width, FONT_SIZE_PX - 1), fill="white")
            draw_bars(draw)
            draw.text((0, 0), temperature_humidity_string(temperature, humidity), font=font, fill="white")
        time.sleep(QUERY_MINUTES * 60)
        # device.clear() # possibly required?

if __name__ == "__main__":
    try:
        device = get_device()
        main()
    except KeyboardInterrupt:
        pass
