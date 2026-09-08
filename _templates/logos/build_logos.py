# -*- coding: utf-8 -*-
"""Vendor the tech marks the site names, in full colour.

Two sources, in order of preference:

1. **devicon** (MIT) — real multi-colour marks. Python comes out blue
   *and* yellow, React in its own cyan. This is why the icons are not
   monochrome. It also carries AWS, Azure and Playwright, which Simple
   Icons had removed at the owners' request.
2. **simple-icons** (CC0) — single-path marks with one official brand
   colour, used only where devicon has nothing. The brand hex is baked
   into the file as a `fill`, so these are coloured too — just one
   colour, because that is all the source has.

Every mark is written as an ordinary SVG and rendered with `<img>`, so
gradients and multiple fills survive. An earlier version painted them
with a CSS mask, which forces a single colour by definition.

Only names appearing in index.md are copied.

    cd _templates/logos
    npm pack devicon      && tar -xzf devicon-*.tgz      && mv package devicon
    npm pack simple-icons && tar -xzf simple-icons-*.tgz && mv package simple
    cd ../.. && python _templates/logos/build_logos.py
"""
import io
import json
import os
import re
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
DEVICON = os.path.join(HERE, "devicon", "icons")
SIMPLE = os.path.join(HERE, "simple")
SRC = os.path.join(REPO, "index.md")
OUT_DIR = os.path.join(REPO, "assets", "img", "logos", "tech")
MANIFEST = os.path.join(REPO, "_data", "tech_logos.json")

# name in index.md -> devicon folder
DEVICON_ALIAS = {
    "Node.js": "nodejs",
    "C/C++": "cplusplus",
    "Express": "express",
    "Express.js": "express",
    "Next.js": "nextjs",
    "Next.js 15": "nextjs",
    "React 19": "react",
    "Tailwind CSS": "tailwindcss",
    "Tailwind v4": "tailwindcss",
    "Socket.IO": "socketio",
    "Postgres RLS": "postgresql",
    "PostgreSQL RLS": "postgresql",
    "PgBouncer": "postgresql",
    "Azure (App Service, Blob)": "azure",
    "GitHub Actions": "githubactions",
    "Material UI": "materialui",
    "RxJS": "rxjs",
    "Vite (widget bundle, Preact-aliased)": "vitejs",
    "Capacitor (iOS & Android)": "capacitor",
    "Google Gemini": "gemini",
    "Ollama (Llama, Qwen, Gemma)": "ollama",
    "Swagger/OpenAPI": "swagger",
    "OpenAPI": "swagger",
    "JavaScript (ES6+)": "javascript",
}

# name in index.md -> simple-icons slug, only where devicon has nothing
SIMPLE_ALIAS = {
    "Anthropic Claude": "claude",
    "Claude": "claude",
    "MCP": "modelcontextprotocol",
    "Model Context Protocol": "modelcontextprotocol",
    "Hybrid RAG": "qdrant",
    "TanStack": "tanstack",
    "TanStack Query": "tanstack",
    "TanStack Query + Virtual": "tanstack",
    "JWT + RBAC": "jsonwebtokens",
    "OWASP LLM Top 10": "owasp",
    "Gmail API": "gmail",
    "Google Calendar": "googlecalendar",
    "MSW": "mockserviceworker",
    "Neon": "neon",
    "Supabase": "supabase",
}

# Deliberately no mark. A concept, a practice, or a brand absent from
# both sets. These render as initials, never as a drawn substitute.
NO_MARK_REASON = {
    "SQL": "a language, not a product",
    "RAG": "a technique",
    "Embeddings": "a technique",
    "Eval harnesses": "a practice",
    "Guardrails": "a practice",
    "Prompt engineering": "a practice",
    "Multi-model routing": "a practice",
    "Prompt-injection resistance": "a practice",
    "HMAC signing": "a practice",
    "Adversarial testing": "a practice",
    "Outbox pattern": "a pattern",
    "Idempotency": "a pattern",
    "Idempotent processing": "a pattern",
    "Schema design": "a practice",
    "Query optimization": "a practice",
    "Microservices": "an architecture",
    "Integration testing": "a practice",
    "Deterministic agent testing": "a practice",
    "In-memory fakes": "a practice",
    "Golden-task eval harnesses": "a practice",
    "CEH v11": "a certification",
    "Shadow DOM": "a browser API",
    "AWS (EC2, S3, RDS, Lambda, IAM)":
        "devicon ships only a wordmark, unreadable at icon size",
    "OpenAI": "in neither icon set",
    "Groq": "in neither icon set",
    "Langfuse": "in neither icon set",
    "BullMQ": "in neither icon set",
    "WSO2": "in neither icon set",
    "WSO2 SSO": "in neither icon set",
    "Slack Bolt": "in neither icon set",
    "ICICI Payments": "in neither icon set",
    "Digilocker": "in neither icon set",
    "Microsoft Graph": "in neither icon set",
    "Supertest": "in neither icon set",
    "Avalanche": "in neither icon set",
    "ERC-20": "a token standard, not a product",
    "Metabase": "in neither icon set",
    "Razorpay": "in neither icon set",
}


