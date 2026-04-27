import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

def generate_phase_card(title, body, output_path, width=1080, height=1920, is_outro=False, mode="phase1"):
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Text configuration (SUPREME SIZING - fit within 900px card)
    base_font_size = 135
    if len(body) > 100: base_font_size = 115
    if len(body) > 160: base_font_size = 100
    
    # Font path logic
    assets_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    font_bold = os.path.join(assets_dir, "assets", "Georgia-Bold.ttf")
    
    if not os.path.exists(font_bold):
        font_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" 

    try:
        font_main = ImageFont.truetype(font_bold, base_font_size)
        font_citation = ImageFont.truetype(font_bold, 75)
        font_handle = ImageFont.truetype(font_bold, 80)
        font_button = ImageFont.truetype(font_bold, 52)
        font_footer = ImageFont.truetype(font_bold, 44)
    except:
        font_main = font_citation = font_handle = font_button = font_footer = ImageFont.load_default()

    if not is_outro:
        # Force font to start a bit larger
        base_font_size = 75
        font_main = ImageFont.truetype(font_bold, base_font_size)

        # Usar un ancho de bloque mayor (más palabras por línea para llenar el repositorio horizontalmente)
        wrap_width = 34
        wrapped_lines = textwrap.wrap(body, width=wrap_width)
        line_spacing = 40

        # HARD FIT LOOP: Shrink until width < 820 (margen de 40px por lado)
        while True:
            max_w = max([draw.textbbox((0, 0), l, font=font_main)[2] for l in wrapped_lines])
            total_h = sum([draw.textbbox((0, 0), l, font=font_main)[3] for l in wrapped_lines]) + (len(wrapped_lines)-1)*line_spacing
            
            if max_w < 820 and total_h < 750:
                break
            
            base_font_size -= 2 # Bajada más suave y precisa
            if base_font_size < 35: break 
            font_main = ImageFont.truetype(font_bold, base_font_size)
        
        # 1. MIDDLE: Body Text (Positioned slightly higher to avoid overlap)
        y_text = 900 - (total_h // 2)
        for line in wrapped_lines:
            w, h = draw.textbbox((0, 0), line, font=font_main)[2:]
            draw.text(((width-w)/2, y_text), line, font=font_main, fill="white", stroke_width=3, stroke_fill="black")
            y_text += h + line_spacing
            
        # 2. BOTTOM: Title Marker (Citation or Phase Name - Lowered)
        deco = "————————"
        w_deco, h_deco = draw.textbbox((0, 0), deco, font=font_citation)[2:]
        draw.text(((width-w_deco)/2, 1400), deco, font=font_citation, fill=(255, 255, 255, 180))
        
        w_title, h_title = draw.textbbox((0, 0), title, font=font_citation)[2:]
        draw.text(((width-w_title)/2, 1450), title, font=font_citation, fill="#D4AF37", stroke_width=2, stroke_fill="black")

    else:
        # Outro Credits
        handle = "@Musichris_Studio"
        button_text = "¡Caminemos juntos en fe!"
        footer = "Escucha la canción completa en el canal"
        
        # Outro Credits - Positioning below the animated logo
        y = height // 2 + 50
        w, h = draw.textbbox((0, 0), handle, font=font_handle)[2:]
        draw.text(((width-w)/2, y), handle, font=font_handle, fill="white", stroke_width=3, stroke_fill="black")
        
        y += h + 80
        bw, bh = draw.textbbox((0, 0), button_text, font=font_button)[2:]
        # Pill button
        padding = 40
        draw.rounded_rectangle([width/2 - bw/2 - padding, y, width/2 + bw/2 + padding, y + bh + padding], radius=40, fill="#D4AF37")
        draw.text(((width-bw)/2, y + padding/2), button_text, font=font_button, fill="black")
        
        w, h = draw.textbbox((0, 0), footer, font=font_footer)[2:]
        draw.text(((width-w)/2, height/2 + 540), footer, font=font_footer, fill=(255, 255, 255, 200))

    img.save(output_path)
    print(f"✅ Generated: {output_path}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3: sys.exit(1)
        
    mode = sys.argv[1] 
    output = sys.argv[2]
    
    if mode == "outro":
        generate_phase_card("", "", output, is_outro=True)
    else:
        title_val = sys.argv[3] if len(sys.argv) > 3 else ""
        body_val = sys.argv[4] if len(sys.argv) > 4 else ""
        generate_phase_card(title_val, body_val, output, mode=mode)
