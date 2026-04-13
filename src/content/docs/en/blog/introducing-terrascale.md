---
title: Introducing TerraScale: A Better Way to Think About NoSQL
date: 2024-03-15
authors:
  - name: Mario GK
    title: Founder
tags:
  - announcement
  - launch
excerpt: After two years of development, we're excited to introduce TerraScale, a globally distributed NoSQL database that combines DynamoDB-style power with a simpler developer experience.
cover:
  wide: /images/blog/introducing-terrascale/cover-wide.svg
  square: /images/blog/introducing-terrascale/cover-square.svg
  alt: Illuminated horizon lines and a rising beacon suggesting a new global data platform emerging from darkness.
---

After two years of late nights, countless refactors, and way too much coffee, I'm thrilled to finally share what we've been building: TerraScale.

If you're new here, TerraScale is built for teams that want global scale without turning database operations into a full-time job. This post gives you the big picture. If you'd rather jump straight into the product, start with the [Getting Started guide](/guides/getting-started/).

## The Problem We Set Out to Solve

I've spent the better part of a decade working with distributed databases. DynamoDB, Cassandra, MongoDB, you name it, I've probably debugged a production incident involving it at 3 AM.

And here's what always bugged me: these databases are incredibly powerful, but they make you pay a tax in complexity. Want to query your data? Learn a custom query language. Need to set things up locally? Good luck with that Docker Compose file. Want predictable pricing? Better get your calculator ready.

We thought there had to be a better way.

## What TerraScale Actually Is

TerraScale is a fully managed, globally distributed NoSQL database. If that sounds like a mouthful, here's the simpler version: it's a place to store your data that's fast around the world, resilient by default, and doesn't require a PhD to operate.

A few things make it different:

**Three ways to talk to your data.** Use our native API if you want maximum performance. Use the DynamoDB-compatible API if you're migrating an existing app. Or use SQL if you just want something familiar. Same data, your choice of interface. If you're comparing approaches, the [API strategy guide](/guides/api-strategy/) is a good next stop.

**Actually simple pricing.** You pay for what you store and what you read and write. That's it. No capacity planning, no reserved instances, no surprise bills because you forgot to set an auto-scaling policy. For details, see the [pricing reference](/reference/pricing/).

**Runs anywhere.** 19 regions across the globe. Your data stays close to your users, wherever they are. When you're ready to grow beyond one region, the [replication reference](/reference/replication/) explains how that works.

Why this matters: most teams don't struggle because their database lacks features. They struggle because every useful feature adds more operational overhead. We built TerraScale to lower that overhead without taking away the power.

## Who Is This For?

Honestly, it's for anyone who's tired of fighting their database.

We've been running a Public Alpha for the past six months with about 50 companies. The use cases have been all over the map: real-time gaming leaderboards, IoT sensor data, e-commerce product catalogs, financial transaction logs.

The common thread is simple. These teams wanted something that would just work. They didn't want to become database experts. They wanted to ship their actual product.

## What's Next

Today marks our public launch. You can sign up at [dashboard.terrascale.io](https://dashboard.terrascale.io) and start building right away. The free tier gives you enough room to build something real, not just a toy.

Over the coming months, we'll be shipping more SDKs, more regions, and some features I'm genuinely excited about but can't talk about yet. If you want a preview of where things are headed, keep an eye on the [Public Alpha roadmap](/roadmap/).

If you try TerraScale and love it, tell your friends. If you try it and something doesn't work right, tell us. We're a small team and we read every piece of feedback.

Here's to building something great together.

- Mario
