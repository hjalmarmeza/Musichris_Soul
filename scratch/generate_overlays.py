import sys
import os
from PIL import Image, ImageDraw, ImageFont
import textwrap

def generate_overlay(body, title, output_path):
    width, height = 1080, 1920
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Fonts
    assets_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    font_path = os.path.join(assets_dir, "assets", "Georgia-Bold.ttf")
    
    base_font_size = 55
    max_width_px = 880
    line_spacing = 18
    
    while True:
        try:
            font = ImageFont.truetype(font_path, base_font_size)
        except:
            font = ImageFont.load_default()
            
        words = body.split(' ')
        wrapped_lines = []
        current_line = []
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if (bbox[2] - bbox[0]) <= max_width_px:
                current_line.append(word)
            else:
                if current_line:
                    wrapped_lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    wrapped_lines.append(word)
                    current_line = []
        if current_line:
            wrapped_lines.append(' '.join(current_line))
            
        total_h = sum([draw.textbbox((0, 0), l, font=font)[3] - draw.textbbox((0, 0), l, font=font)[1] for l in wrapped_lines]) + (len(wrapped_lines)-1)*line_spacing
        
        if total_h < 800:
            break
        base_font_size -= 2
        if base_font_size < 20: break

    y_text = 900 - (total_h // 2)
    for line in wrapped_lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        draw.text(((width-w)/2, y_text), line, font=font, fill="white", stroke_width=3, stroke_fill="black")
        y_text += h + line_spacing
        
    # Title
    font_title = ImageFont.truetype(font_path, 80)
    w_t = draw.textbbox((0, 0), title, font=font_title)[2]
    draw.text(((width-w_t)/2, 1400), title, font=font_title, fill="#FFD700", stroke_width=2, stroke_fill="black")
    
    img.save(output_path)
    print(f"Generated {output_path} with v7.7 logic")

if __name__ == "__main__":
    body = "Huyendo de su hijo Absalón, David, un rey acostumbrado al palacio, ahora duerme en la arena en peligro de muerte y escasez."
    title = "Salmo 63"
    generate_overlay(body, title, "scratch_overlay.png")
