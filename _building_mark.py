from pathlib import Path
import re

mark = (
    '<span class="brand-mark" aria-hidden="true">'
    '<img src="/assets/pt-mark.svg?v=building-1" alt="" width="44" height="44" />'
    '</span>'
)

changed = []
for p in Path('.').glob('*.html'):
    t = p.read_text()
    nt = t
    nt = nt.replace('<span class="brand-mark">PT</span>', mark)
    nt = nt.replace('<span class="brand-mark" aria-hidden="true">PT</span>', mark)
    nt = re.sub(r'styles\.css\?v=[^"\']+', 'styles.css?v=building-mark-1', nt)
    nt = re.sub(r'site\.js\?v=[^"\']+', 'site.js?v=building-mark-1', nt)
    nt = re.sub(r'favicon\.svg\?v=[^"\']+', 'favicon.svg?v=building-1', nt)
    nt = re.sub(r'favicon\.ico\?v=[^"\']+', 'favicon.ico?v=building-1', nt)
    nt = re.sub(r'apple-touch-icon\.png\?v=[^"\']+', 'apple-touch-icon.png?v=building-1', nt)
    if nt != t:
        p.write_text(nt)
        changed.append(p.name)

print('changed', sorted(changed))
left = [p.name for p in Path('.').glob('*.html') if 'brand-mark">PT' in p.read_text()]
print('left', left)
