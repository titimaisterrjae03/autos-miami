import os
import shutil
import re
import json

SOURCE_DIR = r"c:/php/htdocs/autos_miami/car_miami"
DEST_IMG_DIR = r"c:/php/htdocs/autos_miami/public/img"

if not os.path.exists(DEST_IMG_DIR):
    os.makedirs(DEST_IMG_DIR)

cars = []
id_counter = 1

def parse_folder_name(folder_name):
    # Try different patterns
    # 1. 2020 Chevy Equinox
    # 2. Toyota Corolla 2023 negro
    
    parts = folder_name.split()
    year = None
    make = ""
    model = ""
    rest = []

    for part in parts:
        if part.isdigit() and len(part) == 4 and part.startswith('20'):
            year = int(part)
        else:
            rest.append(part)
            
    if not year:
        year = 2024 # Default fallback? Or skip?

    # Heuristic for Make (First word of rest)
    if rest:
        make = rest[0]
        model = " ".join(rest[1:])
    
    return make, model, year

for folder_name in os.listdir(SOURCE_DIR):
    folder_path = os.path.join(SOURCE_DIR, folder_name)
    if not os.path.isdir(folder_path):
        continue

    # Parse metadata
    make, model, year = parse_folder_name(folder_name)
    
    # Check for text file
    price = 18000 # Default
    miles = 30000 # Default
    txt_path = os.path.join(folder_path, "car.txt")
    if os.path.exists(txt_path) and os.path.getsize(txt_path) > 0:
        try:
            with open(txt_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Simple extraction logic (can be refined)
                # Assuming "Price: 20000" or just lines
                pass 
        except:
            pass

    # Find Images
    car_images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if not car_images:
        continue

    # Process all images
    image_paths = []
    slug = f"{make}-{model}-{year}".lower().replace(" ", "-")
    
    for idx, img_file in enumerate(car_images, 1):
        src_img = os.path.join(folder_path, img_file)
        ext = os.path.splitext(img_file)[1]
        new_filename = f"{slug}-{id_counter}-{idx}{ext}"
        dest_img = os.path.join(DEST_IMG_DIR, new_filename)
        
        shutil.copy2(src_img, dest_img)
        image_paths.append(f"/img/{new_filename}")

    # Add to list
    cars.append({
        "id": id_counter,
        "make": make,
        "model": model,
        "year": year,
        "price": price,
        "downPayment": 1500, # Static as per request/default
        "miles": miles,
        "image": image_paths[0], # Main image for grid
        "images": image_paths,   # All images for carousel
        "status": "available"
    })
    
    id_counter += 1

print(json.dumps(cars, indent=2))
