import os
import json
from PIL import Image

def optimize_images(image_dir):
    print(f"Optimizing images in {image_dir}...")
    for filename in os.listdir(image_dir):
        if filename.endswith(".png"):
            img_path = os.path.join(image_dir, filename)
            # Skip TeaMap.png as it's small or special
            if filename == "TeaMap.png":
                continue
            
            try:
                img = Image.open(img_path)
                # Keep aspect ratio, maybe resize if very large?
                # For now just convert to WebP with 80 quality
                webp_path = os.path.splitext(img_path)[0] + ".webp"
                img.save(webp_path, "WEBP", quality=80)
                print(f"  Converted {filename} to .webp")
                # DO NOT delete original yet, we'll do it later 
            except Exception as e:
                print(f"  Error converting {filename}: {e}")

def update_source_code(src_dir):
    print(f"Updating image references in {src_dir}...")
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".tsx", ".ts", ".css")):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Simple replacement for specific image names
                new_content = content
                for name in ["CTC", "GreenTea", "High", "InstantTea", "LOW", "OrganicTea", "OrthodoxTea", "ReclaimedTea", "TotalBlackTea", "medium"]:
                    new_content = new_content.replace(f"{name}.png", f"{name}.webp")
                
                if new_content != content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"  Updated {file}")

def minify_json(json_path):
    if not os.path.exists(json_path):
        return
    print(f"Minifying {json_path}...")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(',', ':'))

if __name__ == "__main__":
    base_dir = r"c:\Users\kasun\Documents\Kasun Vishvajith @ Data Science\Advanced ML\Tea Production\WApp"
    image_dir = os.path.join(base_dir, "frontend", "public", "images")
    src_dir = os.path.join(base_dir, "frontend", "src")
    map_json = os.path.join(base_dir, "frontend", "src", "components", "mapData.json")
    
    optimize_images(image_dir)
    update_source_code(src_dir)
    minify_json(map_json)
    print("Optimization complete.")
