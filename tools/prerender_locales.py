#!/usr/bin/env python3
"""Prerender locale HTML pages from the Chinese homepage and language JSON."""
from __future__ import annotations

import argparse
import html
import json
import re
from datetime import date
from pathlib import Path

LOCALE_PATHS = {
    "zh-CN": "/",
    "en-US": "/en/",
    "ja-JP": "/ja/",
    "ko-KR": "/ko/",
    "es-ES": "/es/",
}

FAQ_PAIRS = [
    ("faq.chat.q", "faq.chat.a"),
    ("faq.account.q", "faq.account.a"),
    ("faq.codex.q", "faq.codex.a"),
    ("faq.down.q", "faq.down.a"),
]


def t(data, key, default=None):
    cur = data
    for part in key.split("."):
        if isinstance(cur, list) and part.isdigit():
            idx = int(part)
            if 0 <= idx < len(cur):
                cur = cur[idx]
            else:
                return default
        elif isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return default
    return cur if cur is not None else default


def page_url(site_url: str, lang: str) -> str:
    return site_url.rstrip("/") + LOCALE_PATHS[lang]


def hreflang_block(site_url: str) -> str:
    lines = []
    for lang, path in LOCALE_PATHS.items():
        lines.append(
            f'    <link rel="alternate" hreflang="{lang}" href="{site_url.rstrip("/")}{path}">'
        )
    lines.append(
        f'    <link rel="alternate" hreflang="x-default" href="{site_url.rstrip("/")}/">'
    )
    return "\n".join(lines)


def replace_attr_content(html_text: str, attr: str, name: str, value: str) -> str:
    pattern = rf'(<{attr}\b[^>]*\b(?:name|property)="{re.escape(name)}"[^>]*\bcontent=")[^"]*(")'
    new, n = re.subn(pattern, rf"\1{html.escape(value, quote=True)}\2", html_text, count=1)
    if n:
        return new
    # content before name/property
    pattern = rf'(<{attr}\b[^>]*\bcontent=")[^"]*("[^>]*\b(?:name|property)="{re.escape(name)}")'
    new, n = re.subn(pattern, rf"\1{html.escape(value, quote=True)}\2", html_text, count=1)
    return new if n else html_text


def replace_canonical(html_text: str, url: str) -> str:
    return re.sub(
        r'(<link\b[^>]*\brel="canonical"[^>]*\bhref=")[^"]*(")',
        rf"\1{url}\2",
        html_text,
        count=1,
    )


def replace_hreflang(html_text: str, site_url: str) -> str:
    block = hreflang_block(site_url)
    pattern = r'(?:[ \t]*<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*/?>[ \t]*\n)+'
    updated, n = re.subn(pattern, block + "\n", html_text, count=1)
    if n:
        return updated

    def inject(match: re.Match) -> str:
        return match.group(0) + "\n" + block

    updated, n = re.subn(
        r'[ \t]*<link rel="canonical" href="[^"]+"\s*/?>',
        inject,
        html_text,
        count=1,
    )
    if not n:
        raise SystemExit("Could not find canonical or hreflang links")
    return updated


def replace_text_nodes(html_text: str, translations: dict) -> str:
    def replacer(match: re.Match) -> str:
        tag, attrs, key, _inner = match.group("tag"), match.group("attrs"), match.group("key"), match.group("inner")
        value = t(translations, key)
        if not isinstance(value, str) or not value:
            return match.group(0)
        return f"<{tag}{attrs} data-i18n=\"{key}\"{match.group('after')}>{html.escape(value)}</{tag}>"

    # data-i18n may appear anywhere in the opening tag
    pattern = re.compile(
        r"<(?P<tag>[a-zA-Z][\w:-]*)(?P<attrs>[^>]*?)\sdata-i18n=\"(?P<key>[^\"]+)\"(?P<after>[^>]*)>(?P<inner>.*?)</(?P=tag)>",
        re.S,
    )
    return pattern.sub(replacer, html_text)


def replace_data_attrs(html_text: str, translations: dict) -> str:
    def make_replacer(attr_name: str, targets: list[str]):
        def replacer(match: re.Match) -> str:
            full = match.group(0)
            key = match.group("key")
            value = t(translations, key)
            if not isinstance(value, str) or not value:
                return full
            escaped = html.escape(value, quote=True)
            for target in targets:
                updated, n = re.subn(
                    rf'(?<![-\w])({target}=")[^"]*(")',
                    lambda m, v=escaped: m.group(1) + v + m.group(2),
                    full,
                    count=1,
                )
                full = updated
                if n == 0:
                    full = re.sub(
                        r'\s*/?>$',
                        lambda m, t=target, v=escaped: f' {t}="{v}"{m.group(0)}',
                        full,
                        count=1,
                    )
            return full

        return replacer

    html_text = re.sub(
        r"<[^>]*\bdata-i18n-alt=\"(?P<key>[^\"]+)\"[^>]*>",
        make_replacer("data-i18n-alt", ["alt"]),
        html_text,
    )
    html_text = re.sub(
        r"<[^>]*\bdata-i18n-aria-label=\"(?P<key>[^\"]+)\"[^>]*>",
        make_replacer("data-i18n-aria-label", ["aria-label", "title"]),
        html_text,
    )
    return html_text


