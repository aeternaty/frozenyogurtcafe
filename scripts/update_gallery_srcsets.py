import re

file_path = 'src/components/Gallery.astro'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(
    r'srcset="/assets/images/store/(\d+)-400w\.webp 400w',
    r'srcset="/assets/images/store/\g<1>-208w.webp 208w, /assets/images/store/\g<1>-400w.webp 400w',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated Gallery.astro')
