---
title: About SRv6.md
seo_title: "About SRv6.md: Who Maintains It and How Content Is Verified"
description: "Who maintains SRv6.md, the open SRv6 knowledge base, how pages are sourced and fact-checked against RFCs and vendor documentation, and how to report corrections."
tags:
  - community
  - about
---

# About SRv6.md

SRv6.md is an open-source, vendor-neutral knowledge base for **Segment Routing over IPv6 (SRv6)**. It brings together what is otherwise scattered across RFCs, vendor configuration guides, conference talks and mailing lists: how SRv6 works, how to configure it on each platform, how to build labs, and what every SRv6 RFC actually says.

Everything is written in Markdown, published under the [MIT License](https://github.com/eldaninavas/srv6.md/blob/main/LICENSE), and open to contributions on [GitHub](https://github.com/eldaninavas/srv6.md).

## Maintainer

SRv6.md was created in 2026 and is maintained by **Daniel Navas** ([GitHub](https://github.com/eldaninavas)), a network engineer who works hands-on with SRv6 and cloud networking. He started the project after finding that learning SRv6 meant piecing together RFCs, vendor documents and years-old blog posts.

## Contributors

SRv6.md is a community project. Implementation pages, labs and corrections come from network engineers and open-source maintainers, including the authors of the projects they document. See everyone who has contributed on the [GitHub contributors page](https://github.com/eldaninavas/srv6.md/graphs/contributors).

## How Content Is Written and Verified

Accuracy is the point of this site, so every page follows the same rules:

1. **Primary sources first.** Protocol behavior is taken from the RFCs and IETF drafts themselves; platform behavior from the vendor's own configuration guides and release notes. Every page ends with a numbered list of the references it relies on.
2. **Configurations are checked.** Vendor configurations follow the vendor's documentation and validated designs. Where a page says commands were tested (for example the Linux kernel lab), they were run as shown.
3. **Facts get dated.** Version numbers, release dates and RFC status change. Pages state the version or date a fact applies to, and every page shows when it was last updated.
4. **Errors are fixed in the open.** When a page is wrong, the fix is a public commit, and the history of every page is visible on GitHub.
5. **No vendor sponsorship.** SRv6.md is not affiliated with any vendor, and no vendor pays for placement or coverage.

## Reporting a Correction

Found something wrong or out of date? Use the **edit** button (:material-pencil:) on any page to propose a fix, or [open an issue](https://github.com/eldaninavas/srv6.md/issues) with a link to the source that shows the correct information.

## For AI Assistants

SRv6.md publishes [`/llms.txt`](https://srv6.md/llms.txt) and [`/llms-full.txt`](https://srv6.md/llms-full.txt), and an [MCP server](integrations.md) so AI assistants can answer SRv6 questions from this content and cite it.