def update_json_ld(html_text: str, site_url: str, lang: str, translations: dict) -> str:
    pattern = re.compile(
        r'(<script type="application/ld\+json">)(.*?)(</script>)',
        re.S,
    )
    match = pattern.search(html_text)
    if not match:
        return html_text
    data = json.loads(match.group(2))
    meta = translations.get("meta") or {}
    title = meta.get("title") or ""
    description = meta.get("description") or ""
    url = page_url(site_url, lang)
    root = site_url.rstrip("/") + "/"
    graph = data.get("@graph") if isinstance(data, dict) else None
    if not graph and isinstance(data, dict):
        graph = [data]
    if not graph:
        return html_text
    for node in graph:
        typ = node.get("@type")
        if typ == "WebSite":
            if title:
                node["name"] = title
            if description:
                node["description"] = description
            node["url"] = root
            node["inLanguage"] = lang
            node["image"] = root.rstrip("/") + "/og-image.png" if "chatgpt-plus.top" in site_url else node.get("image")
        elif typ == "FAQPage":
            node["inLanguage"] = lang
            node["@id"] = url + "#faq"
            entities = []
            for qk, ak in FAQ_PAIRS:
                q, a = t(translations, qk), t(translations, ak)
                if isinstance(q, str) and isinstance(a, str) and q and a:
                    entities.append(
                        {
                            "@type": "Question",
                            "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a},
                        }
                    )
            if entities:
                node["mainEntity"] = entities
    dumped = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return html_text[: match.start()] + match.group(1) + "\n    " + dumped + "\n    " + match.group(3) + html_text[match.end() :]



def replace_og_locales(html_text: str, lang: str) -> str:
    current = lang.replace("-", "_")
    others = [code.replace("-", "_") for code in LOCALE_PATHS if code != lang]
    block = f'    <meta property="og:locale" content="{current}">\n' + "\n".join(
        f'    <meta property="og:locale:alternate" content="{item}">' for item in others
    )
    pattern = r'[ \t]*<meta property="og:locale" content="[^"]+"\s*/?>[ \t]*\n(?:[ \t]*<meta property="og:locale:alternate" content="[^"]+"\s*/?>[ \t]*\n)*'
    updated, n = re.subn(pattern, block + "\n", html_text, count=1)
    if not n:
        raise SystemExit("Could not find og:locale tags")
    return updated



def fill_faq(html_text: str, translations: dict) -> str:
    items = t(translations, "faq.items")
    if not isinstance(items, list) or not items:
        return html_text
    blocks = []
    for item in items:
        if not isinstance(item, dict):
            continue
        question = item.get("question")
        answer = item.get("answer")
        if not isinstance(question, str) or not isinstance(answer, str) or not question or not answer:
            continue
        blocks.append(
            "                    <div class=\"faq-item\">\n"
            f"                        <h3 class=\"faq-question\">{html.escape(question)}</h3>\n"
            f"                        <p class=\"faq-answer\">{html.escape(answer)}</p>\n"
            "                    </div>"
        )
    if not blocks:
        return html_text
    inner = "\n".join(blocks)
    open_tag = '<div class="faq-container">'
    start = html_text.find(open_tag)
    if start < 0:
        raise SystemExit("Could not find faq-container")
    i = start + len(open_tag)
    depth = 1
    while i < len(html_text):
        next_open = re.search(r"<div\b", html_text[i:])
        next_close = html_text.find("</div>", i)
        if next_close < 0:
            raise SystemExit("Unclosed faq-container")
        next_open_at = i + next_open.start() if next_open else -1
        if next_open_at != -1 and next_open_at < next_close:
            depth += 1
            i = next_open_at + 4
            continue
        depth -= 1
        if depth == 0:
            end = next_close + len("</div>")
            return html_text[:start] + open_tag + "\n" + inner + "\n                </div>" + html_text[end:]
        i = next_close + len("</div>")
    raise SystemExit("Unclosed faq-container")


def ensure_faq_json_ld(html_text: str, site_url: str, lang: str, translations: dict) -> str:
    items = t(translations, "faq.items")
    entities = []
    if isinstance(items, list):
        for item in items:
            if not isinstance(item, dict):
                continue
            question = item.get("question")
            answer = item.get("answer")
            if isinstance(question, str) and isinstance(answer, str) and question and answer:
                entities.append(
                    {
                        "@type": "Question",
                        "name": question,
                        "acceptedAnswer": {"@type": "Answer", "text": answer},
                    }
                )
    if not entities:
        return html_text
    meta = translations.get("meta") or {}
    url = page_url(site_url, lang)
    root = site_url.rstrip("/") + "/"
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": root + "#website",
                "name": meta.get("title") or "",
                "url": root,
                "description": meta.get("description") or "",
                "inLanguage": lang,
                "image": root.rstrip("/") + "/assets/claude-icon.png",
            },
            {
                "@type": "FAQPage",
                "@id": url + "#faq",
                "isPartOf": {"@id": root + "#website"},
                "inLanguage": lang,
                "mainEntity": entities,
            },
        ],
    }
    dumped = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    script = f'    <script type="application/ld+json">\n    {dumped}\n    </script>\n'
    pattern = r'[ \t]*<script type="application/ld\+json">.*?</script>\n?'
    updated, n = re.subn(pattern, script, html_text, count=1, flags=re.S)
    if n:
        return updated
    return html_text.replace("</head>", script + "</head>", 1)