def front_matter():
    return yaml.safe_load(io.open(SRC, encoding="utf-8").read().split("---")[1])


def tech_names(d):
    """Every string the page renders as a stack chip or toolkit cell."""
    names = []
    for g in d["skills"]:
        names += g["items"]
    for f in d["projects"]:
        names += f.get("stack", []) or []
        for c in f.get("parts", []) or []:
            names += c.get("stack", []) or []
    for e in d["experience"]:
        names += e.get("stack", []) or []
    out, seen = [], set()
    for n in names:
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


def norm(s):
    return re.sub(r"\s*\(.*?\)\s*", "", s.lower().strip()).strip()


def slugify(s):
    s = norm(s).replace("+", "plus").replace("&", "and").replace(".", "dot")
    return re.sub(r"[^a-z0-9]+", "", s)


def find_devicon(name):
    """Prefer the full-colour 'original' file, fall back to 'plain'."""
    d = DEVICON_ALIAS.get(name) or slugify(name)
    folder = os.path.join(DEVICON, d)
    if not os.path.isdir(folder):
        return None
    for variant in ("original", "plain"):
        f = os.path.join(folder, "%s-%s.svg" % (d, variant))
        if os.path.exists(f):
            return f, d
    return None


def find_simple(name, slugs, by_title):
    slug = SIMPLE_ALIAS.get(name)
    if not slug:
        t = norm(name)
        if t in by_title:
            slug = by_title[t].get("slug") or slugify(t)
        elif slugify(name) in slugs:
            slug = slugify(name)
    return slug if slug and slug in slugs else None


def main():
    if not os.path.isdir(DEVICON):
        sys.exit("Missing %s — see the header of this file." % DEVICON)

    icon_dir = os.path.join(SIMPLE, "icons")
    slugs, by_title, by_slug = set(), {}, {}
    if os.path.isdir(icon_dir):
        slugs = {f[:-4] for f in os.listdir(icon_dir) if f.endswith(".svg")}
        rows = json.load(io.open(os.path.join(SIMPLE, "data", "simple-icons.json"),
                                 encoding="utf-8"))
        rows = rows["icons"] if isinstance(rows, dict) else rows
        by_title = {r["title"].lower(): r for r in rows}
        for r in rows:
            by_slug[r.get("slug") or slugify(r["title"])] = r

    d = front_matter()
    names = tech_names(d)

    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)
    for f in os.listdir(OUT_DIR):
        os.remove(os.path.join(OUT_DIR, f))

    manifest, missing = {}, []
    n_dev = n_simple = 0

    for name in names:
        hit = find_devicon(name)
        if hit:
            path, slug = hit
            out_name = slug + ".svg"
            io.open(os.path.join(OUT_DIR, out_name), "w", encoding="utf-8",
                    newline="").write(io.open(path, encoding="utf-8").read())
            manifest[name] = {"file": "/assets/img/logos/tech/" + out_name,
                              "title": name, "source": "devicon"}
            n_dev += 1
            continue

        slug = find_simple(name, slugs, by_title)
        if slug:
            raw = io.open(os.path.join(icon_dir, slug + ".svg"),
                          encoding="utf-8").read()
            hexv = "#" + by_slug.get(slug, {}).get("hex", "555555")
            svg = re.sub(r"<title>.*?</title>", "", raw, flags=re.S)
            svg = svg.replace(' role="img"', "")
            # The source path has no fill of its own, so the brand
            # colour is written in rather than applied by CSS.
            svg = svg.replace("<svg ", '<svg fill="%s" ' % hexv, 1)
            out_name = slug + ".svg"
            io.open(os.path.join(OUT_DIR, out_name), "w", encoding="utf-8",
                    newline="").write(svg.strip() + "\n")
            manifest[name] = {"file": "/assets/img/logos/tech/" + out_name,
                              "title": by_slug.get(slug, {}).get("title", name),
                              "source": "simple-icons"}
            n_simple += 1
            continue

        missing.append(name)

    if not os.path.isdir(os.path.dirname(MANIFEST)):
        os.makedirs(os.path.dirname(MANIFEST))
    io.open(MANIFEST, "w", encoding="utf-8", newline="").write(
        json.dumps({"_sources": "devicon (MIT), simple-icons (CC0)",
                    "_generated_by": "_templates/logos/build_logos.py",
                    "icons": manifest}, indent=2, sort_keys=True) + "\n")

    print("tech names      : %d" % len(names))
    print("devicon, colour : %d" % n_dev)
    print("simple-icons    : %d  (one brand colour each)" % n_simple)
    print("initials        : %d\n" % len(missing))
    unexplained = [m for m in missing if m not in NO_MARK_REASON]
    for m in missing:
        print("   %-32s %s" % (m, NO_MARK_REASON.get(m, "** UNEXPLAINED **")))
    if unexplained:
        print("\n%d name(s) have no mark and no recorded reason. Add an alias "
              "or a NO_MARK_REASON entry so the gap stays a decision."
              % len(unexplained))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
