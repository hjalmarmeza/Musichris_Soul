import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

def generate_phase_card(title, body, output_path, width=1080, height=1920, font_path="/System/Library/Fonts/Supplemental/Georgia.ttf", is_outro=False, mode="phase1"):
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Text configuration (SUPERSIZED for readability)
    base_font_size = 85
    if len(body) > 150: base_font_size = 72
    if len(body) > 250: base_font_size = 65
    
    try:
        font_main = ImageFont.truetype(font_path, base_font_size)
        font_citation = ImageFont.truetype(font_path, 75)
        font_handle = ImageFont.truetype(font_path, 82)
        font_button = ImageFont.truetype(font_path, 52)
        font_footer = ImageFont.truetype(font_path, 44)
    except:
        font_main = font_citation = font_handle = font_button = font_footer = ImageFont.load_default()

    if not is_outro:
        # Wrap text narrower to allow larger font size
        wrap_width = 22 if base_font_size < 75 else 18
        wrapped_lines = textwrap.wrap(body, width=wrap_width)
        
        # Calculate total height to center group
        line_spacing = 25 # Increased spacing
        total_text_height = sum([draw.textbbox((0, 0), line, font=font_main)[3] for line in wrapped_lines]) + (len(wrapped_lines)-1)*line_spacing
        
        y = height // 2 - (total_text_height // 2) - 80 # Shift up slightly
        
        for line in wrapped_lines:
            w, h = draw.textbbox((0, 0), line, font=font_main)[2:]
            # Premium stroke + shadow
            draw.text(((width-w)/2, y), line, font=font_main, fill="white", stroke_width=3, stroke_fill="black")
            y += h + line_spacing
            
        # Drawing Decoration Line & Title (Citation/Phase)
        y += 70
        deco = "————————————"
        w_deco, h_deco = draw.textbbox((0, 0), deco, font=font_citation)[2:]
        draw.text(((width-w_deco)/2, y), deco, font=font_citation, fill=(255, 255, 255, 180), stroke_width=1, stroke_fill="black")
        
        y += h_deco + 30
        w_cite, h_cite = draw.textbbox((0, 0), title, font=font_citation)[2:]
        
        # Gold highlight for the phase title
        gold_color = "#D4AF37"
        draw.text(((width-w_cite)/2, y), title, font=font_citation, fill=gold_color, stroke_width=2, stroke_fill="black")

    else:
        # Outro Credits (Reference Image 4)
        handle = "@Musichris_Studio"
        button_text = "¡Caminemos juntos en fe!"
        footer = "Escucha la canción completa en el canal"
        
        w, h = draw.textbbox((0, 0), handle, font=font_handle)[2:]
        draw.text(((width-w)/2, height/2 + 220), handle, font=font_handle, fill="white", stroke_width=1, stroke_fill="black")
        
        bw, bh = draw.textbbox((0, 0), button_text, font=font_button)[2:]
        padding_x, padding_y = 60, 30
        rect_coords = [(width-bw)/2 - padding_x, height/2 + 380 - padding_y, (width+bw)/2 + padding_x, height/2 + 380 + bh + padding_y]
        draw.rounded_rectangle(rect_coords, radius=bh, fill=(255, 255, 255, 35), outline="white", width=2)
        draw.text(((width-bw)/2, height/2 + 380), button_text, font=font_button, fill="white")
        
        w, h = draw.textbbox((0, 0), footer, font=font_footer)[2:]
        draw.text(((width-w)/2, height/2 + 540), footer, font=font_footer, fill=(255, 255, 255, 200))

    img.save(output_path)
    print(f"✅ Generated: {output_path} (Size: {len(body)})")

if __name__ == "__main__":
    import sys
    mode = sys.argv[1] # phase1, phase2, phase3, outro
    output = sys.argv[2]
    
    if mode == "outro":
        generate_phase_card("", "", output, is_outro=True)
    else:
        title = sys.argv[3]
        body = sys.argv[4]
        generate_phase_card(title, body, output, mode=mode)
