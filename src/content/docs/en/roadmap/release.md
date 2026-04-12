---
title: Release
description: What TerraScale aims to achieve before moving from Public Alpha to a stable release.
draft: true
sidebar:
  order: 4
---

Stable release is the point where TerraScale should feel dependable under real production pressure, not just feature complete. This stage is about proving that the platform behaves consistently when systems are healthy, stressed, or recovering.

For the current stage, see [Public Alpha](/roadmap/public-alpha/). For the broader product view, see the [Public Roadmap](/roadmap/).

## Release Goals

- Deliver a stable and predictable platform for production workloads
- Strengthen reliability across replication, failover, and recovery paths
- Improve developer experience with polish, clearer behavior, and fewer rough edges

## Reliability Focus

Stable release depends on operational trust. TerraScale needs to show durable replication, reliable regional failover, and automatic reconciliation after outages or transient network problems. The system should recover cleanly and keep operator intervention low when conditions are less than ideal.

## What Changes from Alpha

The goal of stable release is not to add a wave of new features. It is to harden what already exists. That means closing edge cases, reducing ambiguity, validating recovery paths, and improving the consistency of the overall platform experience.

The feature roadmap for Alpha remains on the [Public Alpha Roadmap](/roadmap/public-alpha-roadmap/).

## Stability Guarantees

Stable release should give users confidence in a few key areas:

- Data durability under normal operations and recovery scenarios
- Multi-region consistency that behaves predictably under replication pressure
- Graceful degradation when part of the system is impaired, rather than sudden or confusing failure modes

That is the standard TerraScale aims to meet before it should be presented as stable.
