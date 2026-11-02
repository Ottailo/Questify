"""
Generate QuestSage brand icons (logo512.png, logo192.png, favicon.ico)
matching the Momentum Prism logo SVG.
"""
from PIL import Image, ImageDraw
import os

PUBLIC_DIR = r"c:\Users\Hp\Documents\Projects\Questify\frontend\public"

def render_momentum_prism(size: int, supersample: int = 4) -> Image.Image:
    """
    Renders the Momentum Prism logo at target size using supersampling for crisp anti-aliasing.
    Target viewBox is 64x64.
    """
    render_size = size * supersample
    s = render_size / 64.0

    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Container: rounded rect
    # In SVG: <rect width="64" height="64" rx="14" fill="#0D1117" stroke="#21262D" stroke-width="2"/>
    border_w = max(1, round(2.0 * s))
    # Offset stroke slightly inward so stroke remains fully within bounds
    # half_w = border_w / 2.0
    container_box = [border_w / 2.0, border_w / 2.0, render_size - 1 - border_w / 2.0, render_size - 1 - border_w / 2.0]
    draw.rounded_rectangle(
        container_box,
        radius=14.0 * s,
        fill="#0D1117",
        outline="#21262D",
        width=border_w
    )

    # 2. Bar 1: x=14, y=38, w=8, h=14, rx=2, fill="#4B5563"
    draw.rounded_rectangle(
        [14.0 * s, 38.0 * s, (14.0 + 8.0) * s, (38.0 + 14.0) * s],
        radius=2.0 * s,
        fill="#4B5563"
    )

    # 3. Bar 2: x=26, y=28, w=8, h=24, rx=2, fill="#F59E0B"
    draw.rounded_rectangle(
        [26.0 * s, 28.0 * s, (26.0 + 8.0) * s, (28.0 + 24.0) * s],
        radius=2.0 * s,
        fill="#F59E0B"
    )

    # 4. Bar 3: x=38, y=16, w=8, h=36, rx=2, fill="#F95721"
    draw.rounded_rectangle(
        [38.0 * s, 16.0 * s, (38.0 + 8.0) * s, (16.0 + 36.0) * s],
        radius=2.0 * s,
        fill="#F95721"
    )

    # 5. Momentum vector (the breakthrough arrow)
    # SVG: <path d="M14 48 L46 16 M46 16 H36 M46 16 V26" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    arrow_w = max(1, round(3.0 * s))
    arrow_color = "#FFFFFF"

    # Main diagonal: (14, 48) -> (46, 16)
    p_start = (14.0 * s, 48.0 * s)
    p_tip = (46.0 * s, 16.0 * s)
    p_left = (36.0 * s, 16.0 * s)
    p_down = (46.0 * s, 26.0 * s)

    # Draw lines with joint="curve"
    draw.line([p_start, p_tip], fill=arrow_color, width=arrow_w, joint="curve")
    draw.line([p_tip, p_left], fill=arrow_color, width=arrow_w, joint="curve")
    draw.line([p_tip, p_down], fill=arrow_color, width=arrow_w, joint="curve")

    # Round caps: draw circles at endpoints (radius = arrow_w / 2)
    cap_r = arrow_w / 2.0
    for pt in [p_start, p_tip, p_left, p_down]:
        draw.ellipse([pt[0] - cap_r, pt[1] - cap_r, pt[0] + cap_r, pt[1] + cap_r], fill=arrow_color)

    # Downsample cleanly to target size
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    # Generate logo512.png
    print("Rendering logo512.png (512x512)...")
    img512 = render_momentum_prism(512, supersample=4)
    path512 = os.path.join(PUBLIC_DIR, "logo512.png")
    img512.save(path512, format="PNG")
    print(f"Saved {path512}")

    # Generate logo192.png
    print("Rendering logo192.png (192x192)...")
    img192 = render_momentum_prism(192, supersample=4)
    path192 = os.path.join(PUBLIC_DIR, "logo192.png")
    img192.save(path192, format="PNG")
    print(f"Saved {path192}")

    # Generate favicon.ico (multi-size: 16, 24, 32, 48, 64)
    print("Rendering favicon.ico (sizes: 16, 24, 32, 48, 64)...")
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
    # Render individual crisp frames for each icon size
    frames = [render_momentum_prism(w, supersample=4) for w, h in ico_sizes]
    path_ico = os.path.join(PUBLIC_DIR, "favicon.ico")
    # Save the largest frame with append_images
    frames[-1].save(
        path_ico,
        format="ICO",
        sizes=ico_sizes,
        append_images=frames[:-1]
    )
    print(f"Saved {path_ico}")
    print("All brand assets generated successfully.")

if __name__ == "__main__":
    main()
