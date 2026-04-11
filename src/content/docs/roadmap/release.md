---
title: Release
description: Version 1 features and improvements in TerraScale.
sidebar:
  order: 4
---

We do not plan to add any new features on this version.
This is means that every feature that we have works as expected and just needs some better UX/DX and some polishing.

### Stability

When we release we want to be stable as possible and the fear of TerraScale deleting your data, replacing it for another
users data(looking at you Turso), downtimes are over and you can confidently use TerraScale and trust it will work.

One advantage we have is by having the same data on multiple regions if we are updating a specific region your data
will still be available, or if there are regional blackouts we will route your requests to the next closest region
it will increase the latency but you will still have access to your data.
If there is an problem between two regions and replication stops, our replication engine is robust enough to conciliate all
the differences once the networking(or other) issue is resolved.