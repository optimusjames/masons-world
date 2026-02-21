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

## The stuff that actually drives traffic

Here's where I have to be honest about something. Everything above makes you findable. None of it makes you found. The difference matters.

Being findable means: when someone searches your name, your site shows up. That's table stakes. Being found means: people who don't know your name encounter your work. That's traffic. And traffic comes from one place -- other people linking to your stuff.

Google's entire algorithm, stripped to its core, is: pages that other pages link to are probably worth showing people. Every backlink is a vote. The more votes from reputable sources, the higher you rank. Everything else is optimization around the margins.

So how do you get links without doing marketing?

**Make things worth linking to.** This sounds circular but it's the whole game. A design experiment that does something interesting will get shared. A blog post with a genuine point of view will get quoted. An interactive tool that solves a real problem will get bookmarked and referenced. You can't optimize your way to this. You just have to make good stuff.

**Put it where people already are.** The content exists. You just need to drop it into the places where people who care about this stuff hang out. Not with a pitch. Not with a strategy. Just: "here's a thing I made."

The places that matter for technical/design work:

*Hacker News.* Submit interesting projects as "Show HN" posts. The audience is technical, opinionated, and clicks through to source. A front-page post generates thousands of visits and a trail of blog posts linking back to you. Even posts that don't hit the front page get indexed and create backlinks.

*Reddit.* Specific subreddits (r/webdev, r/nextjs, r/design, r/ClaudeAI) have built-in audiences for exactly this kind of work. Reddit's culture punishes self-promotion, so frame it as sharing something interesting rather than advertising. The work should speak for itself.

*DEV.to or Hashnode.* Cross-post a blog post with a canonical link back to your site. These platforms have large audiences, their own SEO weight, and the canonical tag tells Google your site is the original source. Free backlink, free distribution, zero downside.

**The 10-minute habit.** When you finish something you're proud of, spend 10 minutes posting it to one of those places. That's the entire strategy. You're already doing the hard part by making things. The distribution is a 10-minute habit on top of it.

**What to ask AI:**

```
I just finished [describe what you built]. Help me write a short,
authentic post to share on [Hacker News / Reddit / DEV.to]. It should
describe what the project does and what's interesting about it without
sounding like marketing. For Hacker News, format it as a "Show HN"
post. For DEV.to, include a canonical URL pointing back to the original
on my site.
```

## What I'm not going to do

I'm not going to start a YouTube channel. I'm not going to post daily on X. I'm not going to "build a personal brand." I'm not going to write SEO-optimized listicles or chase trending keywords.

The people who do LinkedIn + X + YouTube are building audiences. That's a full-time activity with its own skills, rhythms, and demands. If you enjoy that, great. I don't.

My approach is different: make interesting things, make them findable, and occasionally drop them where relevant people congregate. That's it. No funnel. No strategy. No content calendar.

Will this generate massive traffic? Probably not. But massive traffic was never the goal. The goal is: if someone Googles my name, they find a real site with real work. If someone searches for something I've written about, maybe they find that too. And if something I make is good enough to get shared organically, the infrastructure is there to capitalize on it.

## The checklist

If you're like me -- a developer who's been ignoring this stuff for years -- here's the whole list:

1. Add a sitemap (one file, auto-generates from your routes)
2. Add robots.txt (one file, three lines)
3. Add consistent page titles with a site-wide template
4. Add meta descriptions to your key pages
5. Add Open Graph tags (title, description, image)
6. Add JSON-LD structured data (Person schema, Article schema for blog posts)
7. Add a favicon (so you don't look like a placeholder in browser tabs)
8. Set up Google Search Console and submit your sitemap
9. Fill out your GitHub and LinkedIn profiles with your name and site URL
10. When you make something good, spend 10 minutes sharing it somewhere relevant

That's it. No ongoing maintenance. No weekly rituals. No tools to pay for. Just the basics that should have been there all along, plus the occasional habit of showing your work to people who might care about it.

**What to ask AI:**

```
Audit my site for SEO basics. Check whether I have: a sitemap,
robots.txt, meta descriptions on all pages, Open Graph tags, structured
data (JSON-LD), a favicon, and consistent page titles that include my
name. Tell me what's missing and fix it.
```

The whole thing took an afternoon. I'm annoyed I didn't do it ten years ago.
