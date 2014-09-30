#!/usr/bin/python3

from PIL import Image
from PIL import ImageDraw

image_out = Image.new("RGBA", (17232, 48))

for i in range(0,360):
    filename = (str(i)).rjust(4, "0")+".png"
    image_in = Image.open(filename)
    image_out.paste(image_in, (i*48, 0))

image_out.save("out.png")
