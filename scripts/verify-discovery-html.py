"""Check production prerendered HTML without a server. Not a browser/runtime test."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
built = root / '.next/server/app'

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.links = []
        self.meta = []
        self.headings = []
        self.text = []
        self.section_stack = []
        self.section_text = {}
        self.section_count = 0
        self.scripts = []
        self.script = None
        self.script_text = ''
        self.images = []
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'section':
            key = a.get('id') or ('hero' if self.section_count == 0 else f'section-{self.section_count}')
            self.section_count += 1
            self.section_stack.append(key)
            self.section_text.setdefault(key, [])
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'a': self.links.append(a)
        if tag == 'link': self.meta.append(a)
        if tag == 'img': self.images.append(a)
        if tag in ('h1', 'h2', 'h3', 'h4'): self.headings.append(int(tag[1]))
        if tag == 'script': self.script = a; self.script_text = ''
    def handle_endtag(self, tag):
        if tag == 'section' and self.section_stack:
            self.section_stack.pop()
        if tag == 'script' and self.script is not None:
            if self.script.get('type') == 'application/ld+json': self.scripts.append(json.loads(self.script_text))
            self.script = None
    def handle_data(self, text):
        if self.script is not None: self.script_text += text
        else:
            self.text.append(text)
            for key in self.section_stack:
                self.section_text[key].append(text)

def page(path):
    return Page((built / ('index.html' if path == '/' else path.lstrip('/') + '.html')).read_text())

checks = []
def check(condition, label):
    checks.append({'check': label, 'pass': bool(condition)})

routes = ['/', '/ru', '/visibility', '/ru/visibility', '/pricing', '/ru/pricing', '/check', '/ru/check', '/methodology', '/ru/methodology']
for route in routes:
    doc = page(route)
    check(doc.headings.count(1) == 1, f'{route}: one H1')
    check(bool(doc.scripts), f'{route}: parseable JSON-LD')
    check(all('alt' in image for image in doc.images), f'{route}: image alt attributes')
    check(not any('app.selenasystems.com' in link.get('href', '') or 'staging.' in link.get('href', '') for link in doc.links), f'{route}: no staging/portal CTA')
    if route not in ['/', '/ru']:
        base = route.removeprefix('/ru')
        alternate = {link.get('hreflang'): urlsplit(link.get('href', '')).path for link in doc.meta if link.get('rel') == 'alternate'}
        check(alternate.get('en') == base and alternate.get('ru') == '/ru' + base, f'{route}: EN/RU hreflang')
        check(any(link.get('rel') == 'canonical' and urlsplit(link.get('href', '')).path == route for link in doc.meta), f'{route}: self canonical')

landing = page('/visibility')
text = ' '.join(landing.text)
for phrase in ['Public Readiness is not an AI visibility measurement', 'Visibility Snapshot', 'Full Discovery Landscape', '60-minute Strategy Session', '48 hours', '24 hours', '3 business days', '30 days', 'mandatory applicable law', 'Includes manual Google Ask Maps / Local AI investigation where relevant', 'weekly production delivery is not activated', 'fictional', 'Result: not measured']:
    check(phrase in text, 'landing: ' + phrase)
hero_text = ' '.join(landing.section_text.get('hero', []))
plans_text = ' '.join(landing.section_text.get('plans', []))
audit_text = ' '.join(landing.section_text.get('competitive-audit', []))
check(not any(term in hero_text for term in ['Ask Maps', 'Local AI']), 'hero: no manual discovery offer')
check(not any(term in plans_text for term in ['Ask Maps', 'Local AI']), 'subscriptions: no manual Ask Maps / Local AI')
check('production-capable automated measurement is verified' in plans_text, 'subscriptions: automated Local verification boundary')
check('Includes manual Google Ask Maps / Local AI investigation where relevant' in audit_text, 'audit: manual discovery belongs to human investigation')
check(not any(client in text for client in ['AVLI', 'Usha']), 'landing: no client proof identity')
check(landing.headings[0] == 1 and all(b <= a + 1 for a, b in zip(landing.headings, landing.headings[1:])), 'landing: semantic heading order')
for anchor in ['plans', 'readiness', 'early-access', 'audit-order', 'managed-application', 'action-plan', 'competitive-audit', 'managed']:
    check(landing.ids.count(anchor) == 1, 'landing: unique target #' + anchor)
# Validate all links on the landing and all offer destination anchors on pricing/home.
redirects = json.loads((root / '.next/routes-manifest.json').read_text())['redirects']
redirect_paths = {r['source'] for r in redirects if ':' not in r['source']}
for route in ['/', '/ru', '/visibility', '/pricing', '/ru/pricing']:
    doc = page(route)
    for link in doc.links:
        href = link.get('href', '')
        if not href.startswith(('/', '#')): continue
        u = urlsplit(href)
        path = u.path or route
        file = built / ('index.html' if path == '/' else path.lstrip('/') + '.html')
        if path:
            check(file.exists() or path in redirect_paths, f'{route}: route {href}')
            if u.fragment and file.exists(): check(unquote(u.fragment) in page(path).ids, f'{route}: anchor {href}')
# Only free Public Readiness can advertise an Offer on the Visibility page.
def offers(value):
    if isinstance(value, dict):
        if value.get('@type') == 'Offer': yield value
        for child in value.values(): yield from offers(child)
    elif isinstance(value, list):
        for child in value: yield from offers(child)
check(all(str(offer.get('price')) == '0' for script in landing.scripts for offer in offers(script)), 'landing: no purchasable paid Offer')
result = {'kind': 'production-prerendered-HTML-only', 'routes': routes, 'passed': sum(c['pass'] for c in checks), 'failed': sum(not c['pass'] for c in checks), 'checks': checks}
print(json.dumps(result, indent=2, ensure_ascii=False))
sys.exit(1 if result['failed'] else 0)
