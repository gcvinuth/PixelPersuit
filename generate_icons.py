import zlib
import struct
import math

def write_png(filename, width, height, rgba_data):
    def chunk(tag, data):
        return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)) # 8-bit RGBA
    raw_rows = []
    row_bytes = width * 4
    for y in range(height):
        raw_rows.append(b'\x00' + rgba_data[y * row_bytes : (y + 1) * row_bytes])
    idat_data = zlib.compress(b''.join(raw_rows), 9)
    idat = chunk(b'IDAT', idat_data)
    iend = chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(header + ihdr + idat + iend)

def create_pixel_icon(size):
    buf = bytearray(size * size * 4)
    cx, cy = size / 2.0, size / 2.0
    r_outer = size * 0.44
    r_inner = size * 0.38
    r_core = size * 0.16

    for y in range(size):
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = math.hypot(dx, dy)
            angle = math.atan2(dy, dx)
            idx = (y * size + x) * 4

            # Rounded square base
            corner_d = max(abs(dx), abs(dy))
            if corner_d > size * 0.48:
                # Outside or corner border
                buf[idx] = 13; buf[idx+1] = 15; buf[idx+2] = 24; buf[idx+3] = 0
                continue
            
            # Background deep velvet midnight
            r, g, b, a = 18, 22, 36, 255
            # Vignette & subtle grid
            grid = (int(x / (size / 16)) + int(y / (size / 16))) % 2
            if grid == 0:
                r, g, b = 24, 28, 45

            # Outer golden ring
            if r_inner <= dist <= r_outer:
                # Gold gradient with highlight
                rim_angle = (angle + math.pi) / (2 * math.pi)
                if abs(dist - r_outer) < size * 0.02 or abs(dist - r_inner) < size * 0.02:
                    r, g, b = 245, 158, 11 # Bright amber
                else:
                    gold_val = int(180 + 75 * math.cos(angle - 0.7))
                    r, g, b = min(255, gold_val + 20), min(255, int(gold_val * 0.8)), 30
            
            # Astrolabe spokes (8 directional lines)
            spoke_angle = (angle % (math.pi / 4)) - (math.pi / 8)
            if dist < r_inner and abs(math.sin(angle * 4)) < 0.15 and dist > r_core:
                r, g, b = 217, 119, 6

            # Center Astrolabe Core Gem (Glowing Cyan Oculus)
            if dist <= r_core:
                core_ratio = dist / r_core
                if core_ratio < 0.5:
                    r, g, b = 165, 243, 252 # Bright cyan eye
                elif core_ratio < 0.85:
                    r, g, b = 6, 182, 212 # Cyan
                else:
                    r, g, b = 14, 116, 144 # Deep cyan border
            
            # Pixel art filigree corner accents
            if (abs(dx) > size * 0.38 and abs(dy) > size * 0.38) and corner_d < size * 0.46:
                r, g, b = 251, 191, 36

            buf[idx] = r
            buf[idx+1] = g
            buf[idx+2] = b
            buf[idx+3] = a

    return bytes(buf)

write_png("assets/icon-192.png", 192, 192, create_pixel_icon(192))
write_png("assets/icon-512.png", 512, 512, create_pixel_icon(512))
print("PWA icons generated successfully!")
