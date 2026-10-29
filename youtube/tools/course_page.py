"""
Generate docs/learn/index.md (srv6.md/learn/) from youtube/course.yaml.

    venv/bin/python youtube/tools/course_page.py

Every lesson links to the srv6.md page it teaches from. When a lesson has
a `youtube:` video id, the page shows a Watch link and the track gets an
embedded playlist-style list of its published videos; until then the lesson
is marked "Video coming". Re-run after adding video ids.
"""

import json
import os

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(REPO, "docs", "learn", "index.md")


def rel(page):
    # docs/learn/index.md -> ../<page>
    return "../" + page


def main():
    with open(os.path.join(os.path.dirname(HERE), "course.yaml"), encoding="utf-8") as f:
        course = yaml.safe_load(f)

    # Shorts have no written lesson of their own: list them only once published
    def shown(t):
        return [l for l in t["lessons"] if l.get("format") != "short" or l.get("youtube")]
    tracks = [t for t in course["tracks"] if shown(t)]
    total = sum(len(shown(t)) for t in tracks)
    published = sum(1 for t in tracks for l in shown(t) if l.get("youtube"))
    lines = [
        "---",
        "title: Learn SRv6",
        'seo_title: "Learn SRv6: Free SRv6 Course with Videos and Labs"',
        'description: "Learn SRv6 for free: a structured course from SIDs and the SRH to TI-LFA, L3VPN, '
        'migration, vendor configs and AI fabrics, with written lessons, videos and hands-on labs."',
        "tags:",
        "  - srv6 course",
        "  - learn srv6",
        "  - srv6 training",
        "---",
        "",
        "# Learn SRv6: the free SRv6.md course",
        "",
        f"**{course['tagline']}** A structured, vendor-neutral SRv6 course with {total} lessons in "
        f"{len(tracks)} tracks. Every lesson is a written guide on srv6.md, a video on "
        + (f"the [SRv6.md YouTube channel]({course['channel_url']})" if course.get("channel_url")
           else "the SRv6.md YouTube channel (launching soon)")
        + " and, where it applies, a lab you can run on your laptop. No sign-up, no paywall, MIT licensed.",
        "",
        "!!! tip \"How to use the course\"",
        "    1. **Read** the lesson on srv6.md: every page cites the RFCs behind it.",
        "    2. **Watch** the video when you prefer to see it animated.",
        "    3. **Build it**: the [labs](../labs/index.md) reproduce each concept with free tools.",
        "    4. **Check yourself** with the FAQ at the end of each lesson.",
        "",
    ]
    if published == 0:
        lines += ["Video lessons are in production and will be published here track by track. "
                  "Every lesson already has its written guide.", ""]
    elif published < total:
        lines += [f"Videos are being published track by track: {published} of {total} are out. "
                  "Lessons marked *Video coming* already have their written guide.", ""]

    for t in tracks:
        video_col = published > 0
        lines += [f"## {t['title']}", "", f"**Level:** {t['level']}. {t['summary']}", "",
                  "| # | Lesson | Video |" if video_col else "| # | Lesson |",
                  "|:-:|--------|:-----:|" if video_col else "|:-:|--------|"]
        for n, l in enumerate(shown(t), 1):
            watch = (f"[:material-youtube: Watch](https://www.youtube.com/watch?v={l['youtube']})"
                     if l.get("youtube") else "*Video coming*")
            row = f"| {n} | [{l['title']}]({rel(l['page'])}) |"
            lines.append(row + (f" {watch} |" if video_col else ""))
        lines.append("")

    faq = [
        ("Is the SRv6.md course free?",
         "Yes. Every lesson, video and lab is free, with no sign-up. The written lessons are MIT licensed."),
        ("Where should I start learning SRv6?",
         "Start with Track 1, SRv6 Foundations, which begins with What is SRv6? and ends with SRv6 vs MPLS. "
         "If you already know Segment Routing with MPLS, you can jump to the uSID lesson."),
        ("Do I need real routers to follow the course?",
         "No. The labs run on a laptop with free tools such as Containerlab, netlab and FRRouting, and the "
         "packet captures open in Wireshark."),
        ("Is there a certificate?",
         "Not today. The course is a free learning path, not a vendor certification. It covers the vendor-neutral "
         "SRv6 knowledge that certifications such as Cisco CCIE Service Provider or Juniper JNCIE-SP also test."),
        ("Is the course available in Spanish?",
         "Yes. The SRv6 en español track covers the essential lessons in Spanish, and the written guides have "
         "Spanish and Japanese versions."),
    ]
    lines += ["## Frequently Asked Questions", ""]
    for q, a in faq:
        lines += [f"### {q}", "", a, ""]

    schema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Learn SRv6: The Free SRv6.md Course",
        "description": "A free, vendor-neutral course on Segment Routing over IPv6 (SRv6): SIDs, the SRH, uSID, "
                       "TI-LFA, SR Policy, BGP services, operations, migration from MPLS, vendor configuration "
                       "and SRv6 for AI networks.",
        "url": "https://srv6.md/learn/",
        "provider": {"@type": "Organization", "name": "SRv6.md", "sameAs": "https://srv6.md"},
        "isAccessibleForFree": True,
        "inLanguage": ["en", "es"],
        "educationalLevel": "Beginner to Advanced",
        "teaches": "Segment Routing over IPv6 (SRv6)",
        "numberOfCredits": 0,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD", "category": "Free"},
        "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "Online",
                              "courseWorkload": "PT10H"},
    }
    lines += ["## Further Reading", "",
              "- :material-arrow-right: [SRv6 Fundamentals and Key Concepts](../topics/index.md) - Every topic page",
              "- :material-arrow-right: [SRv6 documentation index](../docs/index.md) - Official docs for every vendor",
              "- :material-arrow-right: [SRv6 White Paper 2026](../white-papers/srv6-white-paper-2026.md) - "
              "Design and migration for architects",
              "",
              f'<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>', ""]

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"{OUT}: {total} lessons, {published} with video")


if __name__ == "__main__":
    main()
