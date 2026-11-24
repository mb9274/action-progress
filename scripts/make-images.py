from PIL import Image, ImageDraw, ImageFont
import os

out = r'C:\Users\DELL\action-for-progress\public'

def load_font(size, bold=False):
    names = ['segoeuib.ttf', 'arialbd.ttf', 'seguisb.ttf', 'arial.ttf', 'segoeui.ttf']
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            pass
    return ImageFont.load_default()

# OG image 1200x630
img = Image.new('RGB', (1200, 630), '#16204A')
d = ImageDraw.Draw(img)
d.ellipse((880, -80, 1280, 320), fill='#223066')
d.ellipse((-120, 380, 420, 920), fill='#1f5f3c')
d.rectangle((0, 600, 1200, 630), fill='#F2B705')
d.rectangle((0, 600, 400, 630), fill='#2E8B57')
d.rectangle((800, 600, 1200, 630), fill='#D4476B')
d.rounded_rectangle((80, 170, 220, 310), radius=32, fill='#0E1633', outline='#F2B705', width=4)

title = load_font(72, True)
sub = load_font(36)
small = load_font(28)

# Simple letter marks
try:
    d.text((112, 190), 'A', fill='#F2B705', font=load_font(70, True))
    d.text((150, 220), 'P', fill='#2E8B57', font=load_font(70, True))
except Exception:
    pass

d.text((260, 185), 'Action for Progress', fill='#FFF9EC', font=title)
d.multiline_text((260, 285), 'Supporting less privileged girls, mothers\nand children in Brookfields, Freetown.',
                 fill='#E5E1EF', font=sub, spacing=10)
d.text((260, 405), 'Brookfields, west end of Freetown, Sierra Leone', fill='#F2B705', font=small)
img.save(os.path.join(out, 'og-default.png'), 'PNG')

# apple touch icon 180
icon = Image.new('RGB', (180, 180), '#16204A')
di = ImageDraw.Draw(icon)
di.ellipse((118, 28, 150, 60), fill='#F2B705')
di.text((44, 44), 'A', fill='#F2B705', font=load_font(72, True))
di.text((84, 68), 'P', fill='#2E8B57', font=load_font(72, True))
di.rounded_rectangle((36, 140, 144, 152), radius=6, fill='#D4476B')
icon.save(os.path.join(out, 'apple-touch-icon.png'), 'PNG')

print('ok')
