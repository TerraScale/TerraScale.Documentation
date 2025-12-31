---
title: Introducing TerraScale - A New Way to Think About NoSQL
date: 2024-03-15
authors:
  - name: Mario GK
    title: Founder
tags:
  - announcement
  - launch
excerpt: After two years of development, we're excited to announce TerraScale - a globally distributed NoSQL database that combines the power of DynamoDB with the simplicity developers deserve.
---

After two years of late nights, countless refactors, and way too much coffee, I'm thrilled to finally share what we've been building: TerraScale.

## The Problem We Set Out to Solve

I've spent the better part of a decade working with distributed databases. DynamoDB, Cassandra, MongoDB - you name it, I've probably debugged a production incident involving it at 3 AM.

And here's what always bugged me: these databases are incredibly powerful, but they make you pay a tax in complexity. Want to query your data? Learn a custom query language. Need to set up locally? Good luck with that Docker compose file. Want predictable pricing? Better get your calculator ready.

We thought there had to be a better way.

## What TerraScale Actually Is

TerraScale is a fully managed, globally distributed NoSQL database. If that sounds like a mouthful, here's the simpler version: it's a place to store your data that's fast everywhere in the world, doesn't go down, and doesn't require a PhD to operate.

A few things that make it different:

**Three ways to talk to your data.** Use our native API if you want maximum performance. Use the DynamoDB-compatible API if you're migrating an existing app. Or use SQL if you just want something familiar. Same data, your choice of interface.

**Actually simple pricing.** You pay for what you store and what you read/write. That's it. No capacity planning, no reserved instances, no surprise bills because you forgot to set an auto-scaling policy.

**Runs anywhere.** 19 regions across the globe. Your data stays close to your users, wherever they are.

## Who Is This For?

Honestly? Anyone who's tired of fighting their database.

We've been running a private beta for the past six months with about 50 companies. The use cases have been all over the map - real-time gaming leaderboards, IoT sensor data, e-commerce product catalogs, financial transaction logs.

The common thread is that these teams wanted something that would just work. They didn't want to become database experts. They wanted to ship their actual product.

## What's Next

Today marks our public launch. You can sign up at [dashboard.terrascale.io](https://dashboard.terrascale.io) and start building immediately. The free tier gives you enough room to build something real, not just a toy.

Over the coming months, we'll be shipping more SDKs (TypeScript and Go are next), more regions, and some features I'm genuinely excited about but can't talk about yet.

If you try TerraScale and love it, tell your friends. If you try it and something doesn't work right, tell us. We're a small team and we read every piece of feedback.

Here's to building something great together.

— Mario
