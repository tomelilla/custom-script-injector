import os
from PIL import Image, ImageDraw, ImageFont

def generate_icon(size, output_path):
    # Monokai Colors
    BG_COLOR = "#272822"
    BRACE_LEFT_COLOR = "#F92672"  # Pink
    BRACE_RIGHT_COLOR = "#A6E22E" # Green

    # Create image with transparent background
    # But for the icon body we want a rounded rect or circle.
    # Let's do a rounded rect.

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded background
    padding = size * 0.05
    rect_coords = [padding, padding, size - padding, size - padding]
    radius = size * 0.2

    draw.rounded_rectangle(rect_coords, radius=radius, fill=BG_COLOR)

    # Draw text "{ }"
    # Try to use a default font or a sans-serif one if available
    try:
        # MacOS usually has Arial or Helvetica
        font_path = "/System/Library/Fonts/Helvetica.ttc"
        if not os.path.exists(font_path):
             font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"

        font_size = int(size * 0.5)
        font = ImageFont.truetype(font_path, font_size)
    except Exception:
        font = ImageFont.load_default()

    text_left = "{"
    text_right = "}"

    # Measure text size to center it
    # note: textbbox is newer, textsize is deprecated
    # fallback for older Pillow versions if needed
    try:
        left_bbox = draw.textbbox((0, 0), text_left, font=font)
        left_w = left_bbox[2] - left_bbox[0]
        left_h = left_bbox[3] - left_bbox[1]

        right_bbox = draw.textbbox((0, 0), text_right, font=font)
        right_w = right_bbox[2] - right_bbox[0]
    except AttributeError:
        # Fallback for older Pillow
        left_w, left_h = draw.textsize(text_left, font=font)
        right_w, _ = draw.textsize(text_right, font=font)

    total_w = left_w + right_w + (size * 0.05) # slight gap

    start_x = (size - total_w) / 2

    # Y centering is tricky with fonts, approximate vertical center
    # Baseline usually needs to be lower than true center
    start_y = (size - left_h) / 2 - (left_h * 0.1)

    draw.text((start_x, start_y), text_left, font=font, fill=BRACE_LEFT_COLOR)
    draw.text((start_x + left_w + (size * 0.05), start_y), text_right, font=font, fill=BRACE_RIGHT_COLOR)

    # Save
    img.save(output_path, "PNG")
    print(f"Generated {output_path} ({size}x{size})")

def main():
    sizes = [128, 48, 16]
    output_dir = "icons"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for size in sizes:
        output_path = os.path.join(output_dir, f"icon{size}.png")
        generate_icon(size, output_path)

if __name__ == "__main__":
    main()
