---
title: "SEO for People Who Hate This Stuff"
subtitle: "A practical guide to being findable without becoming a marketer"
date: 2026-02-21
author: Josh Coolman
readingTime: 10 min
---

I've been building websites for twenty years and I never once set up Google Search Console. Never submitted a sitemap. Never added Open Graph tags. Never thought about structured data. I just built things, put them on the internet, and assumed the rest would sort itself out.

It mostly did. If you worked at a company, the company had an SEO person. If you freelanced, clients found you through referrals. The web was something you built on, not something you optimized for. Search was background radiation.

Then I started making things for myself. A personal site. Design experiments. Blog posts. And I realized: if someone Googles my name, what comes up? The answer was basically nothing. Twenty years of building websites and I was invisible to the thing that most people use to find websites.

So I spent an afternoon fixing it. And it turned out to be shockingly simple. Not "simple if you already know SEO" simple. Actually simple. Most of it was adding files that should have been there from the start.

Here's everything I did and why. And because I did all of this by talking to an AI agent, I've included the prompts that got the work done. Copy them. Paste them into whatever you're using. Adjust for your stack.

## The stuff Google needs to find you

Google is a robot that reads websites. It's sophisticated, but it still needs basic signals to know your site exists and what it's about.

**Sitemap.** This is literally a list of every page on your site. You create a file that says "here are my URLs, here's when they were last updated." Google reads it and knows what to crawl. In Next.js, this is a single TypeScript file that auto-generates from your routes. I went from zero to every page indexed in one file.

**robots.txt.** This tells crawlers what they're allowed to access. If you don't have one, Google figures it out anyway, but having one that explicitly says "crawl everything" and points to your sitemap removes any ambiguity. Another single file.

**Google Search Console.** This is the one thing you can't automate. You go to Google, verify you own your domain (add a DNS record), and submit your sitemap URL. That's it. Google now knows your site exists and will start crawling it on a schedule. You also get a dashboard showing what searches you appear in, which pages are indexed, and any problems Google found. It's free. It's not an upsell. I genuinely don't know why I never did this before.

**What to ask AI:**

```
Add a dynamic sitemap and robots.txt to my site. The sitemap should
auto-generate from all my routes and include lastModified dates where
available. The robots.txt should allow all crawlers and point to the
sitemap URL. My site is at [your-domain.com].
```

## The stuff Google needs to understand you

Finding your pages is step one. Understanding what they are is step two.

**Consistent page titles.** This is embarrassingly obvious in hindsight. If your page titles are generic or inconsistent, Google has a harder time understanding what your site is and who it belongs to. I added a title template so every page renders as "Page Title | Site Name" in the browser tab and in search results. Every page now reinforces what the site is about.

**Meta descriptions.** The two-line summary that appears under your link in Google results. If you don't write one, Google guesses, and it usually guesses badly. A single sentence describing each page gives you control over how you appear in search.

**Open Graph tags.** These control what your link looks like when someone shares it on social media, Slack, Discord, or iMessage. Without them, shared links show a generic title and no image. With them, you get a proper card with your title, description, and a preview image. This isn't strictly SEO, but it affects whether people click your links, which affects whether Google thinks your site is worth ranking.

**Structured data (JSON-LD).** This is metadata for robots. You embed a small JSON blob in your page that says "this is a person, here's their name and website" or "this is an article published on this date by this author." Google uses it to build those rich search results you see -- the ones with author info, publication dates, and sitelinks. It's a script tag with some JSON. Not hard.

Here's what all of this actually looks like in your page's `<head>`:

```html
<title>Design Experiments | Your Site Name</title>
<meta name="description" content="Interactive design experiments and writing." />
<meta property="og:title" content="Design Experiments | Your Site Name" />
<meta property="og:description" content="Interactive design experiments and writing." />
<meta property="og:type" content="website" />
<script type="application/ld+json">
  { "@type": "WebSite", "name": "Your Site Name", "url": "https://yoursite.com" }
</script>
```

If that looks like noise to you, don't worry about it. Your AI knows exactly what to do with the prompt below.

**What to ask AI:**

```
Upgrade the metadata on my site. I need:
- A title template so every page has a consistent suffix (e.g. "Page Title | Site Name")
- A default meta description that mentions me by name
- Open Graph tags (title, description, site name, type) on every page
- Twitter card defaults (summary_large_image)
- JSON-LD structured data: a Person schema with my name and links,
  and a WebSite schema with my site name and URL
- For blog posts specifically: Article schema with headline, date, and author
- Make sure every page that doesn't already export metadata gets a
  generateMetadata function
```

## What actually drives traffic

Honestly, I don't really care if anyone visits my site. I didn't do any of this to get traffic. I just didn't want to be ignorant about it anymore.

So I asked AI what actually matters beyond the technical basics, and the answer was simple: inbound links. Google's entire algorithm, stripped to its core, is that pages other pages link to are probably worth showing people. Every backlink is a vote. The more votes from reputable sources, the higher you rank. Everything else is optimization around the margins.

Here's the broad strokes of what I heard. Do your own research -- ask AI, read around, whatever -- but this is the gist:

**Make things worth linking to.** This sounds circular but it's apparently the whole game. Something interesting gets shared. A genuine point of view gets quoted. You can't optimize your way to this.

**Post it somewhere.** Hacker News, Reddit, DEV.to, wherever people who care about your kind of work hang out. Cross-posting to platforms like DEV.to with a canonical link back to your site gives you a free backlink. Sharing a project on Hacker News can apparently generate thousands of visits. The advice is to spend 10 minutes posting your work somewhere relevant whenever you finish something.

I'm not going to do any of this, to be honest. But there it is. Those are the basics of being visible and getting traffic, for what it's worth. Cheers.