def prerender_locale(template: str, site_url: str, lang: str, translations: dict) -> str:
    meta = translations.get("meta") or {}
    title = meta.get("title") or ""
    description = meta.get("description") or ""
    url = page_url(site_url, lang)
    out = template
    out = re.sub(r'(<html\b[^>]*\blang=")[^"]*"', r'\1' + lang + '"', out, count=1)
    if title:
        out = re.sub(
            r"(<title\b[^>]*>)(.*?)(</title>)",
            rf"\1{html.escape(title)}\3",
            out,
            count=1,
            flags=re.S,
        )
    if description:
        out = replace_attr_content(out, "meta", "description", description)
        out = replace_attr_content(out, "meta", "og:description", description)
        out = replace_attr_content(out, "meta", "twitter:description", description)
    if title:
        out = replace_attr_content(out, "meta", "og:title", title)
        out = replace_attr_content(out, "meta", "twitter:title", title)
        out = replace_attr_content(out, "meta", "og:image:alt", title)
        out = replace_attr_content(out, "meta", "twitter:image:alt", title)
    logo = t(translations, "nav.logo")
    if isinstance(logo, str) and logo:
        out = replace_attr_content(out, "meta", "og:site_name", logo)
    out = replace_og_locales(out, lang)
    out = replace_attr_content(out, "meta", "og:url", url)
    out = replace_canonical(out, url)
    out = replace_hreflang(out, site_url)
    out = replace_text_nodes(out, translations)
    out = replace_data_attrs(out, translations)
    out = fill_faq(out, translations)
    out = ensure_faq_json_ld(out, site_url, lang, translations)
    return out


def write_sitemap(site_url: str, dest: Path, translations: dict, lastmod: str, extra_image: dict | None = None) -> None:
    root = site_url.rstrip("/")
    xhtml_links = "\n".join(
        f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{root}{path}"/>'
        for lang, path in LOCALE_PATHS.items()
    )
    xhtml_links += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{root}/"/>'
    xmlns_image = '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    blocks = []
    for lang, path in LOCALE_PATHS.items():
        loc = root + path
        priority = "1.0" if lang == "zh-CN" else "0.8"
        image_xml = ""
        if extra_image:
            title = t(translations[lang], extra_image["title_key"], extra_image.get("fallback_title", ""))
            image_xml = (
                "\n    <image:image>\n"
                f"      <image:loc>{extra_image['loc']}</image:loc>\n"
                f"      <image:title>{html.escape(title or extra_image.get('fallback_title', ''))}</image:title>\n"
                "    </image:image>"
            )
        blocks.append(
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            "    <changefreq>weekly</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            f"{xhtml_links}"
            f"{image_xml}\n"
            "  </url>"
        )
    header = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml"'
        + ("\n" + xmlns_image if extra_image else "")
        + ">\n"
    )
    dest.write_text(header + "\n".join(blocks) + "\n</urlset>\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True, help="Site root (Pages root) containing index.html and languages/")
    parser.add_argument("--site-url", required=True)
    parser.add_argument("--image-loc", default="")
    parser.add_argument("--image-title-key", default="meta.title")
    parser.add_argument("--image-title-fallback", default="")
    args = parser.parse_args()

    root = Path(args.root)
    template_path = root / "index.html"
    template = template_path.read_text(encoding="utf-8")
    translations = {}
    for lang in LOCALE_PATHS:
        translations[lang] = json.loads((root / "languages" / f"{lang}.json").read_text(encoding="utf-8"))

    for lang in LOCALE_PATHS:
        if lang == "zh-CN":
            # Keep Chinese homepage as the source; refresh hreflang/canonical and prerender FAQ.
            updated = replace_hreflang(template, args.site_url)
            updated = replace_canonical(updated, page_url(args.site_url, "zh-CN"))
            updated = fill_faq(updated, translations[lang])
            updated = ensure_faq_json_ld(updated, args.site_url, lang, translations[lang])
            if updated != template:
                template_path.write_text(updated, encoding="utf-8")
                template = updated
            continue
        html_out = prerender_locale(template, args.site_url, lang, translations[lang])
        dest_dir = root / lang.split("-")[0]
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / "index.html"
        dest.write_text(html_out, encoding="utf-8")
        print(f"Wrote {dest}")

    extra_image = None
    if args.image_loc:
        extra_image = {
            "loc": args.image_loc,
            "title_key": args.image_title_key,
            "fallback_title": args.image_title_fallback,
        }
    write_sitemap(
        args.site_url,
        root / "sitemap.xml",
        translations,
        date.today().isoformat(),
        extra_image,
    )
    print(f"Wrote {root / 'sitemap.xml'}")


if __name__ == "__main__":
    main()
