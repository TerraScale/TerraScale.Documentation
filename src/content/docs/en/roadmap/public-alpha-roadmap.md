---
title: Public Alpha Roadmap
description: Planned improvements for TerraScale during Public Alpha, including performance automation and higher database limits.
draft: true
sidebar:
  order: 3
---

This page covers the main improvements planned during Public Alpha. The focus is straightforward: make TerraScale faster to adopt, easier to tune, and more capable under real workloads.

For the full product view, see the [Public Roadmap](/roadmap/). For the current release stage, see [Public Alpha](/roadmap/public-alpha/).

## Overview

Public Alpha is already usable, but several important improvements are still ahead. The roadmap in this stage is centered on performance automation, better cache behavior, and more room to grow before teams need to think about database size limits.

## Planned Features

### Auto Indexing

TerraScale plans to automatically create indexes for frequently queried fields. The goal is to reduce manual tuning and help workloads reach good performance sooner, especially for teams that are still learning their query patterns.

### Auto Caching with Invalidation

Automatic query result caching is planned to improve read performance without requiring teams to hand-manage every cache decision. Cache invalidation is part of the design so cached results stay aligned with underlying data changes.

### Storage Limit Increase

The current Public Alpha limit is 100 GB per database. The roadmap includes increasing that limit to 500 GB per database so larger early workloads can stay on the platform without hitting the current guardrail too quickly.

### Manual Cache Controls

Alongside automatic caching, TerraScale plans to add manual cache controls for teams that want tighter control over behavior. That includes LRU eviction and explicit cache management for workloads that need predictable tuning.

## Timeline Notes

This roadmap is prioritized by user feedback and real usage patterns. There are no fixed public dates yet, and the order may shift as the team learns more from production-like workloads during Public Alpha.

## Request a Feature

Want to influence the roadmap? Join the [Discord community](https://discord.gg/8Zr2Nw9g) and share what your workload needs next.

For direct requests or follow-up questions, email [support@terrascale.com](mailto:support@terrascale.com).
