---
title: Why We Built TerraScale (The Honest Version)
date: 2024-03-22
authors:
  - name: Mario GK
    title: Founder
tags:
  - behind-the-scenes
  - story
excerpt: Every startup has an origin story. Ours started with a $47,000 cloud bill and a lot of frustration. Here's the real story of why TerraScale exists.
---

Every startup has an origin story. Usually it's something inspiring - a founder sees a problem, has a vision, builds something amazing. Our story is a bit less glamorous. It started with a $47,000 cloud bill.

## The Bill That Changed Everything

Back in 2021, I was the tech lead at a mid-sized fintech startup. We were growing fast, which was great. We were also burning money on infrastructure, which was less great.

One month, our DynamoDB bill came in at $47,000. To be clear, this wasn't because DynamoDB is expensive - it's actually quite reasonable if you know what you're doing. The problem was that we didn't know what we were doing.

We had hot partitions we didn't know about. We were over-provisioning capacity because we were scared of throttling. We were storing data inefficiently because the access patterns had evolved and nobody had refactored the schema.

I spent the next three months becoming a DynamoDB expert out of pure necessity. Read every blog post, watched every re:Invent talk, experimented with every pattern. By the end, I'd cut our bill by 60% and our p99 latency by 80%.

But here's the thing: I shouldn't have had to do that. I should have been building features, not optimizing database internals.

## The Realization

After I left that job, I couldn't stop thinking about the problem. DynamoDB is genuinely brilliant technology. The single-digit millisecond latency, the seamless scaling, the durability guarantees - it's impressive engineering.

But it's also complex. Really complex. The learning curve is steep. The pricing model is confusing. The local development story is painful. And if you get the data modeling wrong, you're in for a world of hurt.

I started talking to other developers and heard the same story over and over. They loved the idea of a fast, scalable NoSQL database. They hated actually operating one.

## What We Decided to Build

The initial idea was simple: what if DynamoDB was easier?

Not dumbed down - easier. Same power, less friction. Here's what that meant in practice:

**Multiple query interfaces.** Some developers love SQL. Some want a DynamoDB-compatible API for easy migration. Some want a clean, modern REST API. Why force everyone into one paradigm?

**Transparent pricing.** Pay for storage and operations. Period. No capacity units to understand, no provisioned vs on-demand to choose between, no gotchas.

**First-class local development.** `docker run terrascale` and you have a local database that behaves exactly like production. No weird emulators, no "mostly compatible" caveats.

**Smart defaults.** Automatic indexing suggestions. Built-in caching. Sensible rate limiting. The database should help you, not just execute your commands blindly.

## Two Years Later

We shipped the first prototype in 2022. It was rough. The query planner was naive, the SDK was buggy, and the documentation was basically "read the code."

But it worked. And slowly, we made it work better.

Now we're handling billions of operations per month across customers in 40+ countries. We've got a real SDK (with more coming). The documentation is actual documentation.

Is it perfect? No. We're still a small team and there's a lot left to build. But it's solid. It's something I'd trust with my own production data - and I do.

## The Honest Part

Here's the thing nobody tells you about building infrastructure: it's terrifying. When your code has a bug, users see an error. When a database has a bug, users lose data.

We've made mistakes. We've had outages. We've shipped features that weren't ready and had to roll them back. That's part of building software.

What we haven't done is lose customer data. That's the line we will never cross. Everything else is fixable.

If you're thinking about trying TerraScale, know that you're not just getting a database. You're getting a team that's obsessed with getting this right. Every support ticket, every bug report, every piece of feedback - we take it seriously.

We built TerraScale because we wanted a better database. We're betting you want one too.
