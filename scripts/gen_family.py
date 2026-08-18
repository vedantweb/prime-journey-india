import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path('/app/backend/.env'))

async def main():
    from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
    gen = OpenAIImageGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
    images = await gen.generate_images(
        prompt=(
            "Photorealistic candid travel photograph of a happy Indian family — mother in an elegant colorful kurta, "
            "father in a smart casual shirt, a young daughter and a teenage son — standing together outdoors at a "
            "beautiful bright airport terminal forecourt with wheeled suitcases and travel backpacks beside them, "
            "ready to leave for a holiday, genuinely laughing naturally, warm golden morning sunlight, soft blue sky, "
            "optimistic aspirational premium Indian travel brand aesthetic, cinematic but realistic, bright welcoming "
            "lighting, landscape orientation, subjects on the right half with open sky space on the left for text, "
            "no text, no logos, no watermarks"
        ),
        model="gpt-image-1",
        number_of_images=1,
    )
    raw = '/app/scripts/hero_family_raw.png'
    with open(raw, 'wb') as f:
        f.write(images[0])
    from PIL import Image
    im = Image.open(raw).convert('RGB')
    w, h = im.size
    if w > 1920:
        im = im.resize((1920, int(h * 1920 / w)), Image.LANCZOS)
    im.save('/app/frontend/public/assets/hero-family.webp', 'WEBP', quality=80, method=6)
    print('saved', im.size)

asyncio.run(main())
